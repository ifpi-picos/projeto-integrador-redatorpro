document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-correcao');
    const steps = document.querySelectorAll('.step-content');
    const stepButtons = document.querySelectorAll('.step');
    const progressBar = document.getElementById('progress-bar');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProximo = document.getElementById('btn-proximo');
    const btnEnviar = document.getElementById('btn-enviar');
    const notaSliders = document.querySelectorAll('.nota-slider');
    const totalNotaElement = document.getElementById('total-nota');
    
    let currentStep = 1;
    const totalSteps = steps.length;
    
    // Inicializar sliders de nota
    notaSliders.forEach(slider => {
        const competencia = slider.getAttribute('data-competencia');
        const notaDisplay = document.getElementById(`nota-${competencia}`);
        
        // Atualizar display quando o slider muda
        slider.addEventListener('input', function() {
            notaDisplay.textContent = this.value;
            calcularNotaTotal();
        });
    });
    
    // Função para calcular a nota total
    function calcularNotaTotal() {
        let total = 0;
        notaSliders.forEach(slider => {
            total += parseInt(slider.value) || 0;
        });
        totalNotaElement.textContent = total;
    }
    
    // Função para atualizar a exibição dos passos
    function updateSteps() {
        // Atualizar conteúdo visível
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.getAttribute('data-step')) === currentStep) {
                step.classList.add('active');
            }
        });
        
        // Atualizar indicadores de passo
        stepButtons.forEach(button => {
            button.classList.remove('active');
            if (parseInt(button.getAttribute('data-step')) <= currentStep) {
                button.classList.add('active');
            }
        });
        
        // Atualizar barra de progresso
        progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        
        // Atualizar botões de navegação
        btnAnterior.disabled = currentStep === 1;
        btnProximo.style.display = currentStep === totalSteps ? 'none' : 'block';
        btnEnviar.style.display = currentStep === totalSteps ? 'block' : 'none';
    }
    
    // Navegação entre passos
    btnAnterior.addEventListener('click', function() {
        if (currentStep > 1) {
            currentStep--;
            updateSteps();
        }
    });
    
    btnProximo.addEventListener('click', function() {
        if (currentStep < totalSteps) {
            currentStep++;
            updateSteps();
        }
    });
    
    // Navegação clicando nos indicadores
    stepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepNumber = parseInt(this.getAttribute('data-step'));
            if (stepNumber <= currentStep) {
                currentStep = stepNumber;
                updateSteps();
            }
        });
    });
    
    // Envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar se todas as competências foram avaliadas
        let todasAvaliadas = true;
        notaSliders.forEach(slider => {
            const value = slider.value;
            // Verifica se o valor é um número (incluindo 0) e está dentro do range permitido
            if (value === "" || isNaN(value) || value < 0 || value > 200) {
                todasAvaliadas = false;
                slider.classList.add('error');
            } else {
                slider.classList.remove('error');
            }
        });

        if (!todasAvaliadas) {
            alert('Por favor, atribua uma nota válida (entre 0 e 200) para todas as competências antes de enviar.');
            // Ir para o primeiro passo com erro
            for (let i = 0; i < notaSliders.length; i++) {
                const value = notaSliders[i].value;
                if (value === "" || isNaN(value) || value < 0 || value > 200) {
                    currentStep = parseInt(notaSliders[i].getAttribute('data-competencia'));
                    updateSteps();
                    break;
                }
            }
            return;
        }
        
        // Simular envio (na implementação real, seria uma chamada AJAX)
        alert('Correção enviada com sucesso!');
        // Aqui você faria a chamada para o backend
        // Exemplo: fetch('/api/correcoes', { method: 'POST', body: new FormData(form) })
    });
    
    // Inicializar
    updateSteps();
});