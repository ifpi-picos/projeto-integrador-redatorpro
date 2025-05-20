document.addEventListener('DOMContentLoaded', function() {
    const resposta = JSON.parse(localStorage.getItem('correcaoIA'));
    const correcaoTexto = document.getElementById('correcaoTexto');
    const notaTotal = document.getElementById('notaTotal');

    if (resposta && resposta.correcao) {
        correcaoTexto.innerText = resposta.correcao;

        // Tenta exibir a nota, se existir
        if (resposta.nota) {
            notaTotal.innerText = "Nota Total: " + resposta.nota;
        } else {
            // Tenta extrair a nota do texto, caso não venha separada
            const match = resposta.correcao.match(/nota\s*[:=]?\s*(\d{2,4})/i);
            if (match) {
                notaTotal.innerText = "Nota Total: " + match[1];
            } else {
                notaTotal.innerText = "";
            }
        }
    } else {
        correcaoTexto.innerText = "Nenhuma correção encontrada.";
        notaTotal.innerText = "";
    }
});