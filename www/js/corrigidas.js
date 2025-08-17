(function () {
  // Impede múltiplas inicializações caso o script seja incluído mais de uma vez
  if (window.__corrigidasInit) return;
  window.__corrigidasInit = true;

  const API = 'https://express-e3hm.onrender.com';

  function getIdFromUrl() {
    // NOVO: tenta via Framework7
    const qId = window.app?.views?.main?.router?.currentRoute?.query?.id;
    if (qId !== undefined && qId !== null) {
      const n = Number(qId);
      if (Number.isFinite(n) && n > 0) return n;
    }

    // 1) Querystring normal
    let id = Number(new URLSearchParams(window.location.search).get('id'));
    if (Number.isFinite(id) && id > 0) return id;

    // 2) Hash do Framework7 (#/corrigidas/?id=123)
    const hash = window.location.hash || '';
    const mHash = /[?&]id=(\d+)/.exec(hash);
    if (mHash) {
      id = Number(mHash[1]);
      if (Number.isFinite(id) && id > 0) return id;
    }

    // 3) Href completo (qualquer forma)
    const mHref = /[?&]id=(\d+)/.exec(window.location.href || '');
    if (mHref) {
      id = Number(mHref[1]);
      if (Number.isFinite(id) && id > 0) return id;
    }

    // 4) Fallback: último id persistido
    id = Number(localStorage.getItem('lastEssayId') || '0');
    return Number.isFinite(id) && id > 0 ? id : null;
  }

  const essayId = getIdFromUrl();
  if (essayId) localStorage.setItem('lastEssayId', String(essayId));

  // Elementos (alguns podem não existir, então sempre validar antes de usar)
  const $tema = document.getElementById('temaTxt');
  const $info = document.getElementById('infoTxt');
  const $notaTotal = document.getElementById('notaTotalTxt');
  const $corrNome = document.getElementById('corretorNome');
  const $corrAvatar = document.getElementById('corretorAvatar');

  // Corrigido: área da redação
  const $essayView = document.getElementById('essayView');
  // Corrigido: competências, comentários, observações
  const $competencias = document.getElementById('competenciasBox');
  const $comentarios = document.getElementById('comentariosBox');
  const $obsList = document.getElementById('obsList');

  // Estados
  const $loading = document.getElementById('loading');
  const $empty = document.getElementById('empty');
  const $error = document.getElementById('error');

  let canvas, ctx, imgEl;

  function getToken() {
    const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
    return (
      user?.token ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      ''
    );
  }

  function hexToRgba(hex, alpha = 0.5) {
    let c = (hex || '#4cc3ff').replace('#', '');
    if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function avatarUrl(nome, foto) {
    if (foto) return foto;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'Corretor')}&background=4c6fff&color=fff`;
  }

  // NOVO: elementos para navegação de competência
  const $compNav = document.getElementById('competenciaNavegacao');
  const $compAnterior = document.getElementById('btnCompAnterior');
  const $compProximo = document.getElementById('btnCompProximo');
  const $compAtualLabel = document.getElementById('compAtualLabel');
  const $compUnica = document.getElementById('competenciaUnica');

  // Tooltip customizado
  let tooltipEl = null;
  function showTooltip(text, x, y) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'corrigidas-tooltip';
      document.body.appendChild(tooltipEl);
    }
    tooltipEl.textContent = text;
    tooltipEl.style.opacity = '1';
    tooltipEl.style.pointerEvents = 'auto';
    tooltipEl.style.zIndex = '99999';
    // Ajuste para não sair da tela
    setTimeout(() => {
      const rect = tooltipEl.getBoundingClientRect();
      let left = x + 12;
      let top = y + 12;
      if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 8;
      if (top + rect.height > window.innerHeight) top = y - rect.height - 12;
      tooltipEl.style.left = left + 'px';
      tooltipEl.style.top = top + 'px';
      tooltipEl.classList.add('active');
    }, 1);
  }
  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.classList.remove('active');
      tooltipEl.style.opacity = '0';
      tooltipEl.style.pointerEvents = 'none';
    }
  }

  // NOVO: renderiza apenas uma competência por vez
  let competenciasData = [];
  let competenciasObs = {};
  let compAtual = 0; // índice 0..4

  function renderCompetenciaAtual() {
    if (!$compUnica) return;
    $compUnica.innerHTML = '';
    if (!competenciasData.length) return;
    const c = competenciasData[compAtual];
    const label = c.label;
    const valor = c.valor;
    const obs = c.obs;
    $compAtualLabel.textContent = label;
    // Valor
    const row = document.createElement('div');
    row.className = 'comp-row';
    const l = document.createElement('div'); l.className='comp-label'; l.textContent = label;
    const r = document.createElement('div'); r.className='comp-valor'; r.textContent = `${valor}`;
    row.appendChild(l); row.appendChild(r);
    $compUnica.appendChild(row);
    // Observação
    if (obs) {
      const obsDiv = document.createElement('div');
      obsDiv.className = 'comp-obs';
      obsDiv.textContent = obs;
      $compUnica.appendChild(obsDiv);
    }
    // Botões
    $compAnterior.disabled = (compAtual === 0);
    $compProximo.disabled = (compAtual === competenciasData.length - 1);
  }

  if ($compAnterior && $compProximo) {
    $compAnterior.addEventListener('click', function() {
      if (compAtual > 0) { compAtual--; renderCompetenciaAtual(); }
    });
    $compProximo.addEventListener('click', function() {
      if (compAtual < competenciasData.length - 1) { compAtual++; renderCompetenciaAtual(); }
    });
  }

  function renderNotas(notasObj, obsObj) {
    // NOVO: popula array de competências para navegação
    competenciasData = [];
    competenciasObs = obsObj || {};
    const labels = [
      'Competência 1',
      'Competência 2',
      'Competência 3',
      'Competência 4',
      'Competência 5'
    ];
    for (let i = 1; i <= 5; i++) {
      const v = (notasObj && (notasObj[i] ?? notasObj[String(i)])) ?? 0;
      const obs = obsObj && obsObj[i] ? obsObj[i] : '';
      competenciasData.push({ label: labels[i-1], valor: v, obs });
    }
    compAtual = 0;
    renderCompetenciaAtual();
  }

  function applyTextAnnotations(container, texto, annotations) {
    const items = (annotations || [])
      .filter(a => a.tipo === 'texto' && Number.isInteger(a.rangeStart) && Number.isInteger(a.rangeEnd))
      .sort((a,b) => a.rangeStart - b.rangeStart);
    if (!items.length) { container.textContent = texto || ''; return; }

    let html = '', pos = 0;
    function esc(s){ return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }
    items.forEach(a => {
      const s = Math.max(0, a.rangeStart);
      const e = Math.min(texto.length, a.rangeEnd);
      if (s > pos) html += esc(texto.slice(pos, s));
      const snippet = texto.slice(s, e);
      // NOVO: data-comment para tooltip
      html += `<span class="highlight" style="background:${hexToRgba(a.color||'#4cc3ff',0.35)}" data-comment="${esc(a.comment||'')}" tabindex="0">${esc(snippet)}</span>`;
      pos = e;
    });
    if (pos < texto.length) html += esc(texto.slice(pos));
    container.innerHTML = html;

    // NOVO: eventos de tooltip para highlights
    container.querySelectorAll('.highlight').forEach(span => {
      const comment = span.getAttribute('data-comment');
      if (comment && comment.trim()) {
        span.addEventListener('mouseenter', e => showTooltip(comment, e.clientX, e.clientY));
        span.addEventListener('mouseleave', hideTooltip);
        span.addEventListener('focus', e => showTooltip(comment, e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().bottom));
        span.addEventListener('blur', hideTooltip);
        span.addEventListener('click', e => {
          showTooltip(comment, e.clientX, e.clientY);
          setTimeout(hideTooltip, 2500);
        });
      }
    });
  }

  function drawRect(r, color, comment) {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = hexToRgba(color || '#4cc3ff', 0.25);
    ctx.strokeStyle = color || '#4cc3ff';
    ctx.lineWidth = 3;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
    // Tooltip para imagem: handled via mousemove/click
  }

  // NOVO: utilitário para obter lista de retângulos e base (tolerante a formatos antigos e string JSON)
  function extractRectsPack(ann) {
    let pack = ann?.rects ?? null;
    if (typeof pack === 'string') {
      try { pack = JSON.parse(pack); } catch (_) { pack = null; }
    }
    // 1) Se vier normalizado (rectsNormalized)
    if (Array.isArray(ann?.rectsNormalized) && ann.rectsNormalized.length) {
      return { list: ann.rectsNormalized, basisW: 1, basisH: 1, normalized: true };
    }
    // 2) Se rects for array simples (pixels)
    if (Array.isArray(pack)) {
      return { list: pack, basisW: null, basisH: null, normalized: false };
    }
    // 3) Se rects for objeto { basisW, basisH, items: [] }
    if (pack && Array.isArray(pack.items)) {
      return { list: pack.items, basisW: pack.basisW || null, basisH: pack.basisH || null, normalized: false };
    }
    // 4) Nada válido
    return { list: [], basisW: null, basisH: null, normalized: false };
  }

  // NOVO: converte coordenadas do retângulo para o canvas atual
  function mapRectToCanvas(r, basisW, basisH, normalized) {
    if (!canvas || !r) return r;
    if (normalized === true || (r.w <= 1 && r.h <= 1)) {
      // 0..1
      return { x: r.x * canvas.width, y: r.y * canvas.height, w: r.w * canvas.width, h: r.h * canvas.height };
    }
    if (basisW && basisH) {
      const sx = canvas.width / basisW;
      const sy = canvas.height / basisH;
      return { x: r.x * sx, y: r.y * sy, w: r.w * sx, h: r.h * sy };
    }
    // Fallback: tentar escalar pela dimensão natural da imagem
    const bw = (imgEl?.naturalWidth) || canvas.width;
    const bh = (imgEl?.naturalHeight) || canvas.height;
    const sx = canvas.width / bw, sy = canvas.height / bh;
    return { x: r.x * sx, y: r.y * sy, w: r.w * sx, h: r.h * sy };
  }

  function drawAllRects(annotations) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
      (annotations || []).filter(a => a.tipo === 'imagem').forEach(a => {
        const pack = extractRectsPack(a);
        pack.list.forEach(r => drawRect(mapRectToCanvas(r, pack.basisW, pack.basisH, pack.normalized), a.color, a.comment));
      });
    }
  

  async function markViewed(essayId) {
    const token = getToken();
    if (!token) return;
    try {
      const ok = await fetch(`${API}/red-corretores/${encodeURIComponent(essayId)}/visualizada`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ok.status === 200) localStorage.setItem(`correcao_viewed_${essayId}`, 'true');
    } catch(_) {}
  }

  function fitCanvas(annotations) {
    if (!imgEl || !canvas) return;
    // O canvas deve ter o mesmo tamanho da imagem exibida (natural)
    const w = imgEl.naturalWidth || imgEl.width;
    const h = imgEl.naturalHeight || imgEl.height;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';
    ctx = canvas.getContext('2d');
    drawAllRects(annotations);
  }

  // Função para remover listeners e tooltips antigos ao recarregar
  function cleanupEssayView() {
    if (tooltipEl) {
      tooltipEl.remove();
      tooltipEl = null;
    }
    if ($essayView) {
      $essayView.innerHTML = '<div id="imgCanvasContainer" style="position:relative;width:100%;height:auto;min-height:100px;"></div>';
    }
  }

  async function load() {
    // Limpa conteúdo e tooltips antigos
    cleanupEssayView();

    if (!essayId) {
      $loading && ($loading.style.display = 'none');
      $error && ($error.textContent = 'Redação não encontrada (id ausente).');
      $error && ($error.style.display = 'block');
      return;
    }

    $loading && ($loading.style.display = 'block');
    $empty && ($empty.style.display = 'none');
    $error && ($error.style.display = 'none');

    try {
      const token = getToken();
      const resp = await fetch(`${API}/correcao/aluno/${essayId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (resp.status === 401 || resp.status === 403) {
        $loading && ($loading.style.display = 'none');
        if ($error) {
          $error.textContent = 'Você precisa estar logado para ver a correção.';
          $error.style.display = 'block';
        }
        return;
      }
      if (!resp.ok) {
        // Para 404/500, informar sem travar a tela
        $loading && ($loading.style.display = 'none');
        if ($error) {
          $error.textContent = 'Erro ao carregar correção.';
          $error.style.display = 'block';
        }
        return;
      }

      const data = await resp.json();
      const essay = data.essay;
      const corr = data.correction;

      // Cabeçalhos/infos
      if ($tema) $tema.textContent = essay?.tema || 'Correção';
      const dt = essay?.createdAt ? new Date(essay.createdAt).toLocaleString('pt-BR') : '—';
      if ($info) $info.textContent = `Enviada em ${dt} · Modelo: ${essay?.tipoCorrecao?.toUpperCase() || '—'}`;

      const total = (corr?.notaTotal ?? essay?.notaTotal);
      if ($notaTotal) $notaTotal.textContent = (typeof total === 'number' ? total : '—');

      const corrUser = corr?.corretor;
      if ($corrNome) $corrNome.textContent = corrUser?.name || 'Corretor';
      if ($corrAvatar) $corrAvatar.src = avatarUrl(corrUser?.name, corrUser?.fotoPerfil || null);

      // Render redação
      if ($essayView) {
        // Já limpo pelo cleanupEssayView
        const imgCanvasContainer = document.getElementById('imgCanvasContainer');
        if (essay?.imagemUrl) {
          const img = document.createElement('img');
          img.id = 'essayImage';
          img.src = essay.imagemUrl;
          imgEl = img;

          const cvs = document.createElement('canvas');
          cvs.id = 'essayCanvas';
          canvas = cvs;

          imgCanvasContainer.appendChild(img);
          imgCanvasContainer.appendChild(cvs);

          // Ajuste de empilhamento
          imgCanvasContainer.style.position = 'relative';
          img.style.position = 'absolute';
          img.style.top = '0';
          img.style.left = '0';
          img.style.width = '100%';
          img.style.height = 'auto';
          cvs.style.position = 'absolute';
          cvs.style.top = '0';
          cvs.style.left = '0';
          cvs.style.width = '100%';
          cvs.style.height = '100%';

          // canvas overlay fix
          function fitAndSyncCanvas() {
            // Ajusta altura do container para altura da imagem
            const w = img.naturalWidth || img.width;
            const h = img.naturalHeight || img.height;
            if (w && h) {
              imgCanvasContainer.style.height = h * (img.offsetWidth / w) + 'px';
              cvs.width = w;
              cvs.height = h;
              cvs.style.width = '100%';
              cvs.style.height = '100%';
            }
            ctx = cvs.getContext('2d');
            drawAllRects(corr?.annotations || []);
          }
          if (img.complete) { fitAndSyncCanvas(); } else { img.onload = fitAndSyncCanvas; }
          window.addEventListener('resize', fitAndSyncCanvas);
          $essayView.addEventListener('scroll', fitAndSyncCanvas);
          setTimeout(fitAndSyncCanvas, 80);

          // Tooltip para marcações na imagem
          cvs.addEventListener('mousemove', function(e) {
            if (!corr?.annotations) return;
            const rect = cvs.getBoundingClientRect();
            const scaleX = cvs.width / rect.width;
            const scaleY = cvs.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            let found = null;
            corr.annotations.filter(a => a.tipo === 'imagem' && a.comment && a.comment.trim()).forEach(a => {
              const pack = extractRectsPack(a);
              pack.list.forEach(r => {
                const rr = mapRectToCanvas(r, pack.basisW, pack.basisH, pack.normalized);
                if (x >= rr.x && x <= rr.x + rr.w && y >= rr.y && y <= rr.y + rr.h) {
                  found = a;
                }
              });
            });
            if (found) {
              showTooltip(found.comment, e.clientX, e.clientY);
            } else {
              hideTooltip();
            }
          });
          cvs.addEventListener('mouseleave', hideTooltip);
          cvs.addEventListener('click', function(e) {
            if (!corr?.annotations) return;
            const rect = cvs.getBoundingClientRect();
            const scaleX = cvs.width / rect.width;
            const scaleY = cvs.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            let found = null;
            corr.annotations.filter(a => a.tipo === 'imagem' && a.comment && a.comment.trim()).forEach(a => {
              const pack = extractRectsPack(a);
              pack.list.forEach(r => {
                const rr = mapRectToCanvas(r, pack.basisW, pack.basisH, pack.normalized);
                if (x >= rr.x && x <= rr.x + rr.w && y >= rr.y && y <= rr.y + rr.h) {
                  found = a;
                }
              });
            });
            if (found) {
              showTooltip(found.comment, e.clientX, e.clientY);
              setTimeout(hideTooltip, 2500);
            }
          });
        } else {
          const div = document.createElement('div');
          div.className = 'essay-text';
          $essayView.appendChild(div);
          applyTextAnnotations(div, essay?.texto || essay?.text || '', corr?.annotations || []);

          // Tooltip para highlights de texto
          setTimeout(() => {
            div.querySelectorAll('.highlight').forEach(span => {
              const comment = span.getAttribute('data-comment');
              if (comment && comment.trim()) {
                span.addEventListener('mouseenter', e => showTooltip(comment, e.clientX, e.clientY));
                span.addEventListener('mouseleave', hideTooltip);
                span.addEventListener('focus', e => showTooltip(comment, e.target.getBoundingClientRect().left, e.target.getBoundingClientRect().bottom));
                span.addEventListener('blur', hideTooltip);
                span.addEventListener('click', e => {
                  showTooltip(comment, e.clientX, e.clientY);
                  setTimeout(hideTooltip, 2500);
                });
              }
            });
          }, 200);
        }
      }

      // Observações por competência (busca por tipo: 'comp' ou similar)
      let obsPorComp = {};
      if (corr?.annotations && Array.isArray(corr.annotations)) {
        corr.annotations.forEach(a => {
          if (a.tipo === 'comp' && a.rangeStart && a.comment) {
            obsPorComp[a.rangeStart] = a.comment;
          }
        });
      }

      renderNotas(corr?.notas || null, obsPorComp);

      if ($comentarios) $comentarios.textContent = corr?.comentariosGerais || '—';

      // Observações
      if ($obsList) {
        $obsList.innerHTML = '';
        (corr?.annotations || []).forEach(a => {
          const item = document.createElement('div');
          item.className = 'obs-item';
          const dot = `<span class="obs-dot" style="background:${a.color||'#ffea00'}"></span>`;
          const title = a.tipo === 'texto'
            ? (a.snippet ? a.snippet.slice(0, 80) : 'Trecho destacado')
            : 'Marcação na imagem';
          item.innerHTML = `
            <div class="obs-title">${dot}${title}</div>
            <div class="obs-text">${(a.comment || '—').replace(/\n/g,'<br>')}</div>
          `;
          $obsList.appendChild(item);
        });
      }

      // Marca como visualizada
      markViewed(essayId);

      // Estados
      $loading && ($loading.style.display = 'none');
      if (!corr) $empty && ($empty.style.display = 'block');
    } catch (e) {
      console.error('[corrigidas] erro:', e);
      $loading && ($loading.style.display = 'none');
      if ($error) {
        $error.textContent = 'Erro ao carregar correção.';
        $error.style.display = 'block';
      }
    }
  }

  // Garante recarregamento ao voltar/navegar entre correções
  function setupRouterReload() {
    // Para Framework7 ou navegação SPA
    window.addEventListener('popstate', () => setTimeout(load, 50));
    window.addEventListener('hashchange', () => setTimeout(load, 50));
    // Para navegação por links internos
    document.body.addEventListener('click', function (e) {
      const t = e.target.closest('a');
      if (t && (t.href || '').includes('corrigidas')) {
        setTimeout(load, 100);
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => { load(); setupRouterReload(); }, 30);
  } else {
    document.addEventListener('DOMContentLoaded', () => { load(); setupRouterReload(); });
  }
})();
