// Script para carregar temas dinamicamente e integrar com Framework7

// Protege contra múltiplos carregamentos do script
if (!window.__temasScriptLoaded) {
    window.__temasScriptLoaded = true;

    // Variável global protegida
    window.todosTemas = window.todosTemas || [];

    window.carregarTemas = function carregarTemas() {
        fetch('https://express-e3hm.onrender.com/temas')
            .then(resp => resp.json())
            .then(temas => {
                window.todosTemas = temas; // Salva todos os temas para filtro posterior
                renderizarTemas(temas);
            });
    };

    function renderizarTemas(temas) {
        const container = document.getElementById('temas-container');
        if (!container) return;
        container.innerHTML = '';
        // Remove todas as box-tema antigas
        document.querySelectorAll('.box-tema').forEach(el => el.remove());
        temas.forEach(tema => {
            // Card
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-tipo', tema.tipo); // Para facilitar o filtro
            card.innerHTML = `
                <img src="${tema.imagem}" alt="Capa do tema">
                <div class="conteudo">
                    <h2>${tema.titulo}</h2>
                    <button onclick="abrirTema('tema${tema.id}')">Acessar Tema</button>
                </div>
            `;
            container.appendChild(card);

            // Box-tema
            const box = document.createElement('div');
            box.className = 'box-tema';
            box.id = `tema${tema.id}`;
            let textosHtml = '';
            tema.textosMotivadores.forEach((tm, idx) => {
                if (tm.tipo === 'imagem') {
                    textosHtml += `<p>Texto ${idx + 1}:<br><img src="${tm.valor}" style="max-width:200px;max-height:200px;"></p>`;
                } else {
                    textosHtml += `<p>Texto ${idx + 1}: ${tm.valor}</p>`;
                }
            });
            box.innerHTML = `
                <h2>${tema.titulo}</h2>
                <h3>Textos Motivadores:</h3>
                ${textosHtml}
                <h3>Instruções:</h3>
                <p>${tema.instrucoes}</p>
                <h3>Proposta de Redação:</h3>
                <p>${tema.proposta}</p>
                <button onclick="escreverRedacao()">Escrever Redação</button>
                <button class="fechar" onclick="fecharTema('tema${tema.id}')">Fechar</button>
            `;
            document.body.appendChild(box);
        });
    }

    // Função de filtro por tipo
    window.filtrarTema = function(tipo) {
        if (!window.todosTemas.length) return;
        if (!tipo) {
            renderizarTemas(window.todosTemas);
        } else {
            renderizarTemas(window.todosTemas.filter(t => t.tipo && t.tipo.toLowerCase() === tipo.toLowerCase()));
        }
    };

    // Funções globais para abrir/fechar box-tema
    window.abrirTema = function(id) {
        document.getElementById(id).style.display = 'block';
    };
    window.fecharTema = function(id) {
        document.getElementById(id).style.display = 'none';
    };
    window.escreverRedacao = function() {
        alert("Modo de escrita de redação será implementado aqui!");
    };
}