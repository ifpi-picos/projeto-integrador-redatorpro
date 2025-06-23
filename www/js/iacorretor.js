console.log('iacorretor.js carregado!');

window.initIACorretor = function () {
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

    function isMobile() {
        return window.innerWidth <= 700;
    }

    // Autoexpande o textarea no mobile (normal e ampliada)
    function autoExpandTextarea(el) {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
    }

    if (areaNormal) {
        // NÃO CHAME limitarLinhasTextarea
        if (isMobile()) {
            areaNormal.setAttribute('rows', '11');
            areaNormal.style.overflowY = 'auto';
            areaNormal.style.resize = 'none';
            autoExpandTextarea(areaNormal);
            areaNormal.addEventListener('input', function () {
                autoExpandTextarea(areaNormal);
            });
        }
    }

    if (areaAmpliada) {
        // NÃO CHAME limitarLinhasTextarea
        areaAmpliada.setAttribute('cols', '80');
        if (isMobile()) {
            areaAmpliada.setAttribute('rows', '11');
            areaAmpliada.style.overflowY = 'auto';
            areaAmpliada.style.resize = 'none';
            autoExpandTextarea(areaAmpliada);
            areaAmpliada.addEventListener('input', function () {
                autoExpandTextarea(areaAmpliada);
            });
        }
    }

    function gerenciarEventoAreaNormal(ativo) {
        if (!areaNormal) return;
        if (ativo) {
            if (!areaNormal._eventoClickAdicionado) {
                setTimeout(() => {
                    areaNormal.addEventListener('click', abrirFolhaAmpliada);
                    areaNormal._eventoClickAdicionado = true;
                }, 100);
            }
        } else {
            if (areaNormal._eventoClickAdicionado) {
                areaNormal.removeEventListener('click', abrirFolhaAmpliada);
                areaNormal._eventoClickAdicionado = false;
            }
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
            } else {
                writingArea.classList.add('ativo');
                writingArea.style.display = 'flex';
                gerenciarEventoAreaNormal(true);
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
        } catch (err) {
            console.error('[iacorretor.js] Erro ao carregar temas do backend:', err);
        }
    }

    // NOVO: Pré-selecionar tema se vier de temas.js
    function preSelecionarTema() {
        const select = document.getElementById('temaRedacao');
        const temaPreSelecionado = localStorage.getItem('temaPreSelecionado');
        if (select && temaPreSelecionado) {
            // Aguarda o carregamento dos temas dinâmicos
            setTimeout(() => {
                let encontrou = false;
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].text === temaPreSelecionado) {
                        select.selectedIndex = i;
                        encontrou = true;
                        break;
                    }
                }
                // Se não encontrou, deixa como está (usuário pode escolher)
                // Limpa o localStorage para não pré-selecionar de novo
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
            }, 300); // Pequeno delay para garantir que os temas já foram carregados
        }
    }

    // Chama ao inicializar a página
    carregarTemasNoSelect();
    preSelecionarTema();
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


