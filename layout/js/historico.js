document.addEventListener('DOMContentLoaded', function() {
  // Elementos do DOM
  const searchInput = document.querySelector('.search-box input');
  const modelFilter = document.querySelectorAll('.filter-dropdown select')[0];
  const editionFilter = document.querySelectorAll('.filter-dropdown select')[1];
  const cards = document.querySelectorAll('.correction-card');
  const feedbackElement = document.getElementById('filters-feedback');
  const resetButton = document.getElementById('reset-filters');
  const correctionsGrid = document.querySelector('.corrections-grid');
  const paginationContainer = document.querySelector('.pagination');
  
  // Configurações
  const cardsPerPage = 6;
  let currentPage = 1;
  
  // Função principal de filtro
  function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const modelValue = modelFilter.value.toLowerCase();
    const editionValue = editionFilter.value.toLowerCase();
    
    let visibleCards = [];
    
    cards.forEach(card => {
      const student = card.querySelector('.card-student').textContent.toLowerCase();
      const theme = card.querySelector('.card-theme').textContent.toLowerCase();
      const model = card.querySelector('.card-model').textContent.toLowerCase();
      const edition = card.querySelector('.card-edition').textContent.toLowerCase();
      
      const matchesSearch = student.includes(searchTerm) || theme.includes(searchTerm);
      const matchesModel = !modelValue || model.includes(modelValue);
      const matchesEdition = !editionValue || edition.includes(editionValue);
      
      if (matchesSearch && matchesModel && matchesEdition) {
        card.classList.add('visible-card');
        visibleCards.push(card);
      } else {
        card.classList.remove('visible-card');
      }
      
      card.style.display = 'none';
    });
    
    // Atualizar paginação
    updatePagination(visibleCards);
    
    // Mostrar feedback se não houver cards visíveis
    if (visibleCards.length === 0) {
      showNoResultsFeedback();
    } else {
      hideNoResultsFeedback();
      showPage(visibleCards, 1); // Sempre voltar para a primeira página
    }
  }
  
  // Mostrar página específica
  function showPage(visibleCards, page) {
    currentPage = page;
    const start = (page - 1) * cardsPerPage;
    const end = start + cardsPerPage;
    
    // Esconder todos os cards visíveis primeiro
    visibleCards.forEach(card => card.style.display = 'none');
    
    // Mostrar apenas os cards da página atual
    visibleCards.slice(start, end).forEach(card => {
      card.style.display = 'flex';
    });
    
    // Atualizar botões de paginação
    updatePaginationButtons(visibleCards.length);
  }
  
  // Atualizar controles de paginação
  function updatePagination(totalVisible) {
    const totalPages = Math.ceil(totalVisible / cardsPerPage);
    paginationContainer.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Botão Anterior
    const prevBtn = createPaginationButton('«', 'prev');
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        const visibleCards = Array.from(document.querySelectorAll('.correction-card.visible-card'));
        showPage(visibleCards, currentPage - 1);
      }
    });
    paginationContainer.appendChild(prevBtn);
    
    // Botões de página
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
      const firstBtn = createPaginationButton('1');
      firstBtn.addEventListener('click', () => {
        const visibleCards = Array.from(document.querySelectorAll('.correction-card.visible-card'));
        showPage(visibleCards, 1);
      });
      paginationContainer.appendChild(firstBtn);
      
      if (startPage > 2) {
        const dots = createPaginationButton('...');
        dots.classList.add('disabled');
        paginationContainer.appendChild(dots);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = createPaginationButton(i);
      if (i === currentPage) pageBtn.classList.add('active');
      
      pageBtn.addEventListener('click', () => {
        const visibleCards = Array.from(document.querySelectorAll('.correction-card.visible-card'));
        showPage(visibleCards, i);
      });
      paginationContainer.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = createPaginationButton('...');
        dots.classList.add('disabled');
        paginationContainer.appendChild(dots);
      }
      
      const lastBtn = createPaginationButton(totalPages);
      lastBtn.addEventListener('click', () => {
        const visibleCards = Array.from(document.querySelectorAll('.correction-card.visible-card'));
        showPage(visibleCards, totalPages);
      });
      paginationContainer.appendChild(lastBtn);
    }
    
    // Botão Próximo
    const nextBtn = createPaginationButton('»', 'next');
    nextBtn.addEventListener('click', () => {
      const visibleCards = Array.from(document.querySelectorAll('.correction-card.visible-card'));
      const totalPages = Math.ceil(visibleCards.length / cardsPerPage);
      
      if (currentPage < totalPages) {
        showPage(visibleCards, currentPage + 1);
      }
    });
    paginationContainer.appendChild(nextBtn);
    
    // Atualizar estado dos botões
    updatePaginationButtons(totalVisible);
  }
  
  function createPaginationButton(content, type) {
    const btn = document.createElement('div');
    btn.className = 'page-btn';
    btn.textContent = content;
    
    if (type === 'prev') btn.classList.add('prev');
    if (type === 'next') btn.classList.add('next');
    
    return btn;
  }
  
  function updatePaginationButtons(totalVisible) {
    const totalPages = Math.ceil(totalVisible / cardsPerPage);
    const prevBtn = paginationContainer.querySelector('.prev');
    const nextBtn = paginationContainer.querySelector('.next');
    
    if (prevBtn) {
      prevBtn.classList.toggle('disabled', currentPage === 1);
    }
    
    if (nextBtn) {
      nextBtn.classList.toggle('disabled', currentPage === totalPages);
    }
  }
  
  // Mostrar mensagem de nenhum resultado
  function showNoResultsFeedback() {
    feedbackElement.style.display = 'block';
    if (!correctionsGrid.contains(feedbackElement)) {
      correctionsGrid.appendChild(feedbackElement);
    }
  }
  
  // Esconder mensagem de nenhum resultado
  function hideNoResultsFeedback() {
    feedbackElement.style.display = 'none';
  }
  
  // Resetar todos os filtros
  function resetFilters() {
    searchInput.value = '';
    modelFilter.value = '';
    editionFilter.value = '';
    applyFilters();
  }
  
  // Event Listeners
  searchInput.addEventListener('input', applyFilters);
  modelFilter.addEventListener('change', applyFilters);
  editionFilter.addEventListener('change', applyFilters);
  resetButton.addEventListener('click', resetFilters);
  
  // Inicializar
  applyFilters();
});