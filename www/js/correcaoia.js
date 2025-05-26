function renderCorrecaoIA() {
    const resposta = JSON.parse(localStorage.getItem('correcaoIA'));
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    const chat = document.getElementById('chat-container');
    if (!chat) return;

    // Limpa o chat
    chat.innerHTML = '';

    // Dados dinâmicos
    let userName = (user && user.name) ? user.name : "Usuário";
    let redacaoTexto = (resposta && resposta.texto) ? resposta.texto : "Nenhuma redação enviada.";
    let correcaoTexto = (resposta && resposta.correcao) ? resposta.correcao : "Nenhuma correção encontrada.";

    // Mensagem do usuário (avatar à direita)
    chat.innerHTML += `
      <div class="message user">
        <div class="bubble">
          <strong>${userName}</strong><br>
          ${redacaoTexto.replace(/\n/g, '<br>')}
        </div>
        <div class="avatar user-avatar"></div>
      </div>
    `;

    // Mensagem do bot (avatar à esquerda)
    chat.innerHTML += `
      <div class="message bot">
        <div class="avatar bot-avatar"></div>
        <div class="bubble">
          <strong>ChatRedator</strong><br>
          ${correcaoTexto.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
}

// Framework7: executa ao entrar na página via router SPA
document.addEventListener('page:init', function(e) {
    if (e.target && e.target.matches('.page[data-name="correcaoia"]')) {
        renderCorrecaoIA();
    }
});

// Fallback para acesso direto (não SPA)
document.addEventListener('DOMContentLoaded', function() {
    renderCorrecaoIA();
});

// Garante que o botão funcione ao navegar via Framework7 SPA
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnNovaRedacao') {
        if (window.app && app.views && app.views.main && app.views.main.router) {
            app.views.main.router.navigate('/iacorretor/');
        } else {
            window.location.href = 'iacorretor.html';
        }
    }
});

// Função para chat simulado (continua igual)
window.enviarMensagem = function () {
    const input = document.getElementById("input");
    const texto = input.value.trim();
    if (!texto) return;

    const chat = document.getElementById("chat-container");

    // Mensagem do usuário
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.innerHTML = `
        <div class="bubble">${texto}</div>
        <div class="avatar user-avatar"></div>
    `;
    chat.appendChild(userMessage);

    input.value = "";

    // Simula resposta do bot
    setTimeout(() => {
        const resposta = gerarRespostaSimulada(texto);
        const botMessage = document.createElement("div");
        botMessage.className = "message bot";
        botMessage.innerHTML = `
            <div class="avatar bot-avatar"></div>
            <div class="bubble">
                <strong>ChatRedator</strong><br>${resposta}
            </div>
        `;
        chat.appendChild(botMessage);
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
};

function gerarRespostaSimulada(redacao) {
    return "Sua mensagem foi recebida!";
}