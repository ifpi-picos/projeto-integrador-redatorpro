document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const nameEl = document.getElementById('profile-name');
    const escolaridadeEl = document.getElementById('profile-escolaridade');
    const experienciaEls = document.querySelectorAll('#profile-experiencia');
    const titleEl = document.getElementById('profile-title');
    const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');
    const photoBtn = document.getElementById('editPhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const photoEl = document.getElementById('profile-photo');

    // Editar campos diretamente
    editBtn.addEventListener('click', () => {
        nameEl.contentEditable = true;
        escolaridadeEl.contentEditable = true;
        experienciaEls.forEach(el => el.contentEditable = true);
        titleEl.contentEditable = true;
        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
        nameEl.focus();
    });

    // Salvar alterações
    saveBtn.addEventListener('click', () => {
        const formData = new FormData();
        formData.append('name', nameEl.textContent.trim());
        formData.append('escolaridade', escolaridadeEl.textContent.trim());
        formData.append('experiencia', experienciaEls[0].textContent.trim());
        // Apenas campos de corretor
        fetch('https://express-e3hm.onrender.com/perfil', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + userData.token
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            nameEl.textContent = data.name || '';
            escolaridadeEl.textContent = data.escolaridade || '';
            experienciaEls.forEach(el => el.textContent = data.experiencia || '');
            titleEl.textContent = data.escolaridade || '';
            nameEl.contentEditable = false;
            escolaridadeEl.contentEditable = false;
            experienciaEls.forEach(el => el.contentEditable = false);
            titleEl.contentEditable = false;
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        });
    });

    // Abrir seletor de arquivo ao clicar no ícone da câmera
    photoBtn.addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', function() {
        if (!photoInput.files[0]) return;
        const formData = new FormData();
        formData.append('fotoPerfil', photoInput.files[0]);
        fetch('https://express-e3hm.onrender.com/perfil', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + userData.token
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.fotoPerfil) {
                photoEl.src = data.fotoPerfil;
            }
        });
    });
});
            document.getElementById('profile-photo').src = data.fotoPerfil || document.getElementById('profile-photo').src;
            modal.style.display = 'none';

