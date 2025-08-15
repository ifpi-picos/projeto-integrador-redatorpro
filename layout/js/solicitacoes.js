(function () {
  const API = 'https://express-e3hm.onrender.com/red-corretores/solicitacoes';
  const $list = document.getElementById('sol-list');
  const $loading = document.getElementById('sol-loading');
  const $empty = document.getElementById('sol-empty');

  const routeByType = (tipo, essayId) => {
    const t = String(tipo || '').toLowerCase();
    const map = {
      enem: 'correcao.html',
      concursos: 'correcao-fcc.html',
      fcc: 'correcao-fcc.html',
      fuvest: 'correcao-fuvest.html'
    };
    const page = map[t] || 'correcao.html';
    window.location.href = `${page}?id=${encodeURIComponent(essayId)}`;
  };

  function fmtData(d) {
    try {
      const date = new Date(d);
      return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (_) { return ''; }
  }

  function avatar(aluno) {
    if (aluno?.fotoPerfil) return aluno.fotoPerfil;
    const nome = encodeURIComponent(aluno?.name || 'Aluno');
    return `https://ui-avatars.com/api/?name=${nome}&background=4c6fff&color=fff`;
  }

  function buildCard(item) {
    const data = fmtData(item.createdAt);
    const aluno = item.aluno || {};
    const texto = typeof item.texto === 'string' ? item.texto.replace(/\s+/g, ' ').trim() : '';
    const limite = 200;
    const temResto = texto.length > limite;
    const preview = texto.slice(0, limite);
    const restante = temResto ? texto.slice(limite) : '';

    const card = document.createElement('article');
    card.className = `sol-card ${item.status === 'Corrigida' ? 'is-corrigida' : 'is-pendente'}`;
    card.tabIndex = 0; // acessibilidade: permite foco no card
    card.innerHTML = `
      <div class="sol-head">
        <div class="aluno">
          <img class="aluno-avatar" src="${avatar(aluno)}" alt="${aluno.name || 'Aluno'}">
          <div class="aluno-info">
            <div class="aluno-nome">${aluno.name || 'Aluno'}</div>
          </div>
        </div>
        <div class="meta">
          <span class="sol-data"><i class="ri-calendar-line"></i> ${data || ''}</span>
          <span class="sol-status ${item.status === 'Corrigida' ? 'ok' : 'pend'}">${item.status}</span>
        </div>
      </div>
      <div class="sol-body">
        <div class="row">
          <span class="label">Tipo:</span>
          <span class="value">${item.tipoCorrecao || '—'}</span>
        </div>
        <div class="row">
          <span class="label">Tema:</span>
          <span class="value">${item.tema || '—'}</span>
        </div>
        <div class="texto">
          ${
            item.imagemUrl
              ? `<div class="img-note"><i class="ri-image-2-line"></i> Redação enviada como imagem</div>
                 <img class="thumb" loading="lazy" src="${item.imagemUrl}" alt="Redação enviada">`
              : `
                <span class="txt-preview">${preview || '<i>Sem texto enviado</i>'}</span>
                ${temResto ? `<span class="txt-resto">${restante}</span>
                <button class="toggle more" type="button">ver mais</button>
                <button class="toggle less" type="button" style="display:none;">ver menos</button>` : ''}
              `
          }
        </div>
      </div>
      <div class="sol-actions">
        <button class="btn-corrigir" type="button" data-id="${item.id}" data-tipo="${item.tipoCorrecao || ''}">
          <i class="ri-edit-2-line"></i> Corrigir
        </button>
      </div>
    `;

    if (!item.imagemUrl && temResto) {
      const btnMore = card.querySelector('.toggle.more');
      const btnLess = card.querySelector('.toggle.less');
      btnMore?.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('expanded');
        btnMore.style.display = 'none';
        if (btnLess) btnLess.style.display = 'inline-block';
      });
      btnLess?.addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.remove('expanded');
        btnLess.style.display = 'none';
        if (btnMore) btnMore.style.display = 'inline-block';
      });
    }

    const btnCorrigir = card.querySelector('.btn-corrigir');
    btnCorrigir?.addEventListener('click', () => {
      routeByType(btnCorrigir.getAttribute('data-tipo'), btnCorrigir.getAttribute('data-id'));
    });

    return card;
  }

  async function load() {
    $loading.style.display = 'block';
    $empty.style.display = 'none';
    $list.innerHTML = '';

    try {
      const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
      const token = user?.token;
      if (!token) {
        $loading.style.display = 'none';
        $empty.style.display = 'block';
        $empty.textContent = 'Faça login como corretor para ver as solicitações.';
        return;
      }

      const resp = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (!resp.ok) throw new Error('Falha ao buscar solicitações');
      const data = await resp.json();

      const items = Array.isArray(data) ? data : [];
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // reforço

      if (!items.length) {
        $loading.style.display = 'none';
        $empty.style.display = 'block';
        return;
      }

      items.forEach(item => $list.appendChild(buildCard(item)));
      $loading.style.display = 'none';
    } catch (err) {
      console.error('[Solicitações] Erro ao carregar:', err);
      $loading.style.display = 'none';
      $empty.style.display = 'block';
      $empty.textContent = 'Erro ao carregar solicitações.';
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(load, 50);
  } else {
    document.addEventListener('DOMContentLoaded', load);
  }
})();
