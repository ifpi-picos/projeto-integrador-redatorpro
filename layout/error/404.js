document.addEventListener('DOMContentLoaded', function() {
    const contactBtn = document.getElementById('contact-support');
    
    contactBtn.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Entre em contato com nosso suporte pelo email: suporte@seusite.com');
    });
    
    // Adiciona um efeito de digitação opcional no subtítulo
    const subtitle = document.querySelector('.error-subtitle');
    const originalText = subtitle.textContent;
    subtitle.textContent = '';
    
    let i = 0;
    const typingEffect = setInterval(() => {
        if (i < originalText.length) {
            subtitle.textContent += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typingEffect);
        }
    }, 100);
});