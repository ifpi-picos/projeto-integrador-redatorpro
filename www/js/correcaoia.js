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
    let urlImage = (resposta && resposta.urlImage) ? resposta.urlImage : null;

    console.log('[correcaoia.js] userName:', userName);
    console.log('[correcaoia.js] redacaoTexto:', redacaoTexto);
    console.log('[correcaoia.js] correcaoTexto:', correcaoTexto);

    if (!redacaoTexto && !correcaoTexto && !urlImage) {
        chat.innerHTML = `<div style="color:#888;text-align:center;margin-top:2rem;">Nenhuma redação corrigida encontrada.<br>Envie uma redação para ver a correção aqui.</div>`;
        console.log('[correcaoia.js] Nenhuma redação/correção encontrada.');
        return;
    }

    // Mensagem do usuário (texto ou imagem)
    if (urlImage) {
        // Redação enviada como imagem
        chat.innerHTML += `
          <div class="message user">
            <div class="bubble">
              <strong>${userName}</strong><br>
              <button id="btnExibirRedacaoImg" style="margin:12px 0 8px 0; background:#246493;color:#fff;border:none;padding:8px 18px;border-radius:5px;cursor:pointer;">Exibir minha redação</button>
              <div id="containerRedacaoImg" style="display:none; margin-top:10px; text-align:center;">
                <img src="${urlImage}" alt="Redação enviada" style="max-width:98vw;max-height:420px;border-radius:8px;box-shadow:0 2px 8px #0002;display:block;margin:0 auto 12px auto;">
                <button id="btnOcultarRedacaoImg" style="background:#b00;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;">Ocultar redação</button>
              </div>
            </div>
            <div class="avatar user-avatar"></div>
          </div>
        `;
    } else {
        // Redação enviada como texto
        let redacaoHtml = "";
        if (redacaoTexto) {
            const textoNormalizado = normalizarRedacao(redacaoTexto);
            if (textoNormalizado.length > 300) {
                const textoCortado = textoNormalizado.slice(0, 300);
                // Garante que não corte no meio de uma palavra
                const ultimoEspaco = textoCortado.lastIndexOf(' ');
                const preview = textoCortado.slice(0, ultimoEspaco > 0 ? ultimoEspaco : 300);
                const restante = textoNormalizado.slice(preview.length);
                redacaoHtml = `
                  <span class="redacao-preview">${preview}</span>
                  <span class="redacao-restante" style="display:none;">${restante}</span>
                  <span class="ler-mais" style="color:#007acc; text-decoration:underline; cursor:pointer;">ler mais</span>
                  <span class="ler-menos" style="color:#007acc; text-decoration:underline; cursor:pointer; display:none;">ler menos</span>
                `;
            } else {
                redacaoHtml = textoNormalizado.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
            }
        } else {
            redacaoHtml = "Nenhuma redação enviada.";
        }
        chat.innerHTML += `
          <div class="message user">
            <div class="bubble">
              <strong>${userName}</strong><br>
              <p>${redacaoHtml}</p>
            </div>
            <div class="avatar user-avatar"></div>
          </div>
        `;
    }

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

    // Lógica para exibir/ocultar imagem da redação
    if (urlImage) {
        setTimeout(() => {
            const btnExibir = document.getElementById('btnExibirRedacaoImg');
            const btnOcultar = document.getElementById('btnOcultarRedacaoImg');
            const container = document.getElementById('containerRedacaoImg');
            if (btnExibir && container) {
                btnExibir.onclick = function () {
                    container.style.display = 'block';
                    btnExibir.style.display = 'none';
                };
            }
            if (btnOcultar && btnExibir && container) {
                btnOcultar.onclick = function () {
                    container.style.display = 'none';
                    btnExibir.style.display = 'inline-block';
                };
            }
        }, 50);
    }

    // Lógica para "ler mais" e "ler menos" da redação longa
    setTimeout(() => {
        const lerMais = chat.querySelector('.ler-mais');
        const lerMenos = chat.querySelector('.ler-menos');
        const restante = chat.querySelector('.redacao-restante');
        const preview = chat.querySelector('.redacao-preview');
        if (lerMais && lerMenos && restante && preview) {
            lerMais.onclick = function () {
                restante.style.display = 'inline';
                lerMais.style.display = 'none';
                lerMenos.style.display = 'inline';
            };
            lerMenos.onclick = function () {
                restante.style.display = 'none';
                lerMais.style.display = 'inline';
                lerMenos.style.display = 'none';
                // Scroll para garantir que o início do texto fique visível
                preview.scrollIntoView({behavior: "smooth", block: "nearest"});
            };
        }
    }, 50);

    // Ajusta o scroll para mensagens longas
    setTimeout(() => {
        const chat = document.getElementById('chat-container');
        if (chat) {
            chat.scrollTop = chat.scrollHeight;
        }
    }, 100);
}

// Sempre renderiza ao carregar o script
setTimeout(renderCorrecaoIA, 100);

// Fallback para acesso direto (não SPA)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(renderCorrecaoIA, 100);
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

    // Ajusta o scroll após adicionar mensagens
    setTimeout(() => {
        const chat = document.getElementById("chat-container");
        if (chat) {
            chat.scrollTop = chat.scrollHeight;
        }
    }, 1000);
};

function gerarRespostaSimulada(redacao) {
    return "Sua mensagem foi recebida!";
}

// Função para normalizar o texto da redação
function normalizarRedacao(texto) {
    if (!texto) return "";
    // Substitui \r\n por \n para padronizar
    texto = texto.replace(/\r\n/g, '\n');
    // Substitui 2 ou mais quebras de linha por um marcador temporário
    texto = texto.replace(/\n{2,}/g, '[[PARAGRAFO]]');
    // Remove quebras de linha simples (quebra de linha no meio de frases)
    texto = texto.replace(/\n/g, ' ');
    // Restaura as quebras de parágrafo
    texto = texto.replace(/\[\[PARAGRAFO\]\]/g, '\n\n');
    return texto;
}