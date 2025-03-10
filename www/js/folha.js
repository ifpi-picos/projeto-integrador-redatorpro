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
  console.log("Gerando PDF...");

  // Criar um novo documento PDF
  const pdfDoc = await PDFLib.PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]); // Define tamanho da página

  // Pegar o texto da redação
  const textArea = document.querySelector(".area");
  const textoRedacao = textArea.value || "Sem texto digitado.";

  // Pegar a imagem enviada
  const fileInput = document.getElementById("upload");
  const file = fileInput.files[0];

  if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
          const imageBytes = new Uint8Array(event.target.result);
          let image;
          if (file.type === "image/png") {
              image = await pdfDoc.embedPng(imageBytes);
          } else {
              image = await pdfDoc.embedJpg(imageBytes);
          }

          const imageDims = image.scale(0.5); // Ajustar tamanho da imagem

          // Adicionar a imagem ao PDF
          page.drawImage(image, {
              x: 50,
              y: 600, // Posição da imagem
              width: imageDims.width,
              height: imageDims.height,
          });

          // Adicionar o texto ao PDF
          page.drawText(textoRedacao, {
              x: 50,
              y: 500,
              size: 12,
          });

          // Gerar o arquivo PDF
          const pdfBytes = await pdfDoc.save();

          // Criar um link para download
          const blob = new Blob([pdfBytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "redacao.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      };

      reader.readAsArrayBuffer(file);
  } else {
      // Se não houver imagem, gerar apenas o texto no PDF
      page.drawText(textoRedacao, {
          x: 50,
          y: 700,
          size: 12,
      });

      // Salvar e baixar o PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "redacao.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }
}

// Adiciona o evento de clique no botão de gerar PDF
document.addEventListener("DOMContentLoaded", () => {
  const botaoPDF = document.createElement("button");
  botaoPDF.textContent = "Baixar PDF";
  botaoPDF.className = "download-button";
  botaoPDF.addEventListener("click", gerarPDF);
  document.querySelector(".container").appendChild(botaoPDF);
});
