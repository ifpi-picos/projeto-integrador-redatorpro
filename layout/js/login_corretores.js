// Protege acesso e preenche perfil do corretor dinamicamente
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    if (!userData.token || userData.tipo !== 'corretor') {
        window.location.href = '../login.html';
        return;
    }

    fetch('https://express-e3hm.onrender.com/perfil', {
        headers: {
            'Authorization': 'Bearer ' + userData.token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Não autorizado');
        return res.json();
    })
    .then(data => {
        // Preenche os campos do perfil
        document.getElementById('profile-name').textContent = data.name || '';
        document.getElementById('profile-email').textContent = data.email || '';
        document.getElementById('profile-title').textContent = data.escolaridade || '';
        document.getElementById('profile-escolaridade').textContent = data.escolaridade || '';
        document.getElementById('profile-experiencia').textContent = data.experiencia || '';
        document.getElementById('profile-photo').src = data.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || 'Corretor') + '&background=4361ee&color=fff&size=150';
        // Campos extras (rating, resposta) podem ser preenchidos se vierem do backend
        if (data.rating) document.getElementById('profile-rating').textContent = data.rating;
        if (data.resposta) document.getElementById('profile-resposta').textContent = data.resposta;
    })
    .catch(() => {
        alert('Sessão expirada ou acesso não autorizado.');
        localStorage.removeItem('loggedUser');
        window.location.href = '../login.html';
    });
});
