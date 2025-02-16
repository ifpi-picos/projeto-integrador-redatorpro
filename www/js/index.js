// ALIMENTAR DE FORMA DINÂMICA A TELA INDEX ( FUNÇÕES )
fetch('js/backend.json')
.then(response => response.json())
.then(data => {
    // SALVAR DADOS DO BACK-END LOCALMENTE
    localStorage.setItem('functions', JSON.stringify(data));
    console.log('Dados das funções-card salvas no localStorage');

    setTimeout(() => {
        
        // ESVAZIAR A ÁREA DE FUNÇÕES
        $("#functions").empty();

        data.forEach(funcao => {
            var functionHTML = `
            <div class="item-card">
                <a href="${funcao.url}" class="item-function" data-rating="${funcao.rating}">
                    <div class="img-container">
                        <img src="${funcao.imagem}">
                    </div>
                    <div class="nome-rating">
                        <span class="color-gray function-name">${funcao.nome}</span>
                        <span class="bold margin-right">
                            <text class="skeleton-effect-wave funcao-premium">${funcao.rating}</text>
                            <i class="skeleton-effect-wave ${funcao.icone}"></i>
                        </span>
                    </div>
                </a>
            </div>
            `;

            $("#functions").append(functionHTML);
        });

        // Agora que os cartões foram adicionados, podemos adicionar o evento de clique
        //$(".item-function").on('click', function () {
            //app.dialog.alert('Essa função ainda não foi desenvolvida...', '<strong>Desculpa</strong> 🥺');
        //});

    }, 1000);

})
.catch(error => console.error('Error ao fazer fetch dos dados: ' + error));

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    console.log('Dados do usuário recuperados do localStorage:', user);

    if (user) {
        document.querySelector('#user_infos .item-description:nth-child(1)').textContent = user.name;
        document.querySelector('#user_infos .item-description:nth-child(2)').textContent = user.email;
    } else {
        console.warn('Nenhum usuário encontrado no localStorage. Redirecionando para login.');
        window.location.href = '../login.html';
    }
});
