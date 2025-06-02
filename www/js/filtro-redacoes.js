// filtro-redacoes.js

// Variável global para armazenar o filtro de especialidade selecionado
let currentSpecialtyFilter = "";

// Função chamada pelos botões de filtro (Geral, Enem, Vestibular)
function filtrarEspecialidade(specialty) {
  currentSpecialtyFilter = specialty.toLowerCase();
  atualizarLista();
}

// Função chamada a cada digitação no campo de busca ou quando o botão de busca é clicado
function filtrar() {
  atualizarLista();
}

// Função que atualiza a lista de redações de acordo com os filtros aplicados
function atualizarLista() {
  // Recupera os dados do localStorage ou usa um array vazio se não houver dados
  let redacoes = JSON.parse(localStorage.getItem('redacoes')) || [];
  
  // Obtém o termo de busca digitado e o converte para minúsculo
  let searchQuery = $("#inputBusca").val().trim().toLowerCase();
  
  // Limpa a área onde os cards serão exibidos
  $("#text-list").empty();
  $("#text-list-banco").empty();
  
  // Itera sobre cada redação para verificar se passa nos filtros
  redacoes.forEach(function(redacao) {
    // Verifica filtro por especialidade, se houver
    if (currentSpecialtyFilter && redacao.tipo.toLowerCase() !== currentSpecialtyFilter) {
      return;
    }
    
    // Verifica se o tema contém o termo de busca, se houver
    if (searchQuery && !redacao.tema.toLowerCase().includes(searchQuery)) {
      return;
    }
    
    // Realça o texto do tema em amarelo se corresponder ao termo buscado
    let highlightedTitle = redacao.tema;
    if (searchQuery) {
      // Cria uma expressão regular global e case-insensitive
      let regex = new RegExp(searchQuery, "gi");
      highlightedTitle = redacao.tema.replace(regex, function(match) {
        return `<span style="color: yellow;">${match}</span>`;
      });
    }
    
    // Monta o HTML do card, substituindo o tema pelo texto realçado
    let redacaoHTML = `
      <a data-id="${redacao.id}" href="#" class="item">
        <div class="card-${redacao.tipo}">
          <div class="left">
            <div class="icon">${redacao.icon}</div>
            <span class="title">${highlightedTitle}</span>
            <span class="subtitle">${redacao.tipo}</span>
          </div>
          <div class="right">
            <span class="label">Nota:</span>
            <span class="score">${redacao.nota}</span>
          </div>
        </div>
      </a>
    `;
    
    // Adiciona o card à área de listagem
    $("#text-list").append(redacaoHTML);
    $("#text-list-banco").append(redacaoHTML);
  });
}

// Inicializa a listagem e configura os eventos quando o DOM estiver pronto
$(document).ready(function() {
  atualizarLista();
  
  // Se houver botão de busca (a lupa), associa o clique para disparar a função de filtro
  $("#btnBusca").on("click", function() {
    filtrar();
  });
});
