document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM totalmente carregado.');

    const resposta = JSON.parse(localStorage.getItem('correcaoIA'));
    console.log('Valor de resposta recuperado do localStorage:', resposta);

    const correcaoTexto = document.getElementById('correcaoTexto');
    const notaTotal = document.getElementById('notaTotal');

    console.log('Elemento correcaoTexto:', correcaoTexto);
    console.log('Elemento notaTotal:', notaTotal);

    if (resposta && resposta.correcao) {
        correcaoTexto.innerText = resposta.correcao;
        console.log('Texto de correção definido:', resposta.correcao);

        // Tenta exibir a nota, se existir
        if (resposta.nota) {
            notaTotal.innerText = "Nota Total: " + resposta.nota;
            console.log('Nota definida diretamente:', resposta.nota);
        } else {
            // Tenta extrair a nota do texto, caso não venha separada
            const match = resposta.correcao.match(/nota\s*[:=]?\s*(\d{2,4})/i);
            if (match) {
                notaTotal.innerText = "Nota Total: " + match[1];
                console.log('Nota extraída do texto:', match[1]);
            } else {
                notaTotal.innerText = "";
                console.log('Nota não encontrada no texto.');
            }
        }
    } else {
        correcaoTexto.innerText = "Nenhuma correção encontrada.";
        notaTotal.innerText = "";
        console.log('Nenhuma correção encontrada.');
    }
});