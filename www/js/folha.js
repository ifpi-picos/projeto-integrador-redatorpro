window.initFolha = function() {
  console.log('Inicializando folha.js');
  
  const submitButton = document.querySelector(".submit-button");
  const downloadButton = document.querySelector(".download-pdf");
  
  // Evento para enviar redação
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
        credentials: 'include'
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
        // Armazena a URL da imagem (sem adicionar um preview na página)
        window.imagePreviewUrl = result.url;
      } else {
        throw new Error(result.error || "Erro desconhecido: " + response.status);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar redação. " + error.message);
    }
  });
  
  // Evento para gerar e baixar o PDF
  downloadButton.addEventListener("click", async () => {
    await gerarPDF();
  });
  
  async function gerarPDF() {
    console.log("Gerando PDF...");
  
    if (typeof PDFLib === "undefined") {
      console.error("Biblioteca PDFLib não carregada!");
      return;
    }
  
    const pdfDoc = await PDFLib.PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
  
    // Adicionar o texto da redação ao PDF
    const textArea = document.querySelector(".area");
    const textoRedacao = textArea.value.trim() || "Sem texto digitado.";
  
    page.drawText(textoRedacao, {
      x: 50,
      y: 700,
      size: 12,
      maxWidth: 500,
    });
  
    // Tenta usar o arquivo do input; se não houver, usa a URL armazenada
    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];
  
    if (file) {
      const reader = new FileReader();
      reader.onload = async function (event) {
        try {
          const imageBytes = new Uint8Array(event.target.result);
          let image;
          if (file.type.includes("png")) {
            image = await pdfDoc.embedPng(imageBytes);
          } else {
            image = await pdfDoc.embedJpg(imageBytes);
          }
          const dims = image.scale(0.5);
          page.drawImage(image, {
            x: 50,
            y: 500,
            width: dims.width,
            height: dims.height,
          });
          await salvarEPromptDownload(pdfDoc);
        } catch (error) {
          console.error("Erro ao embutir a imagem do input no PDF:", error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (window.imagePreviewUrl) {
      try {
        const res = await fetch(window.imagePreviewUrl);
        const buffer = await res.arrayBuffer();
        const imageBytes = new Uint8Array(buffer);
        let image;
        if (window.imagePreviewUrl.toLowerCase().endsWith(".png")) {
          image = await pdfDoc.embedPng(imageBytes);
        } else {
          image = await pdfDoc.embedJpg(imageBytes);
        }
        const dims = image.scale(0.5);
        page.drawImage(image, {
          x: 50,
          y: 500,
          width: dims.width,
          height: dims.height,
        });
      } catch (error) {
        console.error("Erro ao embutir a imagem da URL no PDF:", error);
      }
      await salvarEPromptDownload(pdfDoc);
    } else {
      // Se nem arquivo nem URL estiverem disponíveis, apenas baixa o PDF com o texto
      await salvarEPromptDownload(pdfDoc);
    }
  }
  
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
};
