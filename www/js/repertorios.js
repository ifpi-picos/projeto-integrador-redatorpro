document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('.repertorio-box');

    boxes.forEach(box => {
        box.addEventListener('mouseover', () => {
            box.style.cursor = 'pointer';
            // Remove a animação sem deixar o elemento invisível
            box.style.animation = 'none';
            box.style.opacity = '1'; // Força a opacidade para 1
            // Aplica o efeito de scale mantendo translateY(0)
            box.style.transform = 'translateY(0) scale(1.05)';
        });

        box.addEventListener('mouseout', () => {
            // Retorna ao transform original
            box.style.transform = 'translateY(0) scale(1)';
        });
    });
});