window.initRedacoes = async function () {
  const lista = document.getElementById('text-list');
  if (!lista) {
    console.log('[redacoes.js] Elemento #text-list não encontrado.');
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
    console.error('[redacoes.js] Erro ao carregar redações:', e);
    lista.innerHTML = '<p>Erro ao carregar redações.</p>';
    return;
  }

  if (!Array.isArray(redacoes)) {
    console.error('[redacoes.js] O retorno da API não é um array:', redacoes);
    lista.innerHTML = '<p>Erro inesperado no formato das redações.</p>';
    return;
  }

  if (!redacoes.length) {
    lista.innerHTML = '<p id="no-results">Não encontramos nada por aqui...</p>';
    return;
  }

  // --- Filtro por tipoCorrecao ---
  let filtroAtual = ""; // valor padrão (sem filtro)
  window.filtrarEspecialidade = function(tipo) {
    filtroAtual = tipo;
    renderizarRedacoes();
  };

  // --- Filtro por busca ---
  window.filtrar = function() {
    renderizarRedacoes();
  };

  // Mapeamento para normalizar os filtros
  const mapFiltro = {
    'enem': ['enem'],
    'fuvest': ['fuvest'],
    'fcc': ['concursos', 'fcc'],
    'vestibular': ['fuvest', 'vestibular', 'vest'],
    'ita': ['ita', 'concursos', 'fcc'] // Adiciona ita para garantir compatibilidade
  };

  function renderizarRedacoes() {
    let filtradas = redacoes;

    // Filtro por tipoCorrecao
    if (filtroAtual && filtroAtual !== "") {
      let tipoFiltro = filtroAtual.toLowerCase();
      let tiposAceitos = mapFiltro[tipoFiltro] || [tipoFiltro];
      console.log('[redacoes.js] Filtro aplicado:', tipoFiltro, 'Tipos aceitos:', tiposAceitos);
      filtradas = filtradas.filter(r =>
        tiposAceitos.includes((r.tipoCorrecao || '').toLowerCase())
      );
      console.log('[redacoes.js] Redações após filtro:', filtradas.length);
    }

    // Filtro por busca
    const busca = (document.getElementById('inputBusca')?.value || "").toLowerCase();
    if (busca) {
      filtradas = filtradas.filter(r =>
        (r.tema || "").toLowerCase().includes(busca) ||
        (r.text || "").toLowerCase().includes(busca)
      );
    }

    lista.innerHTML = '';
    if (!filtradas.length) {
      lista.innerHTML = '<p id="no-results">Não encontramos nada por aqui...</p>';
      return;
    }

    filtradas.forEach((redacao, idx) => {
      try {
        // Troque <a> por <div> para evitar conflitos de download
        const card = document.createElement('div');
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
          if (e.target.classList.contains('btn-exibir-correcao') || e.target.classList.contains('btn-baixar-pdf')) return;
          e.preventDefault?.();
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
            e.preventDefault?.();
            console.log('[redacoes.js] Clique no botão Baixar PDF para redação #'+idx);
            if (!redacao.text || !redacao.text.trim()) {
              alert('Não há texto para gerar o PDF.');
              return;
            }
            btnPdf.disabled = true;
            btnPdf.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Gerando PDF...';
            try {
              // --- Inspirado na folha.js ---
              const response = await fetch("https://express-e3hm.onrender.com/pdf/gerar-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ texto: redacao.text }),
              });
              console.log("[redacoes.js] Resposta recebida:", response);
              if (!response.ok) throw new Error("Erro ao gerar PDF: " + response.status);
              const blob = await response.blob();
              console.log("[redacoes.js] Blob recebido:", blob);
              if (blob.size === 0) throw new Error("O PDF gerado está vazio!");
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.style.display = "none";
              a.href = url;
              a.download = "redacao.pdf";
              document.body.appendChild(a);
              setTimeout(() => {
                a.dispatchEvent(new MouseEvent('click'));
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                console.log("[redacoes.js] PDF baixado com sucesso!");
              }, 100);
            } catch (err) {
              console.error('[redacoes.js] Erro ao gerar PDF:', err);
              alert('Erro ao gerar PDF. Tente novamente.');
            }
            btnPdf.disabled = false;
            btnPdf.innerHTML = '<i class="mdi mdi-file-pdf" style="margin-right:6px"></i>Baixar PDF';
          });
        }

        lista.appendChild(card);
      } catch (err) {
        console.error('[redacoes.js] Erro ao renderizar card da redação:', err);
      }
    });
  }

  // Inicializa a lista sem filtro
  renderizarRedacoes();
};