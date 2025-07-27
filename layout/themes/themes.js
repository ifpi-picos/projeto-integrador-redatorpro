document.addEventListener('DOMContentLoaded', function() {
    const themeOptions = document.querySelectorAll('.theme-option');
    const html = document.documentElement;
    
    // Carrega o tema salvo no localStorage ou usa o padrão
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    // Marca o tema ativo
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === savedTheme) {
            option.classList.add('active');
        }
    });
    
    // Adiciona event listeners para cada opção de tema
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            
            // Remove a classe active de todos os temas
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Adiciona a classe active ao tema selecionado
            this.classList.add('active');
            
            // Aplica o tema
            html.setAttribute('data-theme', theme);
            
            // Salva a preferência no localStorage
            localStorage.setItem('theme', theme);
        });
    });
});