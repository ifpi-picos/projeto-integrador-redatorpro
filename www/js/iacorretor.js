function limitarLinhasTextarea(textarea, maxLinhas, maxColunas) {
    function isMobile() {
        return window.innerWidth <= 700;
    }

    textarea.addEventListener('input', function () {
        // Só limita linhas/colunas no desktop
        if (!isMobile()) {
            let linhas = textarea.value.split('\n');
            let novasLinhas = [];
            let cursor = textarea.selectionStart;
            let pos = 0;
            let novaPos = cursor;

            for (let i = 0; i < linhas.length; i++) {
                let linha = linhas[i];
                // Se a linha for maior que o limite, quebra e move o cursor para a próxima linha se necessário
                while (linha.length > maxColunas) {
                    novasLinhas.push(linha.slice(0, maxColunas));
                    linha = linha.slice(maxColunas);

                    // Ajusta a posição do cursor se ele estava após o corte
                    if (cursor > pos + maxColunas) {
                        pos += maxColunas;
                    } else if (cursor > pos) {
                        // O cursor estava na parte cortada, move para o início da próxima linha
                        novaPos += 1;
                        pos += maxColunas;
                    }
                }
                novasLinhas.push(linha);
                pos += linha.length + 1; // +1 por causa do \n
            }
            if (novasLinhas.length > maxLinhas) {
                novasLinhas = novasLinhas.slice(0, maxLinhas);
            }
            textarea.value = novasLinhas.join('\n');
            // Atualiza o cursor para a posição correta se mudou de linha automaticamente
            if (textarea.selectionStart !== novaPos) {
                textarea.selectionStart = textarea.selectionEnd = novaPos;
            }
        }
        // No mobile, não faz nada (sem limite)
    });

    textarea.addEventListener('keydown', function (e) {
        // Só limita linhas/colunas no desktop
        if (!isMobile()) {
            const linhas = textarea.value.split('\n');
            const cursorPos = textarea.selectionStart;
            const linhaAtual = textarea.value.substr(0, cursorPos).split('\n').length - 1;
            const colunaAtual = cursorPos - (textarea.value.lastIndexOf('\n', cursorPos - 1) + 1);

            if (e.key === 'Enter') {
                if (linhas.length >= maxLinhas && textarea.selectionStart === textarea.selectionEnd) {
                    e.preventDefault();
                }
            }
            if (
                e.key.length === 1 &&
                colunaAtual >= maxColunas &&
                !(e.ctrlKey || e.metaKey || e.altKey)
            ) {
                if (textarea.selectionStart === textarea.selectionEnd) {
                    // Ao digitar no final da linha, insere uma quebra de linha automaticamente
                    if (linhas.length < maxLinhas) {
                        const before = textarea.value.substring(0, cursorPos);
                        const after = textarea.value.substring(cursorPos);
                        textarea.value = before + '\n' + e.key + after;
                        textarea.selectionStart = textarea.selectionEnd = cursorPos + 2;
                    }
                    e.preventDefault();
                }
            }
        }
        // No mobile, não faz nada (sem limite)
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const areaNormal = document.getElementById('textoRedacao');
    const areaAmpliada = document.getElementById('textoRedacaoAmpliada');
    const btnDigitar = document.getElementById('btnDigitarRedacao');
    const writingArea = document.querySelector('.writing-area');
    const mobileActions = document.querySelector('.mobile-actions');
    const folhaAmpliadaOverlay = document.getElementById('folhaAmpliadaOverlay');
    const btnFecharFolha = document.getElementById('btnFecharFolha');
    const form = document.getElementById('formCorrecao');

    function isMobile() {
        return window.innerWidth <= 700;
    }

    // Autoexpande o textarea no mobile (normal e ampliada)
    function autoExpandTextarea(el) {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
    }

    if (areaNormal) {
        limitarLinhasTextarea(areaNormal, 30, 72);

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
        limitarLinhasTextarea(areaAmpliada, 30, 72);
        areaAmpliada.setAttribute('cols', '72');
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
            btnDigitar.style.display = 'none'; // Esconde o botão após clicar
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
        if (isMobile()) {
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
        } else {
            if (writingArea) {
                writingArea.classList.add('ativo');
                writingArea.style.display = 'flex';
                gerenciarEventoAreaNormal(true);
            }
            if (mobileActions) {
                mobileActions.style.display = 'none';
            }
            writingAreaMobileAberta = false;
        }

        if (folhaAmpliadaOverlay) folhaAmpliadaOverlay.classList.remove('ativo');
        document.body.classList.remove('folha-ampliada-aberta');
    }

    window.addEventListener('resize', ajustarWritingArea);
    ajustarWritingArea();

    if (form) {
        form.addEventListener('submit', function (e) {
            if (!areaNormal.value.trim()) {
                e.preventDefault();
            } else {
                writingAreaMobileAberta = false;
            }
        });
    }
});

function toggleTemaLivre() {
    const select = document.getElementById('temaRedacao');
    const campoTemaLivre = document.getElementById('temaLivre');

    if (select.value === 'livre') {
        campoTemaLivre.style.display = 'block';
        campoTemaLivre.required = true;
    } else {
        campoTemaLivre.style.display = 'none';
        campoTemaLivre.required = false;
    }
}






