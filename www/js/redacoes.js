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

    filtradas.forEach((redacao, idx) => {
      try {
        const card = document.createElement('div');
        card.className = 'item redacao-card';

        // Garante que a prévia do texto SEMPRE aparece para texto, nunca para imagem
        let previewHtml = '';
        if (redacao.urlImage) {
          previewHtml = '<span style="color:#1976d2;">Redação enviada como imagem</span>';
        } else if (typeof redacao.text === 'string' && redacao.text.trim().length > 0) {
          // Remove quebras de linha e espaços extras para a prévia
          const previewText = redacao.text.replace(/\s+/g, ' ').trim();
          previewHtml = previewText.slice(0, 80) + (previewText.length > 80 ? '...' : '');
        } else {
          previewHtml = '';
        }

        // Corpo do card
        card.innerHTML = `
          <div class="redacao-info">
            <div class="redacao-header">
              <span class="redacao-tema">Tema: <b>${redacao.tema || '-'}</b></span>
              <span class="redacao-nota">Nota: <b>${redacao.notaTotal ?? '-'}</b></span>
            </div>
            <div class="redacao-preview">${previewHtml}</div>
          </div>
          <div class="redacao-detalhes" style="display:none;">
            <div class="redacao-texto">${
              redacao.urlImage
                ? ''
                : (typeof redacao.text === 'string' && redacao.text.trim().length > 0 ? redacao.text : '')
            }</div>
            <div class="redacao-texto">
              ${
                redacao.urlImage
                  ? `<button class="btn-exibir-imagem" style="background:#246493;color:#fff;border:none;padding:8px 18px;border-radius:5px;cursor:pointer;margin-bottom:10px;">Exibir redação</button>
                     <div class="container-redacao-img" style="display:none; margin-bottom:10px; text-align:center;">
                       <img src="${redacao.urlImage}" alt="Redação enviada" style="max-width:98vw;max-height:420px;border-radius:8px;box-shadow:0 2px 8px #0002;display:block;margin:0 auto 12px auto;">
                       <button class="btn-ocultar-imagem" style="background:#b00;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;">Ocultar redação</button>
                     </div>`
                  : ''
              }
            </div>
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
          if (
            e.target.classList.contains('btn-exibir-correcao') ||
            e.target.classList.contains('btn-baixar-pdf') ||
            e.target.classList.contains('btn-exibir-imagem') ||
            e.target.classList.contains('btn-ocultar-imagem')
          ) return;
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

        // Botão para exibir/ocultar imagem da redação
        if (redacao.urlImage) {
          const btnExibirImg = card.querySelector('.btn-exibir-imagem');
          const btnOcultarImg = card.querySelector('.btn-ocultar-imagem');
          const containerImg = card.querySelector('.container-redacao-img');
          if (btnExibirImg && containerImg) {
            btnExibirImg.addEventListener('click', function (e) {
              e.stopPropagation();
              containerImg.style.display = 'block';
              btnExibirImg.style.display = 'none';
            });
          }
          if (btnOcultarImg && btnExibirImg && containerImg) {
            btnOcultarImg.addEventListener('click', function (e) {
              e.stopPropagation();
              containerImg.style.display = 'none';
              btnExibirImg.style.display = 'inline-block';
            });
          }
        }

        // Botão para baixar PDF ou imagem
        const btnPdf = card.querySelector('.btn-baixar-pdf');
        if (btnPdf) {
          btnPdf.addEventListener('click', async function (e) {
            e.stopPropagation();
            e.preventDefault?.();
            btnPdf.disabled = true;
            btnPdf.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Baixando...';
            try {
              if (redacao.urlImage) {
                // Baixar a imagem original
                const response = await fetch(redacao.urlImage);
                if (!response.ok) throw new Error("Erro ao baixar imagem: " + response.status);
                const blob = await response.blob();
                if (blob.size === 0) throw new Error("A imagem está vazia!");
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                // Tenta extrair extensão da imagem
                let ext = "";
                if (blob.type === "image/png") ext = ".png";
                else if (blob.type === "image/jpeg") ext = ".jpg";
                else ext = "";
                a.download = "redacao-imagem" + ext;
                document.body.appendChild(a);
                setTimeout(() => {
                  a.dispatchEvent(new MouseEvent('click'));
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                }, 100);
              } else if (redacao.text && redacao.text.trim()) {
                // PDF do texto
                const response = await fetch("https://express-e3hm.onrender.com/pdf/gerar-pdf", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ texto: redacao.text }),
                });
                if (!response.ok) throw new Error("Erro ao gerar PDF: " + response.status);
                const blob = await response.blob();
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
                }, 100);
              } else {
                alert('Não há texto ou imagem para baixar.');
              }
            } catch (err) {
              alert('Erro ao baixar arquivo. Tente novamente.');
            }
            btnPdf.disabled = false;
            btnPdf.innerHTML = '<i class="mdi mdi-file-pdf" style="margin-right:6px"></i>Baixar Redação';
          });
        }

        lista.appendChild(card);
      } catch (err) {
        // Silencia erros de renderização individuais
      }
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