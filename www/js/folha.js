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
        credentials: 'include' // Inclua as credenciais para manter a sessão
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