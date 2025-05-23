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
          <div class="redacao-actions">
            <button class="btn-exibir-correcao">Exibir correção</button>
            <button class="btn-baixar-pdf">
              <i class="mdi mdi-file-pdf" style="margin-right:6px"></i>Baixar PDF
            </button>
          </div>
          <div class="correcao-ia" style="display:none;">${redacao.correcaoIa || 'Sem correção.'}</div>
        </div>
      `;

      // Ao clicar no card, mostra/oculta detalhes
      card.addEventListener('click', function (e) {
        // Só abre se clicar fora do botão
        if (e.target.classList.contains('btn-exibir-correcao') || e.target.classList.contains('btn-baixar-pdf')) return;
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

      // Botão para baixar PDF
      const btnPdf = card.querySelector('.btn-baixar-pdf');
      if (btnPdf) {
        btnPdf.addEventListener('click', async function (e) {
          e.stopPropagation();
          btnPdf.disabled = true;
          btnPdf.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Gerando PDF...';
          try {
            const response = await fetch('https://express-e3hm.onrender.com/pdf/gerar-pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texto: redacao.text })
            });
            if (!response.ok) throw new Error('Erro ao gerar PDF');
            const blob = await response.blob();
            if (blob.size === 0) throw new Error('PDF vazio');
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'redacao.pdf';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);
            }, 200);
          } catch (err) {
            alert('Erro ao gerar PDF. Tente novamente.');
          }
          btnPdf.disabled = false;
          btnPdf.innerHTML = '<i class="mdi mdi-file-pdf" style="margin-right:6px"></i>Baixar PDF';
        });
      }

      lista.appendChild(card);
    } catch (err) {
      // Silencia erros de renderização individuais
    }
  });
};