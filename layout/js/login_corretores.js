// Protege acesso e preenche perfil do corretor dinamicamente
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    if (!userData.token || userData.tipo !== 'corretor') {
        window.location.href = '../login.html';
        return;
    }

    // Exibe dados locais imediatamente
    document.getElementById('profile-name').textContent = userData.name || '';
    document.getElementById('profile-email').textContent = userData.email || '';
    document.getElementById('profile-photo').src = userData.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userData.name || 'Corretor') + '&background=4361ee&color=fff&size=150';
    document.getElementById('profile-title').textContent = userData.escolaridade || '';
    document.getElementById('profile-escolaridade').textContent = userData.escolaridade || '';
    document.querySelectorAll('#profile-experiencia').forEach(el => el.textContent = userData.experiencia || '');

    // Adiciona efeito de carregamento nos campos que dependem do backend
    document.getElementById('profile-title').classList.add('skeleton');
    document.getElementById('profile-escolaridade').classList.add('skeleton');
    document.querySelectorAll('#profile-experiencia').forEach(el => el.classList.add('skeleton'));
    document.getElementById('profile-rating').classList.add('skeleton');
    document.getElementById('profile-resposta').classList.add('skeleton');

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
        // Preenche os campos do perfil com dados do backend
        document.getElementById('profile-name').textContent = data.name || '';
        document.getElementById('profile-email').textContent = data.email || '';
        document.getElementById('profile-title').textContent = data.escolaridade || '';
        document.getElementById('profile-escolaridade').textContent = data.escolaridade || '';
        document.querySelectorAll('#profile-experiencia').forEach(el => el.textContent = data.experiencia || '');
        document.getElementById('profile-photo').src = data.fotoPerfil || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.name || 'Corretor') + '&background=4361ee&color=fff&size=150';
        if (data.rating) document.getElementById('profile-rating').textContent = data.rating;
        if (data.resposta) document.getElementById('profile-resposta').textContent = data.resposta;

        // Remove efeito de carregamento
        document.getElementById('profile-title').classList.remove('skeleton');
        document.getElementById('profile-escolaridade').classList.remove('skeleton');
        document.querySelectorAll('#profile-experiencia').forEach(el => el.classList.remove('skeleton'));
        document.getElementById('profile-rating').classList.remove('skeleton');
        document.getElementById('profile-resposta').classList.remove('skeleton');

        // Salva dados atualizados no localStorage
        localStorage.setItem('loggedUser', JSON.stringify({
            ...userData,
            name: data.name,
            email: data.email,
            fotoPerfil: data.fotoPerfil,
            escolaridade: data.escolaridade,
            experiencia: data.experiencia
        }));
    })
    .catch(() => {
        alert('Sessão expirada ou acesso não autorizado.');
        localStorage.removeItem('loggedUser');
        window.location.href = '../login.html';
    });
});
