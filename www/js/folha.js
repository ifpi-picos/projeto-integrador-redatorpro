document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.querySelector(".submit-button");

    submitButton.addEventListener("click", async () => {
        const fileInput = document.getElementById("upload");
        const file = fileInput.files[0];

        if (!file) {
            alert("Selecione um arquivo antes de enviar!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://express-e3hm.onrender.com/server", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                alert("Imagem enviada com sucesso!");
                console.log("URL da imagem:", result.url);

                // Exibir a imagem enviada na página
                const imgPreview = document.createElement("img");
                imgPreview.src = result.url;
                imgPreview.style.maxWidth = "100%";
                imgPreview.style.marginTop = "10px";

                document.querySelector(".container").appendChild(imgPreview);
            } else {
                throw new Error(result.error || "Erro desconhecido");
            }
        } catch (error) {
            console.error("Erro no upload:", error);
            alert("Erro ao enviar imagem.");
        }
    });
});
