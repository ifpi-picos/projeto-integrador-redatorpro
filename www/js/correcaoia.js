function renderCorrecaoIA() {
    console.log('[correcaoia.js] renderCorrecaoIA chamado');

    // Tenta obter os dados do localStorage
    const rawCorrecao = localStorage.getItem('correcaoIA');
    const rawUser = localStorage.getItem('loggedUser');
    console.log('[correcaoia.js] localStorage correcaoIA:', rawCorrecao);
    console.log('[correcaoia.js] localStorage loggedUser:', rawUser);

    let resposta = null;
    let user = null;
    try {
        resposta = JSON.parse(rawCorrecao);
    } catch (e) {
        console.warn('[correcaoia.js] Erro ao fazer parse do correcaoIA:', e);
    }
    try {
        user = JSON.parse(rawUser);
    } catch (e) {
        console.warn('[correcaoia.js] Erro ao fazer parse do loggedUser:', e);
    }

    const chat = document.getElementById('chat-container');
    console.log('[correcaoia.js] chat-container:', chat);

    if (!chat) {
        console.warn('[correcaoia.js] #chat-container não encontrado!');
        return;
    }

    // Limpa o chat
    chat.innerHTML = '';

    // Dados dinâmicos
    let userName = (user && user.name) ? user.name : "Usuário";
    let redacaoTexto = (resposta && resposta.texto) ? resposta.texto : null;
    let correcaoTexto = (resposta && resposta.correcao) ? resposta.correcao : null;

    console.log('[correcaoia.js] userName:', userName);
    console.log('[correcaoia.js] redacaoTexto:', redacaoTexto);
    console.log('[correcaoia.js] correcaoTexto:', correcaoTexto);

    if (!redacaoTexto && !correcaoTexto) {
        chat.innerHTML = `<div style="color:#888;text-align:center;margin-top:2rem;">Nenhuma redação corrigida encontrada.<br>Envie uma redação para ver a correção aqui.</div>`;
        console.log('[correcaoia.js] Nenhuma redação/correção encontrada.');
        return;
    }

    // Mensagem do usuário (avatar à direita)
    chat.innerHTML += `
      <div class="message user">
        <div class="bubble">
          <strong>${userName}</strong><br>
          ${redacaoTexto ? redacaoTexto.replace(/\n/g, '<br>') : "Nenhuma redação enviada."}
        </div>
        <div class="avatar user-avatar"></div>
      </div>
    `;
    console.log('[correcaoia.js] Mensagem do usuário adicionada.');

    // Mensagem do bot (avatar à esquerda)
    chat.innerHTML += `
      <div class="message bot">
        <div class="avatar bot-avatar"></div>
        <div class="bubble">
          <strong>ChatRedator</strong><br>
          ${correcaoTexto ? correcaoTexto.replace(/\n/g, '<br>') : "Nenhuma correção encontrada."}
        </div>
      </div>
    `;
    console.log('[correcaoia.js] Mensagem do bot adicionada.');
}

// Aguarda o Framework7 carregar a página e o elemento existir
document.addEventListener('page:afterin', function(e) {
    if (e.target && e.target.matches('.page[data-name="correcaoia"]')) {
        console.log('[correcaoia.js] page:afterin para correcaoia');
        setTimeout(renderCorrecaoIA, 50);
    }
});

// Fallback para acesso direto (não SPA)
document.addEventListener('DOMContentLoaded', function() {
    console.log('[correcaoia.js] DOMContentLoaded');
    setTimeout(renderCorrecaoIA, 50);
});

// Garante que o botão funcione ao navegar via Framework7 SPA
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnNovaRedacao') {
        console.log('[correcaoia.js] btnNovaRedacao clicado');
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