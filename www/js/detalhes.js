// RECUPERAR O ID DETALHE DO LOCALSTORAGE
var id = parseInt(localStorage.getItem('detalhe'));

// PEGAR OS DADOS DOS CORRETORES DO LOCALSTORAGE
var corretores = JSON.parse(localStorage.getItem('corretores'));

// LOCALIZAR O ITEM PELO ID
var item = corretores.find(corretor => corretor.id === id);

if (item) {
    // ACHOU OBJETO
    console.log('Corretor encontrado: ', item);

    // ALIMENTAR A PÁGINA DETALHES
    var imagemURL = item.profilePhoto 
        ? `https://backend-usuarios-redatorpro.onrender.com/uploads/${item.profilePhoto}` 
        : 'img/default-photo.png'; // Imagem padrão se não houver foto

    $("#imagem-detalhe").attr('src', imagemURL);
    $("#nome-detalhe").html(item.name);
    $("#especialidade-detalhe").html(item.specialty);
    $("#rating-detalhe").html(item.stars ? item.stars.toFixed(1) : 'N/A');
    $("#like-detalhe").html(item.likes);
    $("#rewies-detalhe").html(item.reviews + ' reviews');
    $("#descrição-detalhe").html(item.description);

} else {
    // NÃO ACHOU. ACHO PAIA
    console.log('Corretor não encontrado');
}

// PEGAR OU INICIALIZAR A LISTA DE FAVORITOS
var listafav = JSON.parse(localStorage.getItem('listafav')) || [];

// FUNÇÃO PARA ADICIONAR À LISTA DE FAVORITOS
function adicionarAFavoritos(item) {
    var itemEmFavorito = listafav.find(f => f.item.id === item.id);

    if (!itemEmFavorito) {
        listafav.push({ item: item });
    }

    // ATUALIZAR O LOCALSTORAGE DA LISTA FAVORITOS
    localStorage.setItem('listafav', JSON.stringify(listafav));
}

$("#ad-card").on('click', function () {
    adicionarAFavoritos(item);

    var toastCenter = app.toast.create({
        text: `${item.name} adicionado à sua lista de favoritos`,
        position: 'center',
        closeTimeout: 2000,
    });

    toastCenter.open();
});
