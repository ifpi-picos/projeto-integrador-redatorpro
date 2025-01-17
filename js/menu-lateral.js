document.getElementById('open_btn').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open-sidebar');
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
