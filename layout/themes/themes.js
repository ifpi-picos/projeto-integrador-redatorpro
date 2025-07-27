document.addEventListener('DOMContentLoaded', function() {
    const themeCards = document.querySelectorAll('.theme-card');
    const html = document.documentElement;
    
    // Carrega o tema salvo no localStorage ou usa o padrão
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    // Atualiza o ícone na navbar conforme o tema
    updateNavbarThemeIcon(savedTheme);
    
    // Marca o tema ativo
    themeCards.forEach(card => {
        if (card.getAttribute('data-theme') === savedTheme) {
            card.classList.add('active');
        }
    });
    
    // Adiciona event listeners para cada card de tema
    themeCards.forEach(card => {
        card.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            
            // Remove a classe active de todos os cards
            themeCards.forEach(c => c.classList.remove('active'));
            
            // Adiciona a classe active ao card selecionado
            this.classList.add('active');
            
            // Aplica o tema
            html.setAttribute('data-theme', theme);
            
            // Salva a preferência no localStorage
            localStorage.setItem('theme', theme);
            
            // Atualiza o ícone na navbar
            updateNavbarThemeIcon(theme);
        });
    });
    
    // Função para atualizar o ícone na navbar
    function updateNavbarThemeIcon(theme) {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
    
    // Opcional: Adiciona efeito de "click" visual
    themeCards.forEach(card => {
        card.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        card.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});