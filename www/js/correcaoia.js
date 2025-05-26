document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM totalmente carregado.');

    const resposta = JSON.parse(localStorage.getItem('correcaoIA'));
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    const chat = document.getElementById('chat-container');

    // Limpa o chat
    chat.innerHTML = '';

    // Mensagem do usuário (redação enviada)
    let userName = (user && user.name) ? user.name : "Usuário";
    let redacaoTexto = (resposta && resposta.texto) ? resposta.texto : "Nenhuma redação enviada.";
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `
        <div class="bubble"><strong>${userName}</strong><br>${redacaoTexto.replace(/\n/g, '<br>')}</div>
        <div class="avatar user-avatar"></div>
    `;
    chat.appendChild(userMessage);

    // Mensagem do bot (correção recebida)
    let correcaoTexto = (resposta && resposta.correcao) ? resposta.correcao : "Nenhuma correção encontrada.";
    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    botMessage.innerHTML = `
        <div class="avatar bot-avatar"></div>
        <div class="bubble">
            <strong>ChatRedator</strong><br>${correcaoTexto.replace(/\n/g, '<br>')}
        </div>
    `;
    chat.appendChild(botMessage);

    // Função para chat simulado (continua igual)
    window.enviarMensagem = function () {
        const input = document.getElementById("input");
        const texto = input.value.trim();
        if (!texto) return;

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