document.addEventListener('DOMContentLoaded', async function () {
  const lista = document.getElementById('text-list');
  lista.innerHTML = '<p>Carregando...</p>';

  // Verifica se o usuário está logado
  const user = JSON.parse(localStorage.getItem('loggedUser'));
  console.log('[redacoes.js] Usuário logado:', user);
  if (!user) {
    lista.innerHTML = '<p>Você precisa estar logado para ver suas redações.</p>';
    return;
  }

  let redacoes = [];
  try {
    console.log('[redacoes.js] Buscando redações da API...');
    const resp = await fetch('https://express-e3hm.onrender.com/redacoes', {
      credentials: 'include'
    });
    console.log('[redacoes.js] Status da resposta:', resp.status);
    if (resp.status === 401) {
      lista.innerHTML = '<p>Você precisa estar logado para ver suas redações.</p>';
      return;
    }
    redacoes = await resp.json();
    console.log('[redacoes.js] Redações recebidas:', redacoes);
  } catch (e) {
    console.error('[redacoes.js] Erro ao carregar redações:', e);
    lista.innerHTML = '<p>Erro ao carregar redações.</p>';
    return;
  }

  if (!redacoes.length) {
    lista.innerHTML = '<p id="no-results">Não encontramos nada por aqui...</p>';
    return;
  }

  lista.innerHTML = '';
  redacoes.forEach(redacao => {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'item redacao-card';

    card.innerHTML = `
      <div class="redacao-info">
        <div class="redacao-header">
          <span class="redacao-tema">Tema: <b>${redacao.tema || '-'}</b></span>
          <span class="redacao-nota">Nota: <b>${redacao.notaTotal ?? '-'}</b></span>
        </div>
        <div class="redacao-preview">${(redacao.text || '').slice(0, 80)}${redacao.text && redacao.text.length > 80 ? '...' : ''}</div>
      </div>
      <div class="redacao-detalhes" style="display:none;">
        <div class="redacao-texto">${redacao.text}</div>
        <button class="btn-exibir-correcao">Exibir correção</button>
        <div class="correcao-ia" style="display:none;">${redacao.correcaoIa || 'Sem correção.'}</div>
      </div>
    `;

    // Ao clicar no card, mostra/oculta detalhes
    card.addEventListener('click', function (e) {
      // Só abre se clicar fora do botão
      if (e.target.classList.contains('btn-exibir-correcao')) return;
      e.preventDefault();
      const detalhes = card.querySelector('.redacao-detalhes');
      detalhes.style.display = detalhes.style.display === 'none' ? 'block' : 'none';
    });

    // Botão para exibir correção
    card.querySelector('.btn-exibir-correcao').addEventListener('click', function (e) {
      e.stopPropagation();
      const correcao = card.querySelector('.correcao-ia');
      correcao.style.display = correcao.style.display === 'none' ? 'block' : 'none';
      this.innerText = correcao.style.display === 'block' ? 'Ocultar correção' : 'Exibir correção';
    });

    lista.appendChild(card);
  });
});