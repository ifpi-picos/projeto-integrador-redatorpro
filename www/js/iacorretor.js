console.log('iacorretor.js carregado!');

window.initIACorretor = function () {
    // Elementos do modal de escolha
    const btnAbrirModalCorrecao = document.getElementById('btnAbrirModalCorrecao');
    const modalEscolha = document.getElementById('modalEscolhaCorrecao');
    const closeModalEscolha = document.getElementById('closeModalEscolha');
    const btnEscolherIA = document.getElementById('escolherIA');
    const btnEscolherCorretor = document.getElementById('escolherCorretor');
    const divCorretores = document.getElementById('corretoresDisponiveis');
    const listaCorretores = document.getElementById('listaCorretores');
    const pesquisaCorretor = document.getElementById('pesquisaCorretor');
    const tituloEscolhaCorrecao = document.getElementById('tituloEscolhaCorrecao');
    const opcoesCorrecao = document.getElementById('opcoesCorrecao');
    let listaCorretoresCache = [];
    console.log('initIACorretor chamado!');
    const areaNormal = document.getElementById('textoRedacao');
    const areaAmpliada = document.getElementById('textoRedacaoAmpliada');
    const btnDigitar = document.getElementById('btnDigitarRedacao');
    const writingArea = document.querySelector('.writing-area');
    const mobileActions = document.querySelector('.mobile-actions');
    const folhaAmpliadaOverlay = document.getElementById('folhaAmpliadaOverlay');
    const btnFecharFolha = document.getElementById('btnFecharFolha');
    const form = document.getElementById('formCorrecao');
    const imagemInput = document.getElementById('imagemUpload');


    // Substitui o submit padrão pelo modal de escolha, mas faz validação antes
    if (btnAbrirModalCorrecao && form) {
        btnAbrirModalCorrecao.addEventListener('click', function (e) {
            e.preventDefault();
            // Validação dos campos obrigatórios ANTES de abrir o modal
            const tipoCorrecao = document.getElementById('tipoCorrecao').value;
            const temaRedacaoSelect = document.getElementById('temaRedacao');
            const temaLivre = document.getElementById('temaLivre').value;
            const texto = areaNormal.value || "";
            const imagemFile = imagemInput && imagemInput.files && imagemInput.files[0] ? imagemInput.files[0] : null;
            if (!tipoCorrecao || !temaRedacaoSelect.value || (temaRedacaoSelect.value === 'livre' && !temaLivre) || (!texto.trim() && !imagemFile)) {
                alert('Preencha todos os campos obrigatórios e envie o texto OU a imagem.');
                return;
            }
            if (texto.trim() && imagemFile) {
                alert('Envie apenas o texto digitado OU a imagem da redação, nunca ambos ao mesmo tempo.');
                return;
            }
            if (modalEscolha) modalEscolha.style.display = 'flex';
            if (divCorretores) divCorretores.style.display = 'none';
        });
    }

    // Ao fechar o modal pelo X, sempre volta para o modo principal
    if (closeModalEscolha) {
        closeModalEscolha.addEventListener('click', function () {
            if (tituloEscolhaCorrecao) tituloEscolhaCorrecao.style.display = '';
            if (opcoesCorrecao) opcoesCorrecao.style.display = '';
            if (divCorretores) divCorretores.style.display = 'none';
            modalEscolha.style.display = 'none';
        });
    }

    // Ao escolher IA, segue fluxo normal
    if (btnEscolherIA) {
        btnEscolherIA.addEventListener('click', function () {
            modalEscolha.style.display = 'none';
            if (tituloEscolhaCorrecao) tituloEscolhaCorrecao.style.display = '';
            if (opcoesCorrecao) opcoesCorrecao.style.display = '';
            // Dispara o submit do form para IA
            submitParaIA();
        });
    }

    // Ao escolher Corretor, busca lista e exibe
    if (btnEscolherCorretor) {
        btnEscolherCorretor.addEventListener('click', async function () {
            if (tituloEscolhaCorrecao) tituloEscolhaCorrecao.style.display = 'none';
            if (opcoesCorrecao) opcoesCorrecao.style.display = 'none';
            if (divCorretores) divCorretores.style.display = 'block';
            if (listaCorretores) listaCorretores.innerHTML = '<div>Carregando corretores...</div>';
            if (pesquisaCorretor) pesquisaCorretor.value = '';
            // Buscar corretores disponíveis do backend
            try {
                const user = JSON.parse(localStorage.getItem('loggedUser'));
                const resp = await fetch('https://express-e3hm.onrender.com/red-corretores', {
                    headers: { 'Authorization': user && user.token ? `Bearer ${user.token}` : '' }
                });
                const corretores = await resp.json();
                listaCorretoresCache = Array.isArray(corretores) ? corretores : [];
                renderizarListaCorretores(listaCorretoresCache);
            } catch (err) {
                listaCorretores.innerHTML = '<div>Erro ao buscar corretores.</div>';
            }
        });
    }

    // Função para renderizar lista de corretores (com filtro)
    function renderizarListaCorretores(lista) {
        if (!listaCorretores) return;
        if (!lista || lista.length === 0) {
            listaCorretores.innerHTML = '<div>Nenhum corretor disponível no momento.</div>';
            return;
        }
        listaCorretores.innerHTML = '';
        lista.forEach(corretor => {
            const card = document.createElement('div');
            card.className = 'corretor-card';
            card.innerHTML = `
                <img src="${corretor.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(corretor.name)}" alt="Foto do corretor">
                <div class="corretor-info">
                    <div class="corretor-nome">${corretor.name}</div>
                    <div class="corretor-desc">${corretor.escolaridade || ''}</div>
                </div>
                <button class="corretor-enviar" data-id="${corretor.id}">Enviar</button>
            `;
            listaCorretores.appendChild(card);
        });
    }

    // Evento de pesquisa de corretores
    if (pesquisaCorretor) {
        pesquisaCorretor.addEventListener('input', function () {
            const termo = pesquisaCorretor.value.trim().toLowerCase();
            if (!termo) {
                renderizarListaCorretores(listaCorretoresCache);
                return;
            }
            const filtrados = listaCorretoresCache.filter(corretor =>
                corretor.name && corretor.name.toLowerCase().includes(termo)
            );
            renderizarListaCorretores(filtrados);
        });
    }

    // Delegação para botão "Enviar para este corretor"
    if (listaCorretores) {
        listaCorretores.addEventListener('click', function (e) {
            if (e.target && e.target.classList.contains('corretor-enviar')) {
                const corretorId = e.target.getAttribute('data-id');
                modalEscolha.style.display = 'none';
                submitParaCorretor(corretorId);
            }
        });
    }

    // Função para enviar para IA (fluxo atual)
    async function submitParaIA() {
        // Replicando o antigo handler de submit
        // ...existing code...
        // (copiado do antigo form.addEventListener('submit', ...), mas sem o preventDefault)
        //
        // Validação dos campos obrigatórios
        const tipoCorrecao = document.getElementById('tipoCorrecao').value;
        const temaRedacaoSelect = document.getElementById('temaRedacao');
        const temaLivre = document.getElementById('temaLivre').value;
        const texto = areaNormal.value || "";
        const imagemFile = imagemInput && imagemInput.files && imagemInput.files[0] ? imagemInput.files[0] : null;

        if (!tipoCorrecao || !temaRedacaoSelect.value || (temaRedacaoSelect.value === 'livre' && !temaLivre) || (!texto.trim() && !imagemFile)) {
            alert('Preencha todos os campos obrigatórios e envie texto ou imagem.');
            return;
        }
        if (texto.trim() && imagemFile) {
            alert('Envie apenas o texto digitado OU apenas a imagem da redação.');
            return;
        }

        writingAreaMobileAberta = false;

        let tema = '';
        if (temaRedacaoSelect.value === 'livre') {
            tema = temaLivre;
        } else {
            tema = temaRedacaoSelect.options[temaRedacaoSelect.selectedIndex].text;
        }

        const user = JSON.parse(localStorage.getItem('loggedUser'));
        if (!user || !user.token) {
            alert('Você precisa estar logado para enviar uma redação.');
            return;
        }

        const formData = new FormData();
        formData.append('tipoCorrecao', tipoCorrecao);
        formData.append('tema', tema);
        formData.append('texto', texto);
        if (imagemFile) formData.append('imagem', imagemFile);

        try {
            const resp = await fetch('https://express-e3hm.onrender.com/redchat', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });
            const data = await resp.json();
            if (resp.ok) {
                localStorage.setItem('correcaoIA', JSON.stringify(data));
                setTimeout(() => {
                    if (window.app && app.views && app.views.main && app.views.main.router) {
                        app.views.main.router.navigate('/correcaoia/');
                    } else {
                        window.location.href = 'correcaoia.html';
                    }
                }, 200);
            } else {
                alert(data.error || 'Erro ao enviar para correção por IA.');
            }
        } catch (err) {
            alert('Erro ao enviar para correção por IA.');
        }
    }

    // Função para enviar para corretor
    async function submitParaCorretor(corretorId) {
        // Validação dos campos obrigatórios
        const tipoCorrecao = document.getElementById('tipoCorrecao').value;
        const temaRedacaoSelect = document.getElementById('temaRedacao');
        const temaLivre = document.getElementById('temaLivre').value;
        const texto = areaNormal.value || "";
        const imagemFile = imagemInput && imagemInput.files && imagemInput.files[0] ? imagemInput.files[0] : null;

        if (!tipoCorrecao || !temaRedacaoSelect.value || (temaRedacaoSelect.value === 'livre' && !temaLivre) || (!texto.trim() && !imagemFile)) {
            alert('Preencha todos os campos obrigatórios e envie texto ou imagem.');
            return;
        }
        if (texto.trim() && imagemFile) {
            alert('Envie apenas o texto digitado OU apenas a imagem da redação.');
            return;
        }

        let tema = '';
        if (temaRedacaoSelect.value === 'livre') {
            tema = temaLivre;
        } else {
            tema = temaRedacaoSelect.options[temaRedacaoSelect.selectedIndex].text;
        }


        const user = JSON.parse(localStorage.getItem('loggedUser'));
        if (!user || !user.token) {
            alert('Você precisa estar logado para enviar uma redação.');
            return;
        }
        // Salva o userId no localStorage para a tela de pendentes
        if (user.id) {
            localStorage.setItem('userId', user.id);
        }

        const formData = new FormData();
        formData.append('tipoCorrecao', tipoCorrecao);
        formData.append('tema', tema);
        formData.append('texto', texto);
        formData.append('corretorId', corretorId);
        if (imagemFile) formData.append('imagem', imagemFile);

        try {
            const resp = await fetch('https://express-e3hm.onrender.com/red-corretores', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` },
                body: formData
            });
            const data = await resp.json();
            if (resp.ok) {
                console.log('[RedatorPro] Redação enviada para o corretor! Redirecionando para pendentes...');
                setTimeout(() => {
                    if (window.app && app.views && app.views.main && app.views.main.router) {
                        console.log('[RedatorPro] Usando Framework7 para redirecionar para /pendentes/');
                        app.views.main.router.navigate('/pendentes/', { reloadCurrent: true, ignoreCache: true });
                    } else {
                        console.log('[RedatorPro] Framework7 não disponível, usando fallback para pendentes.html');
                        window.location.href = 'pendentes.html';
                    }
                }, 10000); // Garantir tempo suficiente para o redirecionamento
            } else {
                console.error('[RedatorPro] Erro ao enviar para o corretor:', data.error || 'Erro desconhecido');
                alert(data.error || 'Erro ao enviar para o corretor.');
            }
        } catch (err) {
            alert('Erro ao enviar para o corretor.');
        }
    }
    let writingAreaMobileAberta = false;

    if (btnDigitar && writingArea && mobileActions) {
        btnDigitar.addEventListener('click', function () {
            writingArea.style.display = 'flex';
            writingArea.classList.add('ativo');
            mobileActions.style.display = 'none';
            btnDigitar.style.display = 'none';
            writingAreaMobileAberta = true;
            gerenciarEventoAreaNormal(true);
            if (isMobile() && areaNormal) {
                setTimeout(() => {
                    areaNormal.focus();
                }, 200);
            }
        });
    }

    // Função para garantir que o botão "Digitar Redação" volte a aparecer
    function mostrarBtnDigitar() {
        if (btnDigitar) btnDigitar.style.display = '';
        if (mobileActions) mobileActions.style.display = '';
        if (writingArea) {
            writingArea.style.display = 'none';
            writingArea.classList.remove('ativo');
        }
        writingAreaMobileAberta = false;
    }

    function abrirFolhaAmpliada(event) {
        if (isMobile() && areaNormal && areaAmpliada && folhaAmpliadaOverlay) {
            let writingAreaEl = areaNormal.closest('.writing-area');
            if (!writingAreaEl) return;
            const style = window.getComputedStyle(writingAreaEl);
            if (style.display === 'none') return;

            event.preventDefault();
            event.stopPropagation();

            areaAmpliada.value = areaNormal.value;
            folhaAmpliadaOverlay.classList.add('ativo');
            document.body.classList.add('folha-ampliada-aberta');

            setTimeout(() => {
                areaAmpliada.focus();
                areaAmpliada.selectionStart = areaAmpliada.selectionEnd = areaAmpliada.value.length;
            }, 100);
        }
    }

    if (btnFecharFolha) {
        btnFecharFolha.addEventListener('click', function () {
            if (areaNormal && areaAmpliada) {
                areaNormal.value = areaAmpliada.value;
            }
            if (folhaAmpliadaOverlay) folhaAmpliadaOverlay.classList.remove('ativo');
            document.body.classList.remove('folha-ampliada-aberta');
            mostrarBtnDigitar(); // Garante que o botão volte ao fechar a folha
        });
    }

    if (areaAmpliada && areaNormal) {
        areaAmpliada.addEventListener('input', function () {
            areaNormal.value = areaAmpliada.value;
        });
    }

    function ajustarWritingArea() {
        // writingArea sempre começa escondida, só aparece ao clicar no botão
        if (writingArea) {
            if (!writingAreaMobileAberta) {
                writingArea.classList.remove('ativo');
                writingArea.style.display = 'none';
                gerenciarEventoAreaNormal(false);
                mostrarBtnDigitar(); // Garante que o botão aparece ao redimensionar
            } else {
                writingArea.classList.add('ativo');
                writingArea.style.display = 'flex';
                gerenciarEventoAreaNormal(true);
                if (btnDigitar) btnDigitar.style.display = 'none';
            }
        }
        if (mobileActions) {
            mobileActions.style.display = writingAreaMobileAberta ? 'none' : 'block';
        }

        if (folhaAmpliadaOverlay) folhaAmpliadaOverlay.classList.remove('ativo');
        document.body.classList.remove('folha-ampliada-aberta');
    }

    window.addEventListener('resize', ajustarWritingArea);
    ajustarWritingArea();

    // Limpa o formulário ao carregar a página
    if (form) {
        form.reset();
        if (areaNormal) areaNormal.value = '';
        if (areaAmpliada) areaAmpliada.value = '';
        const temaLivre = document.getElementById('temaLivre');
        if (temaLivre) temaLivre.value = '';
        if (imagemInput) imagemInput.value = '';
        mostrarBtnDigitar(); // Garante que o botão aparece ao resetar
    }

    // --- Envio do formulário para o backend (agora com FormData) ---
    if (form) {
        form.addEventListener('submit', async function (e) {
            console.log('Handler de submit chamado!');
            e.preventDefault();
            e.stopPropagation();

            // Validação dos campos obrigatórios
            const tipoCorrecao = document.getElementById('tipoCorrecao').value;
            const temaRedacaoSelect = document.getElementById('temaRedacao');
            const temaLivre = document.getElementById('temaLivre').value;
            const texto = areaNormal.value || ""; // <-- sempre string
            const imagemFile = imagemInput && imagemInput.files && imagemInput.files[0] ? imagemInput.files[0] : null;

            // Agora só pode enviar texto OU imagem, nunca ambos
            if (!tipoCorrecao || !temaRedacaoSelect.value || (temaRedacaoSelect.value === 'livre' && !temaLivre) || (!texto.trim() && !imagemFile)) {
                alert('Preencha todos os campos obrigatórios e envie o texto OU a imagem.');
                return;
            }
            if (texto.trim() && imagemFile) {
                alert('Envie apenas o texto digitado OU a imagem da redação, nunca ambos ao mesmo tempo.');
                return;
            }

            writingAreaMobileAberta = false;

            // Seleciona o botão de submit correto (não o de digitar)
            const submitBtns = form.querySelectorAll('.submit-button[type="submit"], .submit-button:not([type])');
            let submitBtn = null;
            if (submitBtns.length === 1) {
                submitBtn = submitBtns[0];
            } else {
                // Se houver mais de um, pega o que está visível
                submitBtns.forEach(btn => {
                    if (btn.offsetParent !== null) submitBtn = btn;
                });
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = 'Corrigindo...';
            }

            // Corrige o envio do tema: envia o texto do option selecionado
            let tema = '';
            if (temaRedacaoSelect.value === 'livre') {
                tema = temaLivre;
            } else if (temaRedacaoSelect.value) {
                tema = temaRedacaoSelect.options[temaRedacaoSelect.selectedIndex].text;
            }

            // Pega o usuário logado do localStorage
            const user = JSON.parse(localStorage.getItem('loggedUser'));
            if (!user || !user.token) {
                alert('Você precisa estar logado para enviar a redação.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Enviar para o ChatRedator!';
                }
                return;
            }

            // Monta o FormData
            const formData = new FormData();
            formData.append('tipoCorrecao', tipoCorrecao);
            formData.append('tema', tema);
            formData.append('texto', texto); // <-- sempre envia, mesmo que vazio
            if (imagemFile) {
                formData.append('imagem', imagemFile);
            }

            try {
                const response = await fetch('https://express-e3hm.onrender.com/redchat', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + user.token
                    },
                    body: formData
                });
                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('correcaoIA', JSON.stringify(result));
                    form.reset();
                    if (areaNormal) areaNormal.value = '';
                    if (areaAmpliada) areaAmpliada.value = '';
                    const temaLivre = document.getElementById('temaLivre');
                    if (temaLivre) temaLivre.value = '';
                    if (imagemInput) imagemInput.value = '';
                    setTimeout(() => {
                        if (window.app && app.views && app.views.main && app.views.main.router) {
                            app.views.main.router.navigate('/correcaoia/');
                        } else {
                            window.location.href = 'correcaoia.html';
                        }
                    }, 200);
                } else {
                    alert('Erro ao enviar: ' + (result.error || 'Erro desconhecido'));
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = 'Enviar para o ChatRedator!';
                    }
                }
            } catch (err) {
                alert('Erro de conexão com o servidor.');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = 'Enviar para o ChatRedator!';
                }
            }
            console.log('Handler de submit FINALIZADO');
            return false; // <-- Garante que nunca submeta tradicionalmente
        });
    }

    if (imagemInput && areaNormal) {
        imagemInput.addEventListener('change', function () {
            if (imagemInput.files && imagemInput.files.length > 0) {
                areaNormal.removeAttribute('required');
            } else {
                areaNormal.setAttribute('required', 'required');
            }
        });
        // Garante o estado correto ao carregar a página
        if (imagemInput.files && imagemInput.files.length > 0) {
            areaNormal.removeAttribute('required');
        } else {
            areaNormal.setAttribute('required', 'required');
        }
    }

    // NOVO: Carregar temas dinâmicos do backend para o select
    async function carregarTemasNoSelect() {
        try {
            const select = document.getElementById('temaRedacao');
            if (!select) return;
            // Salva a opção "Tema Livre" para recolocar depois
            let temaLivreOption = null;
            Array.from(select.options).forEach(opt => {
                if (opt.value === 'livre') temaLivreOption = opt;
            });
            // Limpa todas as opções
            select.innerHTML = '<option value="">Selecione um tema</option>';
            // Busca temas do backend
            const resp = await fetch('https://express-e3hm.onrender.com/temas');
            const temas = await resp.json();
            temas.forEach(tema => {
                const opt = document.createElement('option');
                opt.value = tema.titulo;
                opt.textContent = tema.titulo;
                select.appendChild(opt);
            });
            // Recoloca a opção Tema Livre
            if (temaLivreOption) {
                select.appendChild(temaLivreOption);
            } else {
                // Garante que Tema Livre exista
                const opt = document.createElement('option');
                opt.value = 'livre';
                opt.textContent = 'Tema Livre';
                select.appendChild(opt);
            }
            // Após carregar os temas, tente pré-selecionar se necessário
            preSelecionarTema();
        } catch (err) {
            console.error('[iacorretor.js] Erro ao carregar temas do backend:', err);
        }
    }

    // NOVO: Pré-selecionar tema se vier de temas.js
    function preSelecionarTema() {
        const select = document.getElementById('temaRedacao');
        const temaPreSelecionado = localStorage.getItem('temaPreSelecionado');
        if (select && temaPreSelecionado) {
            let encontrou = false;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].text === temaPreSelecionado) {
                    select.selectedIndex = i;
                    encontrou = true;
                    break;
                }
            }
            localStorage.removeItem('temaPreSelecionado');
            // Atualiza campo tema livre se necessário
            if (select.value === 'livre') {
                window.toggleTemaLivre();
            } else {
                const campoTemaLivre = document.getElementById('temaLivre');
                if (campoTemaLivre) {
                    campoTemaLivre.style.display = 'none';
                    campoTemaLivre.required = false;
                }
            }
        }
    }

    // Chama ao inicializar a página
    carregarTemasNoSelect();
};


// Função global para o select de tema livre
window.toggleTemaLivre = function () {
    const select = document.getElementById('temaRedacao');
    const campoTemaLivre = document.getElementById('temaLivre');
    if (select.value === 'livre') {
        campoTemaLivre.style.display = 'block';
        campoTemaLivre.required = true;
    } else {
        campoTemaLivre.style.display = 'none';
        campoTemaLivre.required = false;
    }
};

    // Chama ao inicializar a página
    carregarTemasNoSelect();


// Função global para o select de tema livre
window.toggleTemaLivre = function () {
    const select = document.getElementById('temaRedacao');
    const campoTemaLivre = document.getElementById('temaLivre');
    if (select.value === 'livre') {
        campoTemaLivre.style.display = 'block';
        campoTemaLivre.required = true;
    } else {
        campoTemaLivre.style.display = 'none';
        campoTemaLivre.required = false;
    }
};



