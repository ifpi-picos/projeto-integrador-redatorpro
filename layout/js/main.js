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

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('loggedUser'));
    console.log('Dados do usuário recuperados do localStorage:', user);

    if (user) {
        document.querySelector('#user_infos .item-description:nth-child(1)').textContent = user.name;
        document.querySelector('#user_infos .item-description:nth-child(2)').textContent = user.email;
        // Salva o userId no localStorage para uso global
        if (user.id) {
            localStorage.setItem('userId', user.id);
        }
        // Atualiza dados do corretor do backend (se for corretor)
        if (user.tipo === 'corretor') {
            fetch('https://express-e3hm.onrender.com/perfil/corretor', {
                headers: {
                    'Authorization': 'Bearer ' + user.token
                }
            })
            .then(res => res.json())
            .then(data => {
                // Atualize campos do painel do corretor aqui, se necessário
                // Exemplo:
                // document.getElementById('profile-name').textContent = data.name || '';
                // document.getElementById('profile-email').textContent = data.email || '';
                // ...
            });
        }
    } else {
        console.warn('Nenhum usuário encontrado no localStorage. Redirecionando para login.');
        window.location.href = '../login.html';
    }
});