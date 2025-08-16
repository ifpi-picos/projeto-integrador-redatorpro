(function () {
  const API = 'https://express-e3hm.onrender.com';
  const params = new URLSearchParams(location.search);
  const essayId = parseInt(params.get('id'), 10);

  const $tema = document.getElementById('temaTxt');
  const $info = document.getElementById('infoTxt');
  const $notaTotal = document.getElementById('notaTotalTxt');
  const $corrInfo = document.getElementById('corretorInfo');
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
    return user?.token || '';
  }

  function hexToRgba(hex, alpha = 0.5) {
    if (!hex) return `rgba(255,234,0,${alpha})`;
    let c = hex.replace('#', '');
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

  function drawAllRects(annotations) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    (annotations || []).filter(a=>a.tipo==='imagem').forEach(a => {
      (a.rects || []).forEach(r => drawRect(r, a.color));
    });
  }

  async function markViewed(essayId) {
    try {
      const ok = await fetch(`${API}/red-corretores/${encodeURIComponent(essayId)}/visualizada`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (ok.status === 200) localStorage.setItem(`correcao_viewed_${essayId}`, 'true');
    } catch(_) {}
  }

  async function load() {
    if (!essayId) { $loading.style.display = 'none'; $error.style.display = 'block'; return; }
    $loading.style.display = 'block'; $empty.style.display = 'none'; $error.style.display = 'none';

    try {
      const resp = await fetch(`${API}/correcao/aluno/${essayId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!resp.ok) { $loading.style.display = 'none'; $error.style.display = 'block'; return; }
      const data = await resp.json();

      const essay = data.essay;
      const corr = data.correction;

      $tema.textContent = essay?.tema || 'Correção';
      const dt = essay?.createdAt ? new Date(essay.createdAt).toLocaleString('pt-BR') : '—';
      $info.textContent = `Enviada em ${dt} · Modelo: ${essay?.tipoCorrecao?.toUpperCase() || '—'}`;

      // Nota total: mostra "—" quando ausente
      const total = (corr?.notaTotal ?? essay?.notaTotal);
      $notaTotal.textContent = (typeof total === 'number' ? total : '—');

      const corrUser = corr?.corretor;
      $corrNome.textContent = corrUser?.name || 'Corretor';
      $corrAvatar.src = avatarUrl(corrUser?.name, corrUser?.fotoPerfil || null);

      // Render redação
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

        const fitCanvas = () => {
          if (!imgEl || !canvas) return;
          // Usa dimensões reais do elemento renderizado
          const w = imgEl.clientWidth || imgEl.naturalWidth || 0;
          const h = imgEl.clientHeight || imgEl.naturalHeight || 0;
          if (!w || !h) return;
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = w + 'px';
          canvas.style.height = h + 'px';
          // Alinha no (0,0) do container (CSS já posiciona absolute)
          canvas.style.left = '0px';
          canvas.style.top = '0px';
          ctx = canvas.getContext('2d');
          drawAllRects(corr?.annotations || []);
        };
        img.onload = fitCanvas;
        window.addEventListener('resize', fitCanvas);
        setTimeout(fitCanvas, 50);
      } else {
        const div = document.createElement('div');
        div.className = 'essay-text';
        $essayView.appendChild(div);
        applyTextAnnotations(div, essay?.texto || essay?.text || '', corr?.annotations || []);
      }

      // Notas e comentários
      renderNotas(corr?.notas || null);
      $comentarios.textContent = corr?.comentariosGerais || '—';

      // Observações (lista a partir das annotations)
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

      // Marca como visualizada
      markViewed(essayId);

      // Done
      $loading.style.display = 'none';
      if (!corr) $empty.style.display = 'block';
    } catch (e) {
      console.error('[corrigidas] erro:', e);
      $loading.style.display = 'none';
      $error.style.display = 'block';
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(load, 30);
  } else {
    document.addEventListener('DOMContentLoaded', load);
  }
})();
