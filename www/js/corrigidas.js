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

  const $essayView = document.getElementById('essayView');
  const $competencias = document.getElementById('competenciasBox');
  const $comentarios = document.getElementById('comentariosBox');
  const $obsList = document.getElementById('obsList');

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
    let c = (hex || '#ffea00').replace('#', '');
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

  function renderNotas(notasObj) {
    if (!$competencias) return;
    $competencias.innerHTML = '';
    const labels = ['Competência 1','Competência 2','Competência 3','Competência 4','Competência 5'];
    for (let i = 1; i <= 5; i++) {
      const v = (notasObj && (notasObj[i] ?? notasObj[String(i)])) ?? 0;
      const l = document.createElement('div'); l.className='comp-label'; l.textContent = labels[i-1];
      const r = document.createElement('div'); r.className='comp-valor'; r.textContent = `${v} pts`;
      $competencias.appendChild(l); $competencias.appendChild(r);
    }
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
      html += `<span class="highlight" style="background:${hexToRgba(a.color||'#ffea00',0.5)}">${esc(snippet)}</span>`;
      pos = e;
    });
    if (pos < texto.length) html += esc(texto.slice(pos));
    container.innerHTML = html;
  }

  function drawRect(r, color) {
    if (!ctx) return;
    ctx.save();
    ctx.fillStyle = hexToRgba(color || '#ffea00', 0.35);
    ctx.strokeStyle = color || '#ffea00';
    ctx.lineWidth = 2;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeRect(r.x, r.y, r.w, r.h);
    ctx.restore();
  }

  // NOVO: converte diferentes formatos de rects para coordenadas do canvas atual
  function mapRectToCanvas(r, ann) {
    if (!canvas) return r;
    // 1) Normalizado (0..1)
    if (r && r.w <= 1 && r.h <= 1) {
      return { x: r.x * canvas.width, y: r.y * canvas.height, w: r.w * canvas.width, h: r.h * canvas.height };
    }
    // 2) Com base (basisW/H) no próprio objeto da anotação
    const basisW = ann?.basisW || ann?.imageW || (Array.isArray(ann?.rects?.items) ? ann.rects.basisW : null) || null;
    const basisH = ann?.basisH || ann?.imageH || (Array.isArray(ann?.rects?.items) ? ann.rects.basisH : null) || null;
    if (basisW && basisH) {
      const sx = canvas.width / basisW;
      const sy = canvas.height / basisH;
      return { x: r.x * sx, y: r.y * sy, w: r.w * sx, h: r.h * sy };
    }
    // 3) Pixel bruto (melhor esforço): desenha como está
    return r;
  }

  function drawAllRects(annotations) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    (annotations || []).filter(a => a.tipo === 'imagem').forEach(a => {
      // Suporta rects como array bruto, normalizado ou objeto {basisW,basisH,items:[]}
      const pack = a.rects;
      const list = Array.isArray(pack) ? pack : (Array.isArray(pack?.items) ? pack.items : []);
      list.forEach(r => drawRect(mapRectToCanvas(r, (Array.isArray(pack) ? a : { ...a, basisW: pack?.basisW, basisH: pack?.basisH })), a.color));
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
    const w = imgEl.clientWidth || imgEl.naturalWidth || 0;
    const h = imgEl.clientHeight || imgEl.naturalHeight || 0;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.style.left = (imgEl.offsetLeft || 0) + 'px';
    canvas.style.top = (imgEl.offsetTop || 0) + 'px';

    ctx = canvas.getContext('2d');
    drawAllRects(annotations);
  }

  async function load() {
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
        $essayView.innerHTML = '';
        if (essay?.imagemUrl) {
          const img = document.createElement('img');
          img.id = 'essayImage';
          img.src = essay.imagemUrl;
          imgEl = img;

          const cvs = document.createElement('canvas');
          cvs.id = 'essayCanvas';
          canvas = cvs;

          $essayView.appendChild(img);
          $essayView.appendChild(cvs);

          const fit = () => fitCanvas(corr?.annotations || []);
          if (img.complete) {
            // Imagem já em cache
            fit();
          } else {
            img.onload = fit;
          }
          window.addEventListener('resize', fit);
          setTimeout(fit, 80);
        } else {
          const div = document.createElement('div');
          div.className = 'essay-text';
          $essayView.appendChild(div);
          applyTextAnnotations(div, essay?.texto || essay?.text || '', corr?.annotations || []);
        }
      }

      renderNotas(corr?.notas || null);
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

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(load, 30);
  } else {
    document.addEventListener('DOMContentLoaded', load);
  }
})();
