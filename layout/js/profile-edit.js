document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.getElementById('editProfileBtn');
    const saveBtn = document.getElementById('saveProfileBtn');
    const nameEl = document.getElementById('profile-name');
    const escolaridadeEl = document.getElementById('profile-escolaridade');
    const experienciaEls = document.querySelectorAll('#profile-experiencia');
    const titleEl = document.getElementById('profile-title');
    const descricaoEl = document.getElementById('profile-descricao');
    const photoBtn = document.getElementById('editPhotoBtn');
    const photoInput = document.getElementById('photoInput');
    const photoEl = document.getElementById('profile-photo');
    const userData = JSON.parse(localStorage.getItem('loggedUser') || '{}');

    // Verifica se todos os elementos existem antes de adicionar eventos
    if (editBtn && saveBtn && nameEl && escolaridadeEl && experienciaEls.length && titleEl && descricaoEl) {
        editBtn.addEventListener('click', () => {
            nameEl.contentEditable = true;
            escolaridadeEl.contentEditable = true;
            experienciaEls.forEach(el => {
                el.contentEditable = true;
                el.classList.add('editing');
            });
            titleEl.contentEditable = true;
            descricaoEl.contentEditable = true;
            nameEl.classList.add('editing');
            escolaridadeEl.classList.add('editing');
            titleEl.classList.add('editing');
            descricaoEl.classList.add('editing');
            editBtn.style.display = 'none';
            saveBtn.style.display = 'inline-block';
            nameEl.focus();
        });

        saveBtn.addEventListener('click', () => {
            const formData = new FormData();
            formData.append('name', nameEl.textContent.trim());
            formData.append('escolaridade', escolaridadeEl.textContent.trim());
            // Pega o valor do primeiro elemento de experiência
            formData.append('experiencia', experienciaEls[0].textContent.trim());
            formData.append('descricao', descricaoEl.textContent.trim());
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
                descricaoEl.textContent = data.descricao || 'sem descrição';
                nameEl.contentEditable = false;
                escolaridadeEl.contentEditable = false;
                experienciaEls.forEach(el => {
                    el.contentEditable = false;
                    el.classList.remove('editing');
                });
                titleEl.contentEditable = false;
                descricaoEl.contentEditable = false;
                nameEl.classList.remove('editing');
                escolaridadeEl.classList.remove('editing');
                titleEl.classList.remove('editing');
                descricaoEl.classList.remove('editing');
                editBtn.style.display = 'inline-block';
                saveBtn.style.display = 'none';

                // Salva dados atualizados no localStorage
                localStorage.setItem('loggedUser', JSON.stringify({
                    ...userData,
                    name: data.name,
                    email: data.email,
                    fotoPerfil: data.fotoPerfil,
                    escolaridade: data.escolaridade,
                    experiencia: data.experiencia,
                    descricao: data.descricao
                }));
            });
        });
    }

    // Foto de perfil
    if (photoBtn && photoInput && photoEl) {
        photoBtn.addEventListener('click', () => {
            photoInput.click();
        });

        photoInput.addEventListener('change', function() {
            if (!photoInput.files[0]) return;
            // Feedback visual: imagem opaca durante upload
            photoEl.classList.add('loading-img');
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
                    // Atualiza todas as imagens de perfil na página
                    document.querySelectorAll('#profile-photo').forEach(img => {
                        img.src = data.fotoPerfil;
                        img.classList.remove('loading-img');
                    });
                    // Salva foto no localStorage
                    localStorage.setItem('loggedUser', JSON.stringify({
                        ...userData,
                        fotoPerfil: data.fotoPerfil
                    }));
                } else {
                    photoEl.classList.remove('loading-img');
                }
            })
            .catch(() => {
                photoEl.classList.remove('loading-img');
                alert('Erro ao atualizar foto de perfil.');
            });
        });
    }
});

