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
      `Total de redações ${overview.totalRedacoes ?? 0}`
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

  function renderCharts(payload) {
    const monthlyLabels = payload.monthlyScores?.map((m) => m.label) || [];
    const monthlyGeneral =
      payload.monthlyScores?.map((m) => m.mediaGeral ?? 0) || [];
    const monthlyIa = payload.monthlyScores?.map((m) => m.mediaIa ?? 0) || [];
    const monthlyHuman =
      payload.monthlyScores?.map((m) => m.mediaCorretor ?? 0) || [];

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
      }
    );

    const totalIa = payload.distribution?.ia ?? 0;
    const totalCorretor = payload.distribution?.corretor ?? 0;
    createChart(
      "chartDistribution",
      "doughnut",
      {
        labels: ["IA", "Corretores"],
        datasets: [
          {
            data: [totalIa, totalCorretor],
            backgroundColor: ["#4caf50", "#ffb74d"],
            borderWidth: 0,
          },
        ],
      },
      {
        plugins: {
          legend: { position: "bottom" },
        },
      }
    );

    const compLabels = payload.competencies?.map((c) => c.label) || [];
    const compValues = payload.competencies?.map((c) => c.average ?? 0) || [];

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
      }
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
      }
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
			`
      )
      .join("");
  }

  async function fetchProgress(stateRefs) {
    const user = JSON.parse(localStorage.getItem("loggedUser") || "null");
    if (!user || !user.token) {
      showState(
        stateRefs,
        "error",
        "Faça login para visualizar seu progresso."
      );
      return;
    }

    try {
      showState(stateRefs, "loading");
      const resp = await fetch(API, {
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
      renderRecent(data.recent || []);
      showState(stateRefs, "ready");
    } catch (err) {
      console.error("[initProgresso] Erro:", err);
      showState(
        stateRefs,
        "error",
        "Erro ao carregar progresso. Tente novamente."
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

    const stateRefs = { loader, error, content };

    const runWithCharts = () =>
      ensureChartLibrary().then(() => fetchProgress(stateRefs));
    refreshBtn?.addEventListener("click", runWithCharts);

    ensureChartLibrary()
      .then(() => fetchProgress(stateRefs))
      .catch((err) => {
        console.error("Falha ao carregar Chart.js", err);
        showState(stateRefs, "error", "Não foi possível carregar os gráficos.");
      });
  };
})();
