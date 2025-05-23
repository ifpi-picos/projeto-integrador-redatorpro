window.initRedacoes = async function () {
  const lista = document.getElementById('text-list');
  if (!lista) {
    return;
  }
  lista.innerHTML = '<p>Carregando...</p>';

  // Verifica se o usuário está logado
  const user = JSON.parse(localStorage.getItem('loggedUser'));
  if (!user) {
    lista.innerHTML = '<p>Você precisa estar logado para ver suas redações.</p>';
    return;
  }

  let redacoes = [];
  try {
    const resp = await fetch('https://express-e3hm.onrender.com/redacoes', {
      credentials: 'include'
    });
    if (resp.status === 401) {
      lista.innerHTML = '<p>Você precisa estar logado para ver suas redações.</p>';
      return;
    }
    redacoes = await resp.json();
  } catch (e) {
    lista.innerHTML = '<p>Erro ao carregar redações.</p>';
    return;
  }

  if (!Array.isArray(redacoes)) {
    lista.innerHTML = '<p>Erro inesperado no formato das redações.</p>';
    return;
  }

  // FILTRA apenas as redações do usuário logado
  redacoes = redacoes.filter(r => r.authorId === user.id);

  if (!redacoes.length) {
    lista.innerHTML = '<p id="no-results">Não encontramos nada por aqui...</p>';
    return;
  }

  lista.innerHTML = '';
  redacoes.forEach((redacao, idx) => {
    try {
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
      const btnCorrecao = card.querySelector('.btn-exibir-correcao');
      if (btnCorrecao) {
        btnCorrecao.addEventListener('click', function (e) {
          e.stopPropagation();
          const correcao = card.querySelector('.correcao-ia');
          correcao.style.display = correcao.style.display === 'none' ? 'block' : 'none';
          this.innerText = correcao.style.display === 'block' ? 'Ocultar correção' : 'Exibir correção';
        });
      }

      lista.appendChild(card);
    } catch (err) {
      // Silencia erros de renderização individuais
    }
  });
};