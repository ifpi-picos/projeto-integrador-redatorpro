(function () {
  const REPERTORIOS_API_BASE =
    window.REPERTORIOS_API_BASE || "https://express-e3hm.onrender.com";

  const repertorioCategorias = [
    {
      key: "cinema",
      title: "Cinema",
      icon: "ri-movie-2-line",
      description: "Filmes, documentarios e series",
    },
    {
      key: "livros",
      title: "Livros",
      icon: "ri-book-3-line",
      description: "Obras literarias e ensaios",
    },
    {
      key: "conhecimentos-gerais",
      title: "Conhecimentos Gerais",
      icon: "ri-earth-line",
      description: "Historia, filosofia, geografia e atualidades",
    },
    {
      key: "dados-pesquisas",
      title: "Dados e Pesquisas",
      icon: "ri-bar-chart-grouped-line",
      description: "Indicadores, estudos e levantamentos",
    },
    {
      key: "citacoes",
      title: "Citacoes",
      icon: "ri-double-quotes-l",
      description: "Frases de autores para contextualizar temas",
    },
  ];

  const repertoriosFallback = [
    {
      id: "seed-cinema-1",
      category: "cinema",
      type: "Filme",
      title: "Tempos Modernos",
      coverUrl: "img/temposmodernos.jpg",
      genre: "Comedia dramatica",
      duration: "87 min",
      rating: "Livre",
      country: "Estados Unidos",
      thematicAxes: ["Trabalho", "Industrializacao", "Desigualdade"],
      streamingLinks: [
        "https://www.youtube.com/results?search_query=Tempos+Modernos",
      ],
      trailerUrl:
        "https://www.youtube.com/results?search_query=Tempos+Modernos+trailer",
      synopsis:
        "Charlie Chaplin critica a mecanizacao do trabalho e a perda da dignidade humana em meio a rotina industrial.",
      essayUse:
        "Pode ser usado em temas sobre precarizacao do trabalho, alienacao produtiva e impactos sociais da tecnologia.",
    },
    {
      id: "seed-book-1",
      category: "livros",
      title: "Quarto de Despejo",
      coverUrl: "img/quartodedespejo.jpg",
      genre: "Diario",
      pages: "200",
      thematicAxes: ["Desigualdade social", "Fome", "Moradia"],
      sourceLinks: ["https://www.google.com/search?q=Quarto+de+Despejo"],
      synopsis:
        "Carolina Maria de Jesus registra a rotina de fome, exclusao e resistencia na favela do Caninde.",
      essayUse:
        "Ajuda a discutir invisibilidade social, desigualdade estrutural e omissao do Estado.",
    },
    {
      id: "seed-knowledge-1",
      category: "conhecimentos-gerais",
      knowledgeArea: "Filosofia",
      title: "Contrato social",
      coverUrl: "img/rousseau.png",
      info: "A ideia de contrato social discute como individuos cedem parte de sua liberdade para viver em uma sociedade organizada por direitos e deveres.",
      sourceLinks: ["https://www.google.com/search?q=contrato+social+Rousseau"],
      thematicAxes: ["Cidadania", "Estado", "Direitos"],
      essayUse:
        "Serve para fundamentar argumentos sobre responsabilidade estatal, pacto coletivo e participacao cidada.",
    },
    {
      id: "seed-data-1",
      category: "dados-pesquisas",
      title: "Dados sociais brasileiros",
      info: "Dados publicos podem evidenciar problemas sociais e sustentar a tese com materialidade.",
      highlightedData: ["Use percentuais", "Compare periodos", "Cite a fonte"],
      sourceLinks: ["https://www.ibge.gov.br/"],
      thematicAxes: ["Politicas publicas", "Desigualdade", "Educacao"],
      essayUse:
        "Use os dados para comprovar a gravidade do problema antes de apresentar causas e intervencoes.",
    },
    {
      id: "seed-quote-1",
      category: "citacoes",
      title:
        "A educacao e a arma mais poderosa que voce pode usar para mudar o mundo.",
      author: "Nelson Mandela",
      thematicAxes: ["Educacao", "Transformacao social", "Cidadania"],
      essayUse:
        "A citacao pode abrir repertorios sobre o papel da educacao na reducao de desigualdades.",
    },
  ];

  let repertoriosState = [];
  let repertoriosSwipers = [];

  function normalizeList(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value)
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function getCategory(key) {
    return repertorioCategorias.find((category) => category.key === key);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function repertorioImage(item) {
    if (item.category === "citacoes") return "";
    if (
      item.coverUrl &&
      !String(item.coverUrl).toLowerCase().endsWith(".pdf")
    ) {
      return `<img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}">`;
    }
    const icon = getCategory(item.category)?.icon || "ri-bookmark-3-line";
    return `<div class="repertorio-card-icon"><i class="${icon}"></i></div>`;
  }

  function repertorioMeta(item) {
    if (item.category === "cinema")
      return [
        item.type,
        item.genre,
        item.duration,
        item.rating,
        item.country,
      ].filter(Boolean);
    if (item.category === "livros")
      return [item.genre, item.pages ? `${item.pages} paginas` : ""].filter(
        Boolean,
      );
    if (item.category === "conhecimentos-gerais")
      return [item.knowledgeArea].filter(Boolean);
    if (item.category === "citacoes") return [item.author].filter(Boolean);
    return [];
  }

  function createCard(item) {
    const axes = normalizeList(item.thematicAxes).slice(0, 3);
    const data = encodeURIComponent(JSON.stringify(item));
    const quoteClass =
      item.category === "citacoes" ? " repertorio-card-quote" : "";
    return `
    <div class="swiper-slide">
      <button class="repertorio-card${quoteClass}" type="button" data-repertorio="${data}">
        <div class="repertorio-cover">${repertorioImage(item)}</div>
        <div class="repertorio-card-body">
          <span class="repertorio-kind">${escapeHtml(getCategory(item.category)?.title || "Repertorio")}</span>
          <strong>${escapeHtml(item.title || "Sem titulo")}</strong>
          <small>${escapeHtml(repertorioMeta(item).join(" - "))}</small>
          <p>${escapeHtml(item.essayUse || item.synopsis || item.info || "")}</p>
          <div class="repertorio-tags">
            ${axes.map((axis) => `<span>${escapeHtml(axis)}</span>`).join("")}
          </div>
        </div>
      </button>
    </div>
  `;
  }

  function destroyRepertorioSwipers() {
    repertoriosSwipers.forEach(
      (swiper) => swiper && swiper.destroy && swiper.destroy(true, true),
    );
    repertoriosSwipers = [];
  }

  function renderRepertorios(items) {
    const container = document.getElementById("repertorios-sections");
    const empty = document.getElementById("repertorios-empty");
    if (!container) return;

    destroyRepertorioSwipers();
    const grouped = repertorioCategorias
      .map((category) => ({
        ...category,
        items: items.filter((item) => item.category === category.key),
      }))
      .filter((category) => category.items.length);

    empty.style.display = grouped.length ? "none" : "flex";
    container.innerHTML = grouped
      .map(
        (category) => `
        <section class="repertorio-section">
          <div class="repertorio-section-head">
            <div>
              <h2>${escapeHtml(category.title)} <i class="${category.icon}"></i></h2>
              <p>${escapeHtml(category.description)}</p>
            </div>
            <button class="repertorio-open-category" data-category="${category.key}" aria-label="Abrir ${escapeHtml(category.title)}">
              Veja todos <i class="ri-arrow-right-s-line"></i>
            </button>
          </div>
          <div class="swiper repertorio-swiper" data-category="${category.key}">
            <div class="swiper-wrapper">
              ${category.items.map(createCard).join("")}
            </div>
            <div class="swiper-pagination"></div>
          </div>
        </section>
      `,
      )
      .join("");

    container.querySelectorAll(".repertorio-card").forEach((card) => {
      card.addEventListener("click", () => {
        const item = JSON.parse(decodeURIComponent(card.dataset.repertorio));
        openRepertorioDetails(item);
      });
    });

    // botão "Veja todos" por categoria - navega para página específica ou filtra
    container
      .querySelectorAll(".repertorio-open-category")
      .forEach((button) => {
        button.addEventListener("click", (e) => {
          const cat = button.dataset.category;
          const map = {
            cinema: "filmes.html",
            livros: "livros.html",
            citacoes: "citacoes.html",
            "conhecimentos-gerais": "historia.html",
          };
          const target =
            map[cat] || `repertorios.html?category=${encodeURIComponent(cat)}`;
          try {
            if (
              typeof app !== "undefined" &&
              app.views &&
              app.views.main &&
              app.views.main.router
            ) {
              // tenta navegar com o router do Framework7
              app.views.main.router.navigate("/" + target.replace(/^\/+/, ""));
              return;
            }
          } catch (err) {
            // fallback
          }
          window.location.href = target;
        });
      });

    container.querySelectorAll(".repertorio-swiper").forEach((element) => {
      repertoriosSwipers.push(
        new Swiper(element, {
          slidesPerView: 1.15,
          spaceBetween: 14,
          loop: element.querySelectorAll(".swiper-slide").length > 2,
          autoplay: { delay: 2800, disableOnInteraction: false },
          breakpoints: {
            640: { slidesPerView: 2.2, spaceBetween: 16 },
            992: { slidesPerView: 3.3, spaceBetween: 18 },
            1200: { slidesPerView: 4.2, spaceBetween: 20 },
          },
          pagination: {
            el: element.querySelector(".swiper-pagination"),
            clickable: true,
          },
        }),
      );
    });
  }

  function linkList(title, links) {
    const list = normalizeList(links);
    if (!list.length) return "";
    return `
    <div class="repertorio-detail-group">
      <strong>${title}</strong>
      ${list.map((link) => `<a href="${escapeHtml(link)}" target="_blank" class="external">${escapeHtml(link)}</a>`).join("")}
    </div>
  `;
  }

  function openRepertorioDetails(item) {
    const axes = normalizeList(item.thematicAxes);
    const highlighted = normalizeList(item.highlightedData);
    const meta = repertorioMeta(item);
    const content = `
    <div class="repertorio-detail">
      ${repertorioImage(item)}
      <span class="repertorio-kind">${escapeHtml(getCategory(item.category)?.title || "")}</span>
      <h2>${escapeHtml(item.title || "")}</h2>
      ${meta.length ? `<p class="repertorio-detail-meta">${escapeHtml(meta.join(" - "))}</p>` : ""}
      ${item.synopsis ? `<div class="repertorio-detail-group"><strong>Sinopse</strong><p>${escapeHtml(item.synopsis)}</p></div>` : ""}
      ${item.info ? `<div class="repertorio-detail-group"><strong>Informacoes</strong><p>${escapeHtml(item.info)}</p></div>` : ""}
      ${highlighted.length ? `<div class="repertorio-highlight">${highlighted.map((data) => `<mark>${escapeHtml(data)}</mark>`).join("")}</div>` : ""}
      ${item.essayUse ? `<div class="repertorio-detail-group"><strong>Uso na redacao</strong><p>${escapeHtml(item.essayUse)}</p></div>` : ""}
      ${axes.length ? `<div class="repertorio-tags repertorio-detail-tags">${axes.map((axis) => `<span>${escapeHtml(axis)}</span>`).join("")}</div>` : ""}
      ${linkList("Streamings e links", item.streamingLinks)}
      ${linkList("Fontes e links uteis", item.sourceLinks)}
      ${item.trailerUrl ? linkList("Trailer", [item.trailerUrl]) : ""}
    </div>
  `;
    app.dialog
      .create({
        title: "Detalhes do repertorio",
        text: content,
        cssClass: "repertorio-dialog",
        buttons: [{ text: "Fechar" }],
        verticalButtons: true,
      })
      .open();
  }

  function filterRepertorios(term) {
    const search = String(term || "")
      .toLowerCase()
      .trim();
    if (!search) {
      renderRepertorios(repertoriosState);
      return;
    }
    renderRepertorios(
      repertoriosState.filter((item) =>
        [
          item.title,
          item.author,
          item.genre,
          item.knowledgeArea,
          item.info,
          item.synopsis,
          item.essayUse,
          normalizeList(item.thematicAxes).join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(search),
      ),
    );
  }

  async function fetchRepertorios() {
    // Tenta o endpoint local (mesma origem) primeiro; se falhar, usa o backend configurado.
    async function tryLocal() {
      try {
        const resp = await fetch("/repertorios", { credentials: "include" });
        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length) return data;
        }
      } catch (err) {
        // ignora erro local
      }
      return null;
    }

    try {
      const local = await tryLocal();
      if (local) return local;

      const url =
        String(REPERTORIOS_API_BASE).replace(/\/$/, "") + "/repertorios";
      const response = await fetch(url);
      if (!response.ok)
        throw new Error("Falha ao buscar repertorios no backend configurado");
      const data = await response.json();
      return Array.isArray(data) && data.length ? data : repertoriosFallback;
    } catch (error) {
      console.warn("Usando repertorios locais (fallback):", error);
      return repertoriosFallback;
    }
  }

  window.initRepertorio = async function () {
    const search = document.getElementById("busca-repertorios");
    const clear = document.getElementById("limpar-filtro-repertorios");
    const form = document.getElementById("form-busca-repertorios");

    repertoriosState = await fetchRepertorios();
    localStorage.setItem("repertorios", JSON.stringify(repertoriosState));
    renderRepertorios(repertoriosState);

    form?.addEventListener("submit", (event) => event.preventDefault());
    search?.addEventListener("input", (event) =>
      filterRepertorios(event.target.value),
    );
    clear?.addEventListener("click", () => {
      if (search) search.value = "";
      renderRepertorios(repertoriosState);
    });
  };

  window.initAdminRepertorio = function () {
    try {
      const btn = document.getElementById("adminPanelLink");
      const base =
        window.REPERTORIOS_API_BASE ||
        (window.location && window.location.origin) ||
        "";
      if (btn) {
        btn.href =
          String(base).replace(/\/$/, "") + "/admin/painel-repertorios.html";
        btn.target = "_blank";
      }
    } catch (err) {
      // ignore
    }
  };
})();
