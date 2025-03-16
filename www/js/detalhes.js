// RECUPERAR O ID DETALHE DO LOCALSTORAGE
var id = parseInt(localStorage.getItem("detalhe"));

// PEGAR OS DADOS DOS CORRETORES DO LOCALSTORAGE
var corretores = JSON.parse(localStorage.getItem("corretores"));

var item = corretores.find((corretor) => corretor.id === id);

if (item) {
    console.log("Corretor encontrado: ", item);

    // ALIMENTAR A PÁGINA DETALHES
    $("#imagem-detalhe").attr("src", item.imagem);
    $("#nome-detalhe").html(item.nome);
    $("#especialidade-detalhe").html(item.especialidade);
    $("#rating-detalhe").html(item.rating);
    $("#like-detalhe").html(item.likes);
    $("#rewies-detalhe").html(item.rewies + " reviews");
    $("#descrição-detalhe").html(item.descrição);
} else {
    console.log("Corretor não encontrado");
}

// PEGAR A LISTA DE FAVORITOS
var listafav = JSON.parse(localStorage.getItem("listafav")) || [];

// VERIFICAR SE O CORRETOR JÁ ESTÁ NOS FAVORITOS AO CARREGAR A PÁGINA
var itemEmFavorito = listafav.find((f) => f.item.id === item.id);
if (itemEmFavorito) {
    $("#ad-card i").removeClass("ri-heart-3-line").addClass("ri-heart-fill");
}

// FUNÇÃO PARA ADICIONAR OU REMOVER DOS FAVORITOS
function toggleFavorito(item) {
    var index = listafav.findIndex((f) => f.item.id === item.id);
    let heartIcon = $("#ad-card i");

    if (index !== -1) {
        // Se já estiver nos favoritos, remover
        listafav.splice(index, 1);
        heartIcon.removeClass("ri-heart-fill").addClass("ri-heart-3-line");

        var toastRemove = app.toast.create({
            text: `${item.nome} removido(a) da sua lista de favoritos`,
            position: "center",
            closeTimeout: 2000,
        });

        toastRemove.open();
    } else {
        // Se não estiver nos favoritos, adicionar
        listafav.push({ item: item });
        heartIcon.removeClass("ri-heart-3-line").addClass("ri-heart-fill");

        var toastCenter = app.toast.create({
            text: `${item.nome} adicionado(a) à sua lista de favoritos`,
            position: "center",
            closeTimeout: 2000,
        });

        toastCenter.open();
    }

    // ATUALIZAR O LOCALSTORAGE
    localStorage.setItem("listafav", JSON.stringify(listafav));
}

// EVENTO DE CLIQUE NO BOTÃO
$("#ad-card").on("click", function () {
    toggleFavorito(item);
});
