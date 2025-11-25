window.initRepertorio = function() {
    console.log('repertorios.js iniciado');

        const boxes = document.querySelectorAll('.repertorio-box');
    
        boxes.forEach(box => {
            box.addEventListener('mouseover', () => {
                box.style.cursor = 'pointer';
                box.style.animation = 'none';
                box.style.opacity = '1';
                box.style.transform = 'translateY(0) scale(1.05)';
            });
    
            box.addEventListener('mouseout', () => {
                box.style.transform = 'translateY(0) scale(1)';
            });
    
            // Adiciona evento de clique para redirecionamento
            box.addEventListener('click', function () {
                const page = this.getAttribute('data-page');
                if (page) {
                    window.location.href = page;
                }
            });
        });
};

function enviarRepertorio() {
    const nome = document.getElementById('nomeRepertorio').value;
    const motivo = document.getElementById('motivoRepertorio').value;

    if (!nome || !motivo) {
        app.dialog.alert('Preencha todos os campos obrigatórios!');
        return;
    }

    document.getElementById('mensagem-sucesso').style.display = 'block';

    document.getElementById('form-repertorio').reset();
}
