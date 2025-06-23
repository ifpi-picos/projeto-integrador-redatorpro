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
            })
            .catch(err => {
                console.error('[carregarTemas] Erro ao buscar temas:', err);
            });
    };

    function renderizarTemas(temas) {
        try {
            // Encontre o container da página atual
            const page = document.querySelector('.page[data-name="temas"]');
            if (!page) {
                console.error('[renderizarTemas] Página .page[data-name="temas"] não encontrada');
                return;
            }
            // Use page-content se existir, senão use a própria page
            const pageContent = page.querySelector('.page-content') || page;
            const container = pageContent.querySelector('#temas-container');
            if (!container) {
                console.error('[renderizarTemas] Container #temas-container não encontrado');
                return;
            }
            container.innerHTML = '';
            // Remove todas as box-tema antigas dentro da página
            pageContent.querySelectorAll('.box-tema').forEach(el => el.remove());
            temas.forEach(tema => {
                // Card
                const card = document.createElement('div');
                card.className = 'card';
                card.setAttribute('data-tipo', tema.tipo); // Para facilitar o filtro
                card.innerHTML = `
                    <img src="${tema.imagem}" alt="Capa do tema">
                    <div class="conteudo">
                        <h2>${tema.titulo}</h2>
                        <button type="button" onclick="abrirTema('tema${tema.id}')">Acessar Tema</button>
                    </div>
                `;
                container.appendChild(card);

                // Box-tema
                const box = document.createElement('div');
                box.className = 'box-tema';
                box.id = `tema${tema.id}`;
                let textosHtml = '';
                if (Array.isArray(tema.textosMotivadores)) {
                    tema.textosMotivadores.forEach((tm, idx) => {
                        if (tm.tipo === 'imagem') {
                            textosHtml += `<p>Texto ${idx + 1}:<br><img src="${tm.valor}" style="max-width:200px;max-height:200px;"></p>`;
                        } else {
                            textosHtml += `<p>Texto ${idx + 1}: ${tm.valor}</p>`;
                        }
                    });
                }
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
                // Adiciona a box-tema dentro da page-content
                pageContent.appendChild(box);
            });
            console.log('[renderizarTemas] Temas renderizados:', temas.length);
        } catch (err) {
            console.error('[renderizarTemas] Erro:', err);
        }
    }

    // Função de filtro por tipo
    window.filtrarTema = function(tipo) {
        try {
            if (!window.todosTemas.length) {
                console.warn('[filtrarTema] Nenhum tema carregado');
                return;
            }
            if (!tipo) {
                renderizarTemas(window.todosTemas);
            } else {
                renderizarTemas(window.todosTemas.filter(t => t.tipo && t.tipo.toLowerCase() === tipo.toLowerCase()));
            }
        } catch (err) {
            console.error('[filtrarTema] Erro:', err);
        }
    };

    // Funções globais para abrir/fechar box-tema
    window.abrirTema = function(id) {
        try {
            const page = document.querySelector('.page[data-name="temas"]');
            if (!page) {
                console.error('[abrirTema] Página .page[data-name="temas"] não encontrada');
                return;
            }
            const pageContent = page.querySelector('.page-content') || page;
            const el = pageContent.querySelector('#' + id);
            if (el) {
                el.style.display = 'block';
                console.log('[abrirTema] Exibindo:', id);
            } else {
                console.error('[abrirTema] Elemento #' + id + ' não encontrado');
            }
        } catch (err) {
            console.error('[abrirTema] Erro:', err);
        }
    };
    window.fecharTema = function(id) {
        try {
            const page = document.querySelector('.page[data-name="temas"]');
            if (!page) {
                console.error('[fecharTema] Página .page[data-name="temas"] não encontrada');
                return;
            }
            const pageContent = page.querySelector('.page-content') || page;
            const el = pageContent.querySelector('#' + id);
            if (el) {
                el.style.display = 'none';
                console.log('[fecharTema] Ocultando:', id);
            } else {
                console.error('[fecharTema] Elemento #' + id + ' não encontrado');
            }
        } catch (err) {
            console.error('[fecharTema] Erro:', err);
        }
    };
    window.escreverRedacao = function() {
        alert("Modo de escrita de redação será implementado aqui!");
    };
}