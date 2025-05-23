window.initFolha = function() {
  console.log('Inicializando folha.js');

  const submitButton = document.querySelector(".submit-button");
  const downloadButton = document.querySelector(".download-pdf");

  // ✅ Envio da redação (imagem e/ou texto)
  submitButton.addEventListener("click", async () => {
    alert("Essa função está temporariamente desativada.");
    return;
    /*
    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];
    const textArea = document.querySelector(".area");
    const text = textArea.value.trim();

    if (!file && !text) {
      alert("Selecione um arquivo ou escreva um texto antes de enviar!");
      return;
    }

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("text", text);

    try {
      const response = await fetch("https://express-e3hm.onrender.com/server", {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();
      if (response.ok) {
        alert("Redação enviada com sucesso!");
        console.log("URL da imagem:", result.url);
      } else {
        throw new Error(result.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao enviar redação: " + error.message);
    }
    */
  });

  // ✅ Geração do PDF (apenas texto)
  downloadButton.addEventListener("click", async () => {
    alert("A geração de PDF está temporariamente desativada.");
    return;
    /*
    const textArea = document.querySelector(".area").value.trim();

    if (!textArea) {
        alert("Escreva um texto antes de baixar o PDF!");
        return;
    }

    try {
        console.log("📩 Enviando requisição para gerar PDF...");
        const response = await fetch("https://express-e3hm.onrender.com/pdf/gerar-pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto: textArea }),
        });

        console.log("📥 Resposta recebida:", response);

        if (!response.ok) {
            throw new Error(`Erro ao gerar PDF: ${response.status} - ${response.statusText}`);
        }

        const blob = await response.blob();
        console.log("📄 Blob recebido:", blob);

        if (blob.size === 0) {
            throw new Error("O PDF gerado está vazio!");
        }

        const url = window.URL.createObjectURL(blob);
        console.log("🔗 URL do PDF:", url);

        // Criar link temporário para download
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "redacao.pdf";
        document.body.appendChild(a);

        // Forçar o clique no link para download automático
        setTimeout(() => {
            a.dispatchEvent(new MouseEvent('click'));  // Forçar o clique no link
            document.body.removeChild(a);  // Remover o link após o clique
            window.URL.revokeObjectURL(url);  // Liberar o URL
            console.log("📤 PDF baixado com sucesso!");
        }, 100);  // Pequeno delay para garantir o funcionamento

    } catch (error) {
        console.error("❌ Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Veja o console para mais detalhes.");
    }
    */
  });

};

