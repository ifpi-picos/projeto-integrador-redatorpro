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
    'ita': ['ita', 'concursos', 'fcc']
  };

  function renderizarRedacoes() {
    let filtradas = redacoes;

    // Filtro por tipoCorrecao
    if (filtroAtual && filtroAtual !== "") {
      let tipoFiltro = filtroAtual.toLowerCase();
      let tiposAceitos = mapFiltro[tipoFiltro] || [tipoFiltro];
      filtradas = filtradas.filter(r =>
        tiposAceitos.includes((r.tipoCorrecao || '').toLowerCase())
      );
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

    filtradas.forEach((redacao) => {
      const card = document.createElement('div');
      card.className = 'item redacao-card';

      // Define a prévia do texto ou mensagem padrão
      const preview = redacao.texto
        ? redacao.texto.slice(0, 80) + (redacao.texto.length > 80 ? '...' : '')
        : '<span style="color:#1976d2;">Redação enviada como imagem</span>';

      // Corpo do card
      card.innerHTML = `
        <div class="redacao-info">
          <div class="redacao-header">
            <span class="redacao-tema">Tema: <b>${redacao.tema || '-'}</b></span>
            <span class="redacao-nota">Nota: <b>${redacao.nota ?? '-'}</b></span>
          </div>
          <div class="redacao-preview">${preview}</div>
        </div>
        <div class="redacao-detalhes" style="display:none;">
          <div class="redacao-texto">${redacao.texto || ''}</div>
          ${
            redacao.imagem
              ? `<div class="container-redacao-img">
                   <img src="${redacao.imagem}" alt="Redação enviada como imagem" style="max-width:100%; border-radius:8px;">
                 </div>`
              : ''
          }
        </div>
      `;

      // Adiciona o card à lista
      lista.appendChild(card);
    });
  }

  // Função utilitária para gerar PDF com imagem (usando pdf-lib via CDN)
  async function gerarPdfComImagem(blob) {
    // Carrega pdf-lib dinamicamente se necessário
    if (!window.PDFLib) {
      await new Promise(resolve => {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/npm/pdf-lib/dist/pdf-lib.min.js";
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }
    const { PDFDocument, rgb } = window.PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 900]);
    // Fundo azul claro igual ao texto
    page.drawRectangle({
      x: 0, y: 0, width: 600, height: 900, color: rgb(0.82, 0.92, 0.98)
    });
    // Borda decorativa
    page.drawRectangle({
      x: 10, y: 10, width: 580, height: 880,
      borderColor: rgb(0.13, 0.45, 0.82), borderWidth: 2, color: rgb(1, 1, 1, 0)
    });
    // Título
    const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
    const titulo = "Folha de Redação";
    const larguraTitulo = font.widthOfTextAtSize(titulo, 18);
    page.drawText(titulo, {
      x: (600 - larguraTitulo) / 2,
      y: 900 - 35,
      size: 18,
      font: font,
      color: rgb(0.13, 0.45, 0.82),
    });
    // Adiciona a imagem centralizada
    const imgBytes = await blob.arrayBuffer();
    let img;
    let imgDims;
    if (blob.type === "image/png") {
      img = await pdfDoc.embedPng(imgBytes);
      imgDims = img.scale(1);
    } else {
      img = await pdfDoc.embedJpg(imgBytes);
      imgDims = img.scale(1);
    }
    // Calcula tamanho para caber na folha
    let maxW = 540, maxH = 700;
    let w = imgDims.width, h = imgDims.height;
    let scale = Math.min(maxW / w, maxH / h, 1);
    w = w * scale;
    h = h * scale;
    page.drawImage(img, {
      x: (600 - w) / 2,
      y: 120,
      width: w,
      height: h
    });
    // Rodapé decorativo
    page.drawLine({
      start: { x: 50, y: 15 },
      end: { x: 600 - 50, y: 15 },
      thickness: 1.5,
      color: rgb(0.13, 0.45, 0.82),
    });
    return await pdfDoc.save();
  }

  // Inicializa a lista sem filtro
  renderizarRedacoes();
};