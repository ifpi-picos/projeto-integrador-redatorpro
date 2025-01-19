document.getElementById('open_btn').addEventListener('click', function () {
    const sidebar = document.getElementById('sidebar');
    
    // Alterna a classe 'open-sidebar' para abrir/fechar a sidebar
    sidebar.classList.toggle('open-sidebar');
    
    // Verifica se a sidebar está aberta
    if (sidebar.classList.contains('open-sidebar')) {
        const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

        if (loggedUser) {
            // Atualiza o nome e o email do usuário na sidebar
            document.getElementById('user.name').textContent = loggedUser.name;
            document.getElementById('user.email').textContent = loggedUser.email;
        } else {
            // Redireciona para a página de login se não houver usuário logado
            window.location.href = 'https://ifpi-picos.github.io/projeto-integrador-redatorpro/login';
        }
    }
});


// Seleciona todos os elementos que possuem a classe "side-item"
const sideItems = document.querySelectorAll('.side-item');

// Adiciona um evento de clique para cada item da barra lateral
sideItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove a classe "active" de todos os itens
        sideItems.forEach(i => i.classList.remove('active'));

        // Adiciona a classe "active" ao item clicado
        item.classList.add('active');
    });
});
