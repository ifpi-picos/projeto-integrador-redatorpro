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
            const page = document.querySelector('.page[data-name="temas"]');
            if (!page) {
                console.error('[renderizarTemas] Página .page[data-name="temas"] não encontrada');
                return;
            }
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
                card.setAttribute('data-tipo', tema.tipo);
                card.innerHTML = `
                    <img src="${tema.imagem}" alt="Capa do tema">
                    <div class="conteudo">
                        <h2>${tema.titulo}</h2>
                        <button type="button" onclick="abrirTema('tema${tema.id}', this)">Acessar Tema</button>
                    </div>
                `;
                container.appendChild(card);

                // Box-tema (criada, mas não inserida ainda)
                const box = document.createElement('div');
                box.className = 'box-tema';
                box.id = `tema${tema.id}`;
                let textosHtml = '';
                if (Array.isArray(tema.textosMotivadores)) {
                    tema.textosMotivadores.forEach((tm, idx) => {
                        const fonte = tm.fonte || tm.fonteMotivador || '';
                        if (tm.tipo === 'imagem') {
                            textosHtml += `<div style="margin-bottom:15px;">
                                <p>Texto ${idx + 1}:</p>
                                <img src="${tm.valor}" style="max-width:200px;max-height:200px;display:block;">
                                ${fonte ? `<div class="fonte-motivador"><small><b>Fonte:</b> ${fonte}</small></div>` : ''}
                            </div>`;
                        } else {
                            // Mantém a formatação original do texto (quebra de linha)
                            const textoFormatado = tm.valor
                                ? tm.valor.replace(/\n/g, '<br>')
                                : '';
                            textosHtml += `<div style="margin-bottom:15px;">
                                <p>Texto ${idx + 1}:<br>${textoFormatado}</p>
                                ${fonte ? `<div class="fonte-motivador"><small><b>Fonte:</b> ${fonte}</small></div>` : ''}
                            </div>`;
                        }
                    });
                }

                // Formatar instruções com quebra de linha preservada
                let instrucoesFormatadas = tema.instrucoes
                    ? tema.instrucoes.replace(/\n/g, '<br>')
                    : '';

                box.innerHTML = `
                    <h2>${tema.titulo}</h2>
                    <h3>Textos Motivadores:</h3>
                    ${textosHtml}
                    <h3>Instruções:</h3>
                    <p>${instrucoesFormatadas}</p>
                    <h3>Proposta de Redação:</h3>
                    <p>${tema.proposta ? tema.proposta.replace(/\n/g, '<br>') : ''}</p>
                    <button onclick="escreverRedacao()">Escrever Redação</button>
                    <button class="fechar" onclick="fecharTema('tema${tema.id}')">Fechar</button>
                `;
                // Salva referência para uso em abrirTema
                card._boxTema = box;
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
    window.abrirTema = function(id, btn) {
        try {
            // Remove qualquer overlay/modal antigo
            document.querySelectorAll('.tema-modal-overlay').forEach(el => el.remove());
            document.body.classList.add('tema-modal-open');

            // Recupera o tema pelo id
            let temaId = id.replace('tema', '');
            let tema = (window.todosTemas || []).find(t => String(t.id) === String(temaId));
            if (!tema) {
                console.error('[abrirTema] Tema não encontrado');
                return;
            }

            // Cria a box-tema dinamicamente
            const box = document.createElement('div');
            box.className = 'box-tema';
            box.id = id;

            // Botão X redondo para fechar
            const btnFechar = document.createElement('button');
            btnFechar.className = 'fechar-x';
            btnFechar.type = 'button';
            btnFechar.title = 'Fechar';
            btnFechar.innerHTML = '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;">&times;</span>';
            btnFechar.addEventListener('click', function(e) {
                e.stopPropagation();
                window.fecharTema(this.parentElement.id); // <-- Corrigido aqui
            });
            box.appendChild(btnFechar);

            let textosHtml = '';
            if (Array.isArray(tema.textosMotivadores)) {
                tema.textosMotivadores.forEach((tm, idx) => {
                    const fonte = tm.fonte || tm.fonteMotivador || '';
                    if (tm.tipo === 'imagem') {
                        textosHtml += `<div style="margin-bottom:15px;">
                            <p>Texto ${idx + 1}:</p>
                            <img src="${tm.valor}" style="max-width:200px;max-height:200px;display:block;">
                            ${fonte ? `<div class="fonte-motivador"><small><b>Fonte:</b> ${fonte}</small></div>` : ''}
                        </div>`;
                    } else {
                        const textoFormatado = tm.valor
                            ? tm.valor.replace(/\n/g, '<br>')
                            : '';
                        textosHtml += `<div style="margin-bottom:15px;">
                            <p>Texto ${idx + 1}:<br>${textoFormatado}</p>
                            ${fonte ? `<div class="fonte-motivador"><small><b>Fonte:</b> ${fonte}</small></div>` : ''}
                        </div>`;
                    }
                });
            }
            let instrucoesFormatadas = tema.instrucoes
                ? tema.instrucoes.replace(/\n/g, '<br>')
                : '';
            box.innerHTML += `
                <h2>${tema.titulo}</h2>
                <h3>Textos Motivadores:</h3>
                ${textosHtml}
                <h3>Instruções:</h3>
                <p>${instrucoesFormatadas}</p>
                <h3>Proposta de Redação:</h3>
                <p>${tema.proposta ? tema.proposta.replace(/\n/g, '<br>') : ''}</p>
                <button onclick="escreverRedacao('${tema.titulo}')">Escrever Redação</button>
            `;

            // Cria overlay/modal
            const overlay = document.createElement('div');
            overlay.className = 'tema-modal-overlay';
            overlay.appendChild(box);

            // Fecha ao clicar fora da box-tema
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    window.fecharTema(id);
                }
            });

            document.body.appendChild(overlay);

            box.style.display = 'block';
            console.log('[abrirTema] Exibindo:', id);
        } catch (err) {
            console.error('[abrirTema] Erro:', err);
        }
    };

    window.fecharTema = function(id) {
        try {
            document.body.classList.remove('tema-modal-open');
            document.querySelectorAll('.tema-modal-overlay').forEach(el => el.remove());
            console.log('[fecharTema] Ocultando:', id);
        } catch (err) {
            console.error('[fecharTema] Erro:', err);
        }
    };

    // Alteração: ao clicar em "escrever redação", salva o tema, fecha o modal e navega para iacorretor
    window.escreverRedacao = function(temaSelecionado) {
        try {
            // Fecha o modal corretamente antes de navegar
            document.body.classList.remove('tema-modal-open');
            document.querySelectorAll('.tema-modal-overlay').forEach(el => el.remove());

            if (temaSelecionado) {
                localStorage.setItem('temaPreSelecionado', temaSelecionado);
            }
            // Navega para a tela iacorretor
            if (window.app && app.views && app.views.main && app.views.main.router) {
                app.views.main.router.navigate('/iacorretor/');
            } else {
                window.location.href = 'iacorretor.html';
            }
        } catch (err) {
            console.error('[escreverRedacao] Erro:', err);
        }
    };
}