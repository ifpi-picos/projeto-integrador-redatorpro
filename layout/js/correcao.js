document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-correcao');
    const steps = document.querySelectorAll('.step-content');
    const stepButtons = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress-bar');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const btnEnviar = document.getElementById('btn-enviar');
    const notaSliders = document.querySelectorAll('.nota-slider');
    const totalNotaElement = document.getElementById('total-nota');
    
    const API = 'https://express-e3hm.onrender.com';
    const params = new URLSearchParams(window.location.search);
    const essayId = parseInt(params.get('id'), 10);

    const alunoNomeEl = document.getElementById('alunoNome');
    const temaInfoEl = document.getElementById('temaInfo');
    const redacaoContent = document.getElementById('redacaoContent');
    const btnMarkText = document.getElementById('btnMarkText');
    const btnMarkImage = document.getElementById('btnMarkImage');
    const obsList = document.getElementById('observacoes-list');
    const comentariosGeraisEl = document.getElementById('comentariosGerais');

    let textoOriginal = '';
    let imgEl = null;
    let canvas = null;
    let ctx = null;
    let isMarkTextMode = false;
    let isMarkImageMode = false;
    let drawing = false;
    let startPt = null;

    // fonte de verdade para envio:
    const annotations = []; // {id, tipo, rangeStart, rangeEnd, snippet, rects, color, comment}

    function getToken() {
        const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
        return user?.token || '';
    }

    function setMarkModes(text, image) {
        isMarkTextMode = !!text;
        isMarkImageMode = !!image;
        if (canvas) canvas.style.pointerEvents = isMarkImageMode ? 'auto' : 'none';
        btnMarkText && (btnMarkText.disabled = (textoOriginal.length === 0));
        btnMarkImage && (btnMarkImage.disabled = !imgEl);
    }

    function renderTexto(texto) {
        textoOriginal = texto || '';
        redacaoContent.innerHTML = `<div id="textoRedacaoView" class="texto-redacao"></div>`;
        const view = document.getElementById('textoRedacaoView');
        view.textContent = textoOriginal;

        // marcação por seleção
        view.addEventListener('mouseup', () => {
            if (!isMarkTextMode) return;
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const range = sel.getRangeAt(0);
            if (!view.contains(range.commonAncestorContainer)) return;
            if (range.collapsed) return;

            try {
                // como o view possui só texto simples, surroundContents funciona
                const snippet = range.toString();
                // calcular offsets absolutos
                const preRange = range.cloneRange();
                preRange.selectNodeContents(view);
                preRange.setEnd(range.startContainer, range.startOffset);
                const start = preRange.toString().length;
                const end = start + snippet.length;

                // aplicar highlight
                const span = document.createElement('span');
                const annId = 'ann-' + (Date.now() + Math.random().toString(16).slice(2));
                span.className = 'highlight';
                span.dataset.annId = annId;
                range.surroundContents(span);

                const ann = { id: annId, tipo: 'texto', rangeStart: start, rangeEnd: end, snippet, rects: null, color: '#ffea00', comment: '' };
                annotations.push(ann);
                addObsItem(ann);
                sel.removeAllRanges();
            } catch (e) {
                // fallback simples: ignora se range complexo
                console.warn('Falha ao marcar seleção (range complexo).', e);
            }
        });
    }

    function renderImagem(url) {
        redacaoContent.innerHTML = `
            <img id="redacaoImagem" src="${url}" alt="Redação enviada">
            <canvas id="imgCanvas"></canvas>
        `;
        imgEl = document.getElementById('redacaoImagem');
        canvas = document.getElementById('imgCanvas');
        ctx = canvas.getContext('2d');

        function resizeCanvas() {
            if (!imgEl) return;
            const rect = imgEl.getBoundingClientRect();
            const w = imgEl.clientWidth;
            const h = imgEl.clientHeight;
            canvas.width = w;
            canvas.height = h;
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            canvas.style.top = imgEl.offsetTop + 'px';
            canvas.style.left = imgEl.offsetLeft + 'px';
            drawAllRects();
        }
        imgEl.onload = resizeCanvas;
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // desenho de retângulos
        canvas.addEventListener('mousedown', (e) => {
            if (!isMarkImageMode) return;
            drawing = true;
            const pt = getCanvasPoint(e);
            startPt = pt;
        });
        canvas.addEventListener('mousemove', (e) => {
            if (!isMarkImageMode || !drawing) return;
            drawAllRects();
            const pt = getCanvasPoint(e);
            const rect = normRect(startPt.x, startPt.y, pt.x, pt.y);
            drawRect(rect, 'rgba(255,234,0,0.35)', '#d1b800');
        });
        canvas.addEventListener('mouseup', (e) => {
            if (!isMarkImageMode || !drawing) return;
            drawing = false;
            const pt = getCanvasPoint(e);
            const rect = normRect(startPt.x, startPt.y, pt.x, pt.y);
            const annId = 'ann-' + (Date.now() + Math.random().toString(16).slice(2));
            const ann = { id: annId, tipo: 'imagem', rects: [rect], rangeStart: null, rangeEnd: null, snippet: null, color: '#ffea00', comment: '' };
            annotations.push(ann);
            addObsItem(ann);
            drawAllRects();
        });
    }

    function getCanvasPoint(evt) {
        const r = canvas.getBoundingClientRect();
        return { x: evt.clientX - r.left, y: evt.clientY - r.top };
    }
    function normRect(x1, y1, x2, y2) {
        const x = Math.min(x1, x2);
        const y = Math.min(y1, y2);
        const w = Math.abs(x2 - x1);
        const h = Math.abs(y2 - y1);
        return { x, y, w, h };
    }
    function drawRect(r, fill='rgba(255,234,0,0.35)', stroke='#d1b800') {
        ctx.save();
        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 2;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
        ctx.restore();
    }
    function drawAllRects() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        annotations.filter(a => a.tipo === 'imagem').forEach(a => {
            (a.rects || []).forEach(r => drawRect(r));
        });
    }

    function addObsItem(ann) {
        const el = document.createElement('div');
        el.className = 'obs-item';
        el.dataset.annId = ann.id;
        const label = ann.tipo === 'texto' ? (ann.snippet?.slice(0, 50) || 'Trecho') : 'Marcação na imagem';
        el.innerHTML = `
            <div class="obs-head">
                <span>${label}</span>
                <div class="obs-actions">
                    <button type="button" class="btn btn-anterior obs-goto"><i class="fas fa-location-arrow"></i></button>
                    <button type="button" class="btn btn-salvar obs-remove"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <textarea class="obs-comment" placeholder="Escreva um comentário sobre esta marcação..."></textarea>
        `;
        const txt = el.querySelector('.obs-comment');
        txt.addEventListener('input', () => {
            ann.comment = txt.value;
        });
        el.querySelector('.obs-remove').addEventListener('click', () => removeAnnotation(ann.id));
        el.querySelector('.obs-goto').addEventListener('click', () => focusAnnotation(ann.id));
        obsList.appendChild(el);
    }

    function removeAnnotation(id) {
        const idx = annotations.findIndex(a => a.id === id);
        if (idx === -1) return;
        const ann = annotations[idx];
        if (ann.tipo === 'texto') {
            // remover span
            const span = document.querySelector(`.highlight[data-ann-id="${id}"]`);
            if (span) {
                const parent = span.parentNode;
                while (span.firstChild) parent.insertBefore(span.firstChild, span);
                parent.removeChild(span);
                parent.normalize && parent.normalize();
            }
        } else {
            drawAllRects(); // redesenha sem a anotação
        }
        annotations.splice(idx, 1);
        const obsEl = obsList.querySelector(`.obs-item[data-ann-id="${id}"]`);
        obsEl && obsEl.remove();
        drawAllRects();
    }

    function focusAnnotation(id) {
        const ann = annotations.find(a => a.id === id);
        if (!ann) return;
        if (ann.tipo === 'texto') {
            const span = document.querySelector(`.highlight[data-ann-id="${id}"]`);
            if (span) {
                span.classList.add('active');
                span.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => span.classList.remove('active'), 1000);
            }
        } else if (imgEl && canvas) {
            redacaoContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function applySavedTextAnnotations(list) {
        if (!textoOriginal) return;
        const items = list
          .filter(a => a.tipo === 'texto' && Number.isInteger(a.rangeStart) && Number.isInteger(a.rangeEnd))
          .sort((a,b) => a.rangeStart - b.rangeStart);
        if (!items.length) return;
        // reconstrói HTML sem sobreposição
        let html = '';
        let pos = 0;
        items.forEach(a => {
            const s = Math.max(0, a.rangeStart);
            const e = Math.min(textoOriginal.length, a.rangeEnd);
            if (s > pos) html += escapeHtml(textoOriginal.slice(pos, s));
            const snippet = textoOriginal.slice(s, e);
            html += `<span class="highlight" data-ann-id="${a.id}">${escapeHtml(snippet)}</span>`;
            pos = e;
        });
        if (pos < textoOriginal.length) html += escapeHtml(textoOriginal.slice(pos));
        const view = document.getElementById('textoRedacaoView');
        if (view) view.innerHTML = html;
    }
    function escapeHtml(s){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));}

    async function loadEssayAndCorrection() {
        if (!essayId) return;
        const token = getToken();
        if (!token) return;

        // redação
        const eResp = await fetch(`${API}/correcao/essay/${essayId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!eResp.ok) { console.error('Falha ao carregar redação'); return; }
        const essay = await eResp.json();
        alunoNomeEl.textContent = essay?.autor?.name || '—';
        temaInfoEl.textContent = essay?.tema || '—';

        if (essay.imagemUrl) {
            renderImagem(essay.imagemUrl);
        } else {
            renderTexto(essay.texto || '');
        }

        // correção existente
        const cResp = await fetch(`${API}/correcao/${essayId}`, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (cResp.ok) {
            const corr = await cResp.json();
            if (corr) {
                // notas
                try {
                    const n = corr.notas || {};
                    document.querySelectorAll('.nota-slider').forEach(sl => {
                        const comp = sl.getAttribute('data-competencia');
                        if (n && n[comp] != null) {
                            sl.value = n[comp];
                            const display = document.getElementById(`nota-${comp}`);
                            display && (display.textContent = n[comp]);
                        }
                    });
                    calcularNotaTotal();
                } catch(_) {}
                // comentários
                comentariosGeraisEl && (comentariosGeraisEl.value = corr.comentariosGerais || '');

                // marcações
                (corr.annotations || []).forEach(a => {
                    const ann = { 
                        id: a.id ? `ann-${a.id}` : ('ann-' + (Date.now() + Math.random().toString(16).slice(2))),
                        tipo: a.tipo, rangeStart: a.rangeStart, rangeEnd: a.rangeEnd,
                        snippet: a.snippet, rects: a.rects, color: a.color || '#ffea00',
                        comment: a.comment || ''
                    };
                    annotations.push(ann);
                    addObsItem(ann);
                });
                // aplica marcas visualmente
                if (essay.texto) applySavedTextAnnotations(annotations);
                if (essay.imagemUrl) drawAllRects();
            }
        }
    }

    // toggles de marcação
    btnMarkText && btnMarkText.addEventListener('click', function() {
        setMarkModes(!isMarkTextMode, false);
        this.classList.toggle('btn-enviar', isMarkTextMode);
    });
    btnMarkImage && btnMarkImage.addEventListener('click', function() {
        setMarkModes(false, !isMarkImageMode);
        this.classList.toggle('btn-enviar', isMarkImageMode);
    });

    // Envio com correção + marcações
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar se todas as competências foram avaliadas
        let todasAvaliadas = true;
        notaSliders.forEach(slider => {
            const value = slider.value;
            // Verifica se o valor é um número (incluindo 0) e está dentro do range permitido
            if (value === "" || isNaN(value) || value < 0 || value > 200) {
                todasAvaliadas = false;
                slider.classList.add('error');
            } else {
                slider.classList.remove('error');
            }
        });

        if (!todasAvaliadas) {
            alert('Por favor, atribua uma nota válida (entre 0 e 200) para todas as competências antes de enviar.');
            // Ir para o primeiro passo com erro
            for (let i = 0; i < notaSliders.length; i++) {
                const value = notaSliders[i].value;
                if (value === "" || isNaN(value) || value < 0 || value > 200) {
                    currentStep = parseInt(notaSliders[i].getAttribute('data-competencia'));
                    updateSteps();
                    break;
                }
            }
            return;
        }
        
        // monta objeto de notas
        const notas = {};
        document.querySelectorAll('.nota-slider').forEach(sl => {
            const comp = sl.getAttribute('data-competencia');
            notas[comp] = parseInt(sl.value) || 0;
        });
        const total = Object.values(notas).reduce((a,b)=>a+(b||0),0);
        totalNotaElement.textContent = total;

        const payload = {
            notas,
            notaTotal: total,
            comentariosGerais: comentariosGeraisEl ? comentariosGeraisEl.value : '',
            annotations: annotations.map(a => ({
                tipo: a.tipo,
                rangeStart: a.rangeStart ?? null,
                rangeEnd: a.rangeEnd ?? null,
                snippet: a.snippet ?? null,
                rects: a.rects ?? null,
                color: a.color ?? '#ffea00',
                comment: a.comment ?? ''
            }))
        };

        try {
            const resp = await fetch(`${API}/correcao/${essayId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await resp.json();
            if (resp.ok) {
                alert('Correção salva com sucesso!');
            } else {
                alert(data.error || 'Erro ao salvar correção.');
            }
        } catch (err) {
            alert('Erro de conexão ao salvar correção.');
        }
    });
    
    // Inicializar
    updateSteps();
    setMarkModes(false, false);
    loadEssayAndCorrection();
});