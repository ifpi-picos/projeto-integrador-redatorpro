let sidebarIsOpen = false;

// Abre e fecha o menu lateral
document.getElementById('open_btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open-sidebar');
    sidebarIsOpen = !sidebarIsOpen;

    // Se o menu lateral for fechado, feche todos os submenus
    if (!sidebarIsOpen) {
        $('.feat-show, .serv-show').removeClass('show');
    }
});

// Mostra/esconde os itens do menu de recursos, apenas se o menu lateral estiver aberto
$('.feat-btn').click(() => {
    if (sidebarIsOpen) {
        $('nav ul .feat-show').toggleClass("show");
    }
});

// Mostra/esconde os itens do menu de serviços, apenas se o menu lateral estiver aberto
$('.serv-btn').click(() => {
    if (sidebarIsOpen) {
        $('nav ul .serv-show').toggleClass("show");
    }
});

// Fecha os submenus quando o usuário clica fora deles
document.addEventListener('click', (event) => {
    const isClickInside = event.target.closest('.feat-btn') || event.target.closest('.serv-btn');
    if (!isClickInside) {
        $('.feat-show, .serv-show').removeClass('show');
    }
});

$(document).ready(function() {
    // Variável para armazenar o estado atual do ícone
    let iconeAberto = false;

    $(".serv-btn").click(function() {
        // Encontra o ícone e altera o estado
        var icone = $(this).find("i");
        icone.toggleClass("fa-solid fa-folder-closed fa-solid fa-folder-open");
        iconeAberto = !iconeAberto;
    });

    // Evento de clique em qualquer lugar do documento
    $(document).click(function(event) {
        // Verifica se o clique não foi no link com a classe serv-btn
        
        if (!$(event.target).closest(".serv-btn").length && iconeAberto) {
            $(".serv-btn i").removeClass("fa-solid fa-folder-open").addClass("fa-solid fa-folder-closed");
            iconeAberto = false;
        }
    });
});