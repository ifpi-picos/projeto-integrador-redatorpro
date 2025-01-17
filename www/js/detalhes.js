//RECUPERAR O ID DETALHE DO LOCALSTORAGE
var id = parseInt(localStorage.getItem('detalhe'));

//PEGAR OS DADOS DOS CORRETORES DO LOCALSTORAGE
var corretores = JSON.parse(localStorage.getItem('corretores'));

var item = corretores.find(corretor => corretor.id === id);

if(item){
    //ACHOU OBG
    console.log('Corretor encontrado: ', item);

    //ALIMENTAR A PÁGINA DETALHES
    $("#imagem-detalhe").attr('src', item.imagem);
    $("#nome-detalhe").html(item.nome);
    $("#especialidade-detalhe").html(item.especialidade);
    $("#rating-detalhe").html(item.rating);
    $("#like-detalhe").html(item.likes);
    $("#rewies-detalhe").html(item.rewies + 'reviews');
    $("#descrição-detalhe").html(item.descrição);

} else {
    //NÃO ACHOU. ACHO PAIA
    console.log('Corretor não encontrado');
}
var listafav = JSON.parse(localStorage.getItem('listafav')) || [];

//FUNÇÃO PARA ADICIONAR A LISTA DE FAVORITOS
function adicionarAFavoritos(item, quantidade){
    var itemEmFavorito = listafav.find(f=> f.item.id === item.id);

    if(itemEmFavorito){
        
    } else {
        listafav.push({
            item: item,
        })
    }

    //ATUALIZAR O LOCALSTROGE DA LISTA FAVORITOS
    localStorage.setItem('listafav', JSON.stringify(listafav));

}

$("#ad-card").on('click', function () {
    adicionarAFavoritos(item, 1);

    var toastCenter = app.toast.create({
        text: `${item.nome} adicionado a sua lista de favoritos`,
        position: 'center',
        closeTimeout: 2000,
      });

      toastCenter.open();

});