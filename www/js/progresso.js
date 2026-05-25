(function () {
  const API = "https://express-e3hm.onrender.com/progresso";
  const CHART_SRC =
    "https://cdn.jsdelivr.net/npm/chart.js@4.4.6/dist/chart.umd.min.js";
  const chartRefs = window.__progressCharts || {};
  let chartLoaderPromise = null;

  function ensureChartLibrary() {
    if (typeof window.Chart !== "undefined") return Promise.resolve();
    if (chartLoaderPromise) return chartLoaderPromise;

    chartLoaderPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${CHART_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", (err) => reject(err), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = CHART_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });

    return chartLoaderPromise;
  }

  function formatScore(value) {
    if (value === null || value === undefined || Number.isNaN(value))
      return "—";
    return Number.isInteger(value)
      ? value.toString()
      : value.toFixed(1).replace(".", ",");
  }

  function formatDate(value) {
    if (!value) return "—";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(value));
    } catch (e) {
      return "—";
    }
  }

  function showState({ loader, error, content }, state, message = "") {
    if (loader) loader.classList.toggle("hidden", state !== "loading");
    if (error) {
      error.textContent = message;
      error.classList.toggle("hidden", state !== "error");
    }
    if (content) content.classList.toggle("hidden", state !== "ready");
  }

  function destroyChart(id) {
    if (chartRefs[id]) {
      chartRefs[id].destroy();
      delete chartRefs[id];
    }
  }

  function createChart(id, type, data, options = {}) {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === "undefined") return;
    destroyChart(id);
    chartRefs[id] = new Chart(canvas.getContext("2d"), {
      type,
      data,
      options,
    });
    window.__progressCharts = chartRefs;
  }

  function renderSummary(overview = {}) {
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    setText("overview-media", formatScore(overview.mediaGeral));
    setText("overview-ia", overview.iaCount ?? 0);
    setText("overview-corretor", overview.corretorCount ?? 0);
    setText("overview-melhor", formatScore(overview.melhorNota));
    setText(
      "overview-total",
      `Total de redações ${overview.totalRedacoes ?? 0}`,
    );

    const ultima = document.getElementById("overview-ultima");
    if (ultima) {
      const nota = formatScore(overview.ultimaNota);
      const data = overview.ultimaAtualizacao
        ? formatDate(overview.ultimaAtualizacao)
        : "—";
      ultima.textContent = `Última nota ${nota} em ${data}`;
    }
  }

  function getTypeLabel(type) {
    if (type === "enem") return "ENEM";
    if (type === "vestibular") return "Vestibular";
    if (type === "concursos") return "Concurso";
    return "Redação";
  }

  function updateChartTitles(typeLabel) {
    const monthlyCard = document
      .querySelector("#chartMonthly")
      ?.closest(".chart-card");
    const barCard = document
      .querySelector("#chartCompetenciesBar")
      ?.closest(".chart-card");
    const radarCard = document
      .querySelector("#chartCompetenciesRadar")
      ?.closest(".chart-card");

    if (monthlyCard) {
      const monthlyTitle = monthlyCard.querySelector("header h3");
      const monthlyDesc = monthlyCard.querySelector("header .muted");
      if (monthlyTitle)
        monthlyTitle.textContent = `${typeLabel} — Evolução Mensal`;
      if (monthlyDesc)
        monthlyDesc.textContent = `Médias gerais e por tipo de correção para ${typeLabel}`;
    }
    if (barCard) {
      const barTitle = barCard.querySelector("header h3");
      const barDesc = barCard.querySelector("header .muted");
      if (barTitle)
        barTitle.textContent = `${typeLabel} — Médias por Competência`;
      if (barDesc)
        barDesc.textContent = `Comparativo das competências mais relevantes`;
    }
    if (radarCard) {
      const radarTitle = radarCard.querySelector("header h3");
      const radarDesc = radarCard.querySelector("header .muted");
      if (radarTitle)
        radarTitle.textContent = `${typeLabel} — Radar de Competências`;
      if (radarDesc)
        radarDesc.textContent = `Visão geral das habilidades avaliadas`;
    }
  }

  function getTypeSpecificChartConfig(type, payload) {
    const typeLabel = getTypeLabel(type);
    const monthlyLabels = payload.monthlyScores?.map((m) => m.label) || [];
    const monthlyIa = payload.monthlyScores?.map((m) => m.mediaIa ?? 0) || [];
    const monthlyHuman =
      payload.monthlyScores?.map((m) => m.mediaCorretor ?? 0) || [];
    const compLabels = payload.competencies?.map((c) => c.label) || [];
    const compValues = payload.competencies?.map((c) => c.average ?? 0) || [];
    const distribution = payload.distribution || {};

    if (type === "vestibular") {
      return {
        type: "bar",
        labels: compLabels,
        datasets: [
          {
            label: `${typeLabel} - Competências`,
            data: compValues,
            backgroundColor: "#6366f1",
          },
        ],
        options: {
          indexAxis: "y",
          responsive: true,
          scales: {
            x: {
              beginAtZero: true,
              suggestedMax: 200,
            },
          },
        },
        title: `${typeLabel} — Competências por núcleo`,
        subtitle: "Média das competências avaliadas no seu tipo de correção",
      };
    }

    if (type === "concursos") {
      return {
        type: "bar",
        labels: monthlyLabels,
        datasets: [
          {
            label: "IA",
            data: monthlyIa,
            backgroundColor: "#4caf50",
          },
          {
            label: "Corretores",
            data: monthlyHuman,
            backgroundColor: "#fb8c00",
          },
        ],
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              beginAtZero: true,
              stacked: true,
              suggestedMax: 100,
            },
          },
        },
        title: `${typeLabel} — Correções por fonte`,
        subtitle: "Volume de avaliações IA x humano nos últimos meses",
      };
    }

    return {
      type: "doughnut",
      labels: ["IA", "Corretores"],
      datasets: [
        {
          data: [distribution.ia ?? 0, distribution.corretor ?? 0],
          backgroundColor: ["#4caf50", "#ffb74d"],
          borderWidth: 0,
        },
      ],
      options: {
        responsive: true,
      },
      title: `${typeLabel} — Distribuição das correções`,
      subtitle: "Proporção entre correções por IA e por corretor",
    };
  }

  function renderCharts(payload) {
    const typeLabel = getTypeLabel(payload.selectedType);
    updateChartTitles(typeLabel);

    const monthlyLabels = payload.monthlyScores?.map((m) => m.label) || [];
    const monthlyGeneral =
      payload.monthlyScores?.map((m) => m.mediaGeral ?? 0) || [];
    const monthlyIa = payload.monthlyScores?.map((m) => m.mediaIa ?? 0) || [];
    const monthlyHuman =
      payload.monthlyScores?.map((m) => m.mediaCorretor ?? 0) || [];
    const compLabels = payload.competencies?.map((c) => c.label) || [];
    const compValues = payload.competencies?.map((c) => c.average ?? 0) || [];

    createChart(
      "chartMonthly",
      "line",
      {
        labels: monthlyLabels,
        datasets: [
          {
            label: "Média Geral",
            data: monthlyGeneral,
            borderColor: "#2196f3",
            backgroundColor: "rgba(33, 150, 243, 0.15)",
            tension: 0.35,
            fill: true,
            pointRadius: 4,
          },
          {
            label: "IA",
            data: monthlyIa,
            borderColor: "#4caf50",
            backgroundColor: "rgba(76, 175, 80, 0.15)",
            tension: 0.25,
            fill: false,
            borderDash: [4, 4],
          },
          {
            label: "Corretores",
            data: monthlyHuman,
            borderColor: "#ff9800",
            backgroundColor: "rgba(255, 152, 0, 0.2)",
            tension: 0.25,
            fill: false,
            borderDash: [6, 6],
          },
        ],
      },
      {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 1000,
          },
        },
      },
    );

    const totalIa = payload.distribution?.ia ?? 0;
    const totalCorretor = payload.distribution?.corretor ?? 0;

    createChart(
      "chartCompetenciesBar",
      "bar",
      {
        labels: compLabels,
        datasets: [
          {
            label: "Média",
            data: compValues,
            backgroundColor: "#1976d2",
          },
        ],
      },
      {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 200,
          },
        },
      },
    );

    createChart(
      "chartCompetenciesRadar",
      "radar",
      {
        labels: compLabels,
        datasets: [
          {
            label: "Competências",
            data: compValues,
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            borderColor: "#2196f3",
            pointBackgroundColor: "#2196f3",
          },
        ],
      },
      {
        scales: {
          r: {
            beginAtZero: true,
            suggestedMax: 200,
          },
        },
      },
    );

    const typeChartConfig = getTypeSpecificChartConfig(
      payload.selectedType,
      payload,
    );
    const typeChartTitle = document.getElementById("typeSpecificTitle");
    const typeChartSubtitle = document.getElementById("typeSpecificSubtitle");
    if (typeChartTitle) typeChartTitle.textContent = typeChartConfig.title;
    if (typeChartSubtitle)
      typeChartSubtitle.textContent = typeChartConfig.subtitle;

    createChart(
      "chartTypeSpecific",
      typeChartConfig.type,
      {
        labels: typeChartConfig.labels,
        datasets: typeChartConfig.datasets,
      },
      typeChartConfig.options,
    );
  }

  function renderRecent(list = []) {
    const container = document.getElementById("recent-list");
    if (!container) return;

    if (!list.length) {
      container.innerHTML =
        '<p class="muted">Ainda não há correções suficientes para exibir.</p>';
      return;
    }

    container.innerHTML = list
      .map(
        (item) => `
				<div class="recent-item">
					<div class="info">
						<h4>${item.tema || "Redação"}</h4>
						<div class="meta">
							${formatDate(item.data)} • <span class="badge ${
                item.fonte === "IA" ? "ia" : "corretor"
              }">${item.fonte}</span>
						</div>
					</div>
					<div class="score">${formatScore(item.nota)}</div>
				</div>
			`,
      )
      .join("");
  }

  function renderAIInsights(payload = {}) {
    const container = document.getElementById("insights-list");
    if (!container) return;

    const overview = payload.overview || {};
    const competencies = payload.competencies || [];
    const distribution = payload.distribution || {};
    const typeLabel = getTypeLabel(payload.selectedType);

    if (!overview.totalRedacoes) {
      container.innerHTML = `
        <article class="insight-card">
          <h4>Comece a praticar!</h4>
          <p>Envie sua primeira redação ${typeLabel} para receber recomendações personalizadas de IA e acompanhar seu progresso.</p>
        </article>`;
      return;
    }

    const lowCompetencies = competencies
      .filter((item) => item.average !== null && item.average < 120)
      .slice(0, 3);

    const insights = [];

    if (overview.mediaGeral !== null) {
      if (overview.mediaGeral >= 750) {
        insights.push({
          title: `${typeLabel}: bom desempenho geral`,
          description: `Sua média ${typeLabel.toLowerCase()} está sólida para esse tipo de redação. Continue mantendo a rotina de prática e busque aprimorar a consistência em cada competência.`,
        });
      } else if (overview.mediaGeral >= 550) {
        insights.push({
          title: `${typeLabel}: rendimento em crescimento`,
          description: `Você já tem uma boa base em ${typeLabel.toLowerCase()}. Foque em estruturar melhor seus argumentos e revisar a correção gramatical para subir ainda mais.`,
        });
      } else {
        insights.push({
          title: `${typeLabel}: oportunidade de evolução`,
          description: `Os resultados do ${typeLabel.toLowerCase()} mostram que vale a pena reforçar os pontos fracos: gramática, coerência e proposta de intervenção.`,
        });
      }
    }

    if (lowCompetencies.length) {
      insights.push({
        title: "Foco nas competências",
        description: `As competências com menor média são: ${lowCompetencies
          .map((item) => item.label)
          .join(", ")}. Dedique atividades específicas para cada uma.`,
      });
    }

    if (distribution.ia >= distribution.corretor) {
      insights.push({
        title: "Diversifique suas correções",
        description:
          "Você tem usado bastante a IA. Experimente também enviar algumas redações para corretores humanos para obter feedback mais detalhado e pedagógico.",
      });
    } else {
      insights.push({
        title: "Bom equilíbrio entre IA e corretores",
        description:
          "A combinação de IA e corretores pode acelerar sua evolução. Continue usando ambos para revisar diferentes aspectos do texto.",
      });
    }

    container.innerHTML = insights
      .map(
        (insight) => `
          <article class="insight-card">
            <h4>${insight.title}</h4>
            <p>${insight.description}</p>
          </article>`,
      )
      .join("");
  }

  async function fetchAIAnalysis(payload = {}) {
    const AI_API = API.replace("/progresso", "/ai-analysis");
    const user = JSON.parse(localStorage.getItem("loggedUser") || "null");
    try {
      const resp = await fetch(AI_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          overview: payload.overview || {},
          competencies: payload.competencies || [],
          distribution: payload.distribution || {},
          recent: payload.recent || [],
          selectedType: payload.selectedType || "all",
        }),
      });

      if (!resp.ok) return null;
      const data = await resp.json();
      return data.analysis || { fullText: data.fullText } || null;
    } catch (err) {
      console.error("fetchAIAnalysis error", err);
      return null;
    }
  }

  function renderAIAnalysisFromServer(analysis, payload = {}) {
    const container = document.getElementById("insights-list");
    if (!container) return;

    if (!analysis) {
      // fallback para heurística local
      return renderAIInsights(payload);
    }

    // se vier tips estruturadas
    if (Array.isArray(analysis.tips) && analysis.tips.length) {
      container.innerHTML = analysis.tips
        .map(
          (t) => `
          <article class="insight-card">
            <h4>${t.title}</h4>
            <p>${t.text}</p>
          </article>`,
        )
        .join("");
      return;
    }

    // se vier summary ou texto livre
    if (analysis.summary || analysis.fullText) {
      const text = analysis.summary || analysis.fullText;
      container.innerHTML = `
        <article class="insight-card">
          <h4>Análise</h4>
          <p>${text}</p>
        </article>`;
      return;
    }

    // fallback genérico
    renderAIInsights(payload);
  }

  let selectedType = "enem";

  async function fetchProgress(stateRefs) {
    const user = JSON.parse(localStorage.getItem("loggedUser") || "null");
    if (!user || !user.token) {
      showState(
        stateRefs,
        "error",
        "Faça login para visualizar seu progresso.",
      );
      return;
    }

    try {
      showState(stateRefs, "loading");
      const query = `?tipo=${encodeURIComponent(selectedType || "enem")}`;
      const resp = await fetch(`${API}${query}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!resp.ok) {
        throw new Error("Falha ao carregar indicadores.");
      }

      const data = await resp.json();
      renderSummary(data.overview || {});
      renderCharts(data);
      // solicita análise estruturada ao backend (Gemini)
      const ai = await fetchAIAnalysis(data);
      renderAIAnalysisFromServer(ai, data);
      renderRecent(data.recent || []);
      showState(stateRefs, "ready");
    } catch (err) {
      console.error("[initProgresso] Erro:", err);
      showState(
        stateRefs,
        "error",
        "Erro ao carregar progresso. Tente novamente.",
      );
    }
  }

  window.initProgresso = function () {
    const page = document.querySelector('[data-name="progresso"]');
    if (!page) {
      console.warn("Página de progresso não encontrada.");
      return;
    }

    const loader = page.querySelector("#progress-loader");
    const error = page.querySelector("#progress-error");
    const content = page.querySelector("#progress-content");
    const refreshBtn = page.querySelector("#btnRefreshProgresso");

    const typeFilterSelect = page.querySelector("#progress-type-filter");
    const stateRefs = { loader, error, content };

    selectedType = typeFilterSelect?.value || "enem";
    const runWithCharts = () =>
      ensureChartLibrary().then(() => fetchProgress(stateRefs));

    typeFilterSelect?.addEventListener("change", (event) => {
      selectedType = event.target.value || "enem";
      runWithCharts();
    });

    refreshBtn?.addEventListener("click", runWithCharts);

    ensureChartLibrary()
      .then(() => fetchProgress(stateRefs))
      .catch((err) => {
        console.error("Falha ao carregar Chart.js", err);
        showState(stateRefs, "error", "Não foi possível carregar os gráficos.");
      });
  };
})();
