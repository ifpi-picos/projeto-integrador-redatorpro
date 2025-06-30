// js/main.js - Atualização de Data e Hora
document.addEventListener('DOMContentLoaded', function() {
    // Função para formatar a data e hora
    function updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric'
        };
        
        // Formatar a data: "Segunda-feira, 03 de julho de 2023"
        const formattedDate = now.toLocaleDateString('pt-BR', options);
        
        // Formatar a hora: "14:30"
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}`;
        
        // Atualizar os elementos no HTML
        const dateElement = document.getElementById('current-date');
        const timeElement = document.getElementById('current-time');
        
        if (dateElement) dateElement.textContent = formattedDate;
        if (timeElement) timeElement.textContent = formattedTime;
    }
    
    // Atualizar imediatamente e depois a cada minuto
    updateDateTime();
    setInterval(updateDateTime, 60000);
});