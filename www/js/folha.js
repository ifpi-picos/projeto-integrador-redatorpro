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
};

document.addEventListener('DOMContentLoaded', () => {
  initFolha();
});

async function gerarPDF() {
  const { PDFDocument, rgb } = PDFLib;

  // Criar um novo documento PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Pegando o texto da redação
  const textArea = document.querySelector(".area");
  const textoRedacao = textArea.value.trim() || "Nenhum texto fornecido.";

  // Pegando a imagem enviada
  const imgElement = document.querySelector(".container img");
  let image;
  if (imgElement) {
      const imageUrl = imgElement.src;
      const imageBytes = await fetch(imageUrl).then(res => res.arrayBuffer());
      image = await pdfDoc.embedJpg(imageBytes); // Se for PNG, use embedPng
  }

  // Adicionando a imagem ao PDF
  if (image) {
      const { width, height } = image.scale(0.5);
      page.drawImage(image, {
          x: 50,
          y: 600,
          width,
          height,
      });
  }

  // Adicionando o texto ao PDF
  page.drawText(textoRedacao, {
      x: 50,
      y: 500,
      size: 12,
      color: rgb(0, 0, 0),
  });

  // Salvando o PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "redacao.pdf";
  link.click();
}

// Adicionando evento ao botão
document.querySelector(".download-pdf").addEventListener("click", gerarPDF);
