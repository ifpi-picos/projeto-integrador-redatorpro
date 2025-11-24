document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "https://express-e3hm.onrender.com";
  const searchInput = document.querySelector(".search-box input");
  const modelFilter = document.querySelectorAll(".filter-dropdown select")[0];
  const editionFilter = document.querySelectorAll(".filter-dropdown select")[1];
  const correctionsGrid = document.querySelector(".corrections-grid");
  const paginationContainer = document.querySelector(".pagination");
  const feedbackElement = document.getElementById("filters-feedback");
  const resetButton = document.getElementById("reset-filters");
  const stateElement = document.getElementById("history-state");
  const statsElement = document.getElementById("totalCorrigido");

  const cardsPerPage = 6;
  let currentPage = 1;
  let historyData = [];
  let filteredData = [];

  function getToken() {
    try {
      const user = JSON.parse(localStorage.getItem("loggedUser") || "null");
      return user?.token || "";
    } catch (_) {
      return "";
    }
  }

  function setState(message, type = "info") {
    if (!stateElement) return;
    stateElement.textContent = message || "";
    stateElement.classList.toggle("error", type === "error");
    stateElement.style.display = message ? "block" : "none";
  }

  function hideState() {
    if (stateElement) {
      stateElement.style.display = "none";
    }
  }

  function updateStats(total) {
    if (!statsElement) return;
    statsElement.textContent = `${total} redação${total === 1 ? "" : "es"}`;
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (_) {
      return "";
    }
  }

  function formatScore(score) {
    if (typeof score !== "number" || Number.isNaN(score)) return "—";
    return Number.isInteger(score)
      ? score.toString()
      : score.toFixed(1).replace(".", ",");
  }

  function getEdition(item) {
    const reference = item?.corrigidaEm || item?.createdAt;
    if (!reference) return "";
    try {
      return new Date(reference).getFullYear().toString();
    } catch (_) {
      return "";
    }
  }

  function buildCard(item) {
    const card = document.createElement("div");
    card.className = "correction-card";

    const header = document.createElement("div");
    header.className = "card-header";

    const modelSpan = document.createElement("span");
    modelSpan.className = "card-model";
    modelSpan.textContent = (item.tipoCorrecao || "Modelo").toUpperCase();

    const editionSpan = document.createElement("span");
    editionSpan.className = "card-edition";
    editionSpan.textContent = getEdition(item) || "—";

    header.append(modelSpan, editionSpan);

    const body = document.createElement("div");
    body.className = "card-body";

    const dateDiv = document.createElement("div");
    dateDiv.className = "card-date";
    dateDiv.innerHTML = `<i class="far fa-calendar-alt"></i> ${
      formatDate(item.corrigidaEm || item.createdAt) || "—"
    }`;

    const studentDiv = document.createElement("div");
    studentDiv.className = "card-student";
    studentDiv.textContent = item.aluno?.name || "Aluno";

    const themeDiv = document.createElement("div");
    themeDiv.className = "card-theme";
    themeDiv.textContent = item.tema || "Tema não informado";

    const gradeDiv = document.createElement("div");
    gradeDiv.className = "card-grade";
    gradeDiv.innerHTML = `<i class="fas fa-star"></i> Nota: ${formatScore(
      item.notaTotal
    )}`;

    body.append(dateDiv, studentDiv, themeDiv, gradeDiv);

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const detailsBtn = document.createElement("button");
    detailsBtn.className = "btn btn-outline";
    detailsBtn.type = "button";
    detailsBtn.textContent = "Detalhes";
    detailsBtn.addEventListener("click", () => openCorrection(item.id));

    const reportBtn = document.createElement("button");
    reportBtn.className = "btn btn-primary";
    reportBtn.type = "button";
    reportBtn.textContent = "Ver relatório";
    reportBtn.addEventListener("click", () => openReport(item.id));

    actions.append(detailsBtn, reportBtn);

    card.append(header, body, actions);
    return card;
  }

  function openCorrection(essayId) {
    if (!essayId) return;
    window.location.href = `correcao.html?id=${encodeURIComponent(essayId)}`;
  }

  function openReport(essayId) {
    if (!essayId) return;
    window.location.href = `relatorio.html?id=${encodeURIComponent(essayId)}`;
  }

  function showNoResultsFeedback() {
    if (!feedbackElement || !correctionsGrid) return;
    feedbackElement.style.display = "block";
    if (feedbackElement.parentElement !== correctionsGrid) {
      correctionsGrid.appendChild(feedbackElement);
    }
  }

  function hideNoResultsFeedback() {
    if (feedbackElement) {
      feedbackElement.style.display = "none";
    }
  }

  function updatePagination(totalVisible) {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalVisible / cardsPerPage);
    paginationContainer.innerHTML = "";

    if (totalPages <= 1) return;

    const prevBtn = createPaginationButton("«", "prev");
    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage -= 1;
        renderPage();
      }
    });
    paginationContainer.appendChild(prevBtn);

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      const firstBtn = createPaginationButton("1");
      firstBtn.addEventListener("click", () => {
        currentPage = 1;
        renderPage();
      });
      paginationContainer.appendChild(firstBtn);

      if (startPage > 2) {
        const dots = createPaginationButton("...");
        dots.classList.add("disabled");
        paginationContainer.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i += 1) {
      const pageBtn = createPaginationButton(i);
      if (i === currentPage) pageBtn.classList.add("active");
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        renderPage();
      });
      paginationContainer.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = createPaginationButton("...");
        dots.classList.add("disabled");
        paginationContainer.appendChild(dots);
      }

      const lastBtn = createPaginationButton(totalPages);
      lastBtn.addEventListener("click", () => {
        currentPage = totalPages;
        renderPage();
      });
      paginationContainer.appendChild(lastBtn);
    }

    const nextBtn = createPaginationButton("»", "next");
    nextBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage += 1;
        renderPage();
      }
    });
    paginationContainer.appendChild(nextBtn);

    updatePaginationButtons(totalVisible);
  }

  function createPaginationButton(content, type) {
    const btn = document.createElement("div");
    btn.className = "page-btn";
    btn.textContent = content;

    if (type === "prev") btn.classList.add("prev");
    if (type === "next") btn.classList.add("next");

    return btn;
  }

  function updatePaginationButtons(totalVisible) {
    if (!paginationContainer) return;
    const totalPages = Math.ceil(totalVisible / cardsPerPage);
    const prevBtn = paginationContainer.querySelector(".prev");
    const nextBtn = paginationContainer.querySelector(".next");

    if (prevBtn) {
      prevBtn.classList.toggle("disabled", currentPage === 1);
    }

    if (nextBtn) {
      nextBtn.classList.toggle("disabled", currentPage === totalPages);
    }
  }

  function renderPage() {
    if (!correctionsGrid) return;
    hideState();
    correctionsGrid.innerHTML = "";

    if (!filteredData.length) {
      showNoResultsFeedback();
      paginationContainer && (paginationContainer.innerHTML = "");
      return;
    }

    hideNoResultsFeedback();
    const start = (currentPage - 1) * cardsPerPage;
    const pageItems = filteredData.slice(start, start + cardsPerPage);
    pageItems.forEach((item) => correctionsGrid.appendChild(buildCard(item)));
    updatePagination(filteredData.length);
  }

  function applyFilters(resetPage = true) {
    if (!historyData.length) return;
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const modelValue = (modelFilter?.value || "").toLowerCase();
    const editionValue = (editionFilter?.value || "").toLowerCase();

    filteredData = historyData.filter((item) => {
      const student = (item.aluno?.name || "").toLowerCase();
      const theme = (item.tema || "").toLowerCase();
      const model = (item.tipoCorrecao || "").toLowerCase();
      const edition = getEdition(item).toLowerCase();

      const matchesSearch =
        !searchTerm ||
        student.includes(searchTerm) ||
        theme.includes(searchTerm);
      const matchesModel = !modelValue || model.includes(modelValue);
      const matchesEdition = !editionValue || edition.includes(editionValue);

      return matchesSearch && matchesModel && matchesEdition;
    });

    if (resetPage) {
      currentPage = 1;
    }

    if (!filteredData.length) {
      correctionsGrid && (correctionsGrid.innerHTML = "");
      paginationContainer && (paginationContainer.innerHTML = "");
      hideState();
      showNoResultsFeedback();
      return;
    }

    renderPage();
  }

  async function loadHistory() {
    setState("Carregando histórico...");
    if (correctionsGrid) correctionsGrid.innerHTML = "";
    if (paginationContainer) paginationContainer.innerHTML = "";

    const token = getToken();
    if (!token) {
      setState("Faça login como corretor para ver o histórico.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/red-corretores/solicitacoes?status=corrigida`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar histórico.");
      }

      const payload = await response.json();
      historyData = Array.isArray(payload) ? payload : [];
      updateStats(historyData.length);

      if (!historyData.length) {
        setState("Você ainda não finalizou nenhuma correção.");
        return;
      }

      hideState();
      filteredData = historyData.slice();
      currentPage = 1;
      applyFilters(false);
    } catch (error) {
      console.error("[Histórico] Erro ao carregar:", error);
      setState(
        "Erro ao carregar histórico. Tente novamente mais tarde.",
        "error"
      );
    }
  }

  searchInput?.addEventListener("input", () => applyFilters(true));
  modelFilter?.addEventListener("change", () => applyFilters(true));
  editionFilter?.addEventListener("change", () => applyFilters(true));
  resetButton?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (modelFilter) modelFilter.value = "";
    if (editionFilter) editionFilter.value = "";
    applyFilters(true);
  });

  loadHistory();
});
