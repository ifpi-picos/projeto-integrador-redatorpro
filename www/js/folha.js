window.initFolha = function() {
  console.log('Inicializando folha.js');

  const submitButton = document.querySelector(".submit-button");
  if (!submitButton) {
    console.error("Botão de envio não encontrado!");
    return;
  }

  submitButton.addEventListener("click", async () => {
    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];
    const textArea = document.querySelector(".area");
    const text = textArea.value;

    if (!file && !text) {
      alert("Selecione um arquivo ou escreva um texto antes de enviar!");
      return;
    }

    const formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    formData.append("text", text);

    try {
      const response = await fetch("https://express-e3hm.onrender.com/server", {
        method: "POST",
        body: formData,
        credentials: 'include' // Envia cookies para manter a sessão
      });
      const responseText = await response.text();
      console.log("Resposta do servidor:", responseText);
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Resposta não é um JSON válido: " + responseText);
      }
      if (response.ok) {
        alert("Redação enviada com sucesso!");
        console.log("URL da imagem:", result.url);
        const imgPreview = document.createElement("img");
        imgPreview.src = result.url;
        imgPreview.style.maxWidth = "100%";
        imgPreview.style.marginTop = "10px";
        document.querySelector(".container").appendChild(imgPreview);
      } else {
        throw new Error(result.error || "Erro desconhecido: " + response.status);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar redação. " + error.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("Página carregada. Preparando geração de PDF...");

  const botaoPDF = document.querySelector(".download-pdf");
  if (!botaoPDF) {
      console.error("Botão de gerar PDF não encontrado!");
      return;
  }

  botaoPDF.addEventListener("click", gerarPDF);
});

async function gerarPDF() {
  console.log("Gerando PDF...");

  if (typeof PDFLib === "undefined") {
      console.error("Biblioteca PDFLib não carregada!");
      return;
  }

  // Criar um novo documento PDF
  const pdfDoc = await PDFLib.PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Pegar o texto da redação
  const textArea = document.querySelector(".area");
  const textoRedacao = textArea.value.trim() || "Sem texto digitado.";

  page.drawText(textoRedacao, {
      x: 50,
      y: 700,
      size: 12,
      maxWidth: 500,
  });

  // Processar a imagem (se houver)
  const fileInput = document.getElementById("upload");
  const file = fileInput.files[0];

  if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
          try {
              const imageBytes = new Uint8Array(event.target.result);
              let image;
              if (file.type === "image/png") {
                  image = await pdfDoc.embedPng(imageBytes);
              } else {
                  image = await pdfDoc.embedJpg(imageBytes);
              }

              const imageDims = image.scale(0.5);

              page.drawImage(image, {
                  x: 50,
                  y: 500,
                  width: imageDims.width,
                  height: imageDims.height,
              });

              // Salvar e baixar o PDF após a imagem ser embutida
              await salvarEPromptDownload(pdfDoc);
          } catch (error) {
              console.error("Erro ao embutir a imagem no PDF:", error);
          }
      };
      reader.readAsArrayBuffer(file);
  } else {
      // Salvar e baixar o PDF se não houver imagem
      await salvarEPromptDownload(pdfDoc);
  }
}

// Função separada para salvar e baixar o PDF
async function salvarEPromptDownload(pdfDoc) {
  try {
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "redacao.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("PDF baixado com sucesso!");
  } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
  }
}

