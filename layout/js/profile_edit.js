document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editProfileModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('editProfileForm');
    const photoBtn = document.getElementById('editPhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const editFotoPerfil = document.getElementById('editFotoPerfil');
    const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');

    // Abrir modal de edição
    editBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        // Preenche campos do modal com dados atuais
        document.getElementById('editName').value = document.getElementById('profile-name').textContent;
        document.getElementById('editEscolaridade').value = document.getElementById('profile-escolaridade').textContent;
        document.getElementById('editExperiencia').value = document.getElementById('profile-experiencia').textContent;
        // Preencher outros campos se existirem
    });

    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
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
                document.getElementById('profile-photo').src = data.fotoPerfil;
            }
        });
    });

    // Envio do formulário de edição
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', form.editName.value);
        formData.append('escolaridade', form.editEscolaridade.value);
        formData.append('experiencia', form.editExperiencia.value);
        formData.append('instagram', form.editInstagram.value);
        formData.append('descricao', form.editDescricao.value);
        // Interesses separados por vírgula
        const interessesArr = form.editInteresses.value.split(',').map(s => s.trim()).filter(Boolean);
        formData.append('interesses', JSON.stringify(interessesArr));
        if (editFotoPerfil.files[0]) {
            formData.append('fotoPerfil', editFotoPerfil.files[0]);
        }
        fetch('https://express-e3hm.onrender.com/perfil', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + userData.token
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            // Atualiza campos do perfil na tela
            document.getElementById('profile-name').textContent = data.name || '';
            document.getElementById('profile-escolaridade').textContent = data.escolaridade || '';
            document.getElementById('profile-experiencia').textContent = data.experiencia || '';
            document.getElementById('profile-photo').src = data.fotoPerfil || document.getElementById('profile-photo').src;
            modal.style.display = 'none';
        });
    });
});
