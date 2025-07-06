document.addEventListener('DOMContentLoaded', function() {
    const viewAllLink = document.querySelector('.view-all-link');
    const overlay = document.createElement('div');
    const modal = document.createElement('div');
    const activityItems = document.querySelectorAll('.activity-item');
    
    // Configura o overlay
    overlay.className = 'activity-overlay';
    document.body.appendChild(overlay);
    
    // Configura o modal
    modal.className = 'activity-modal';
    modal.innerHTML = `
        <button class="close-modal">&times;</button>
        <h2 class="section-title">
            <i class="fas fa-clock"></i> Todas as Atividades
        </h2>
        <div class="activity-list"></div>
    `;
    
    const modalList = modal.querySelector('.activity-list');
    
    // Clona e insere TODOS os itens no modal
    activityItems.forEach(item => {
        modalList.appendChild(item.cloneNode(true));
    });
    
    document.body.appendChild(modal);
    
    // Mostra apenas os 4 primeiros itens inicialmente
    activityItems.forEach((item, index) => {
        if (index >= 4) {
            item.style.display = 'none';
        }
    });
    
    // Abre o modal
    viewAllLink.addEventListener('click', function(e) {
        e.preventDefault();
        overlay.classList.add('overlay-active');
        modal.classList.add('modal-active');
        document.body.style.overflow = 'hidden';
    });
    
    // Fecha o modal
    function closeModal() {
        overlay.classList.remove('overlay-active');
        modal.classList.remove('modal-active');
        document.body.style.overflow = '';
    }
    
    overlay.addEventListener('click', closeModal);
    modal.querySelector('.close-modal').addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
});