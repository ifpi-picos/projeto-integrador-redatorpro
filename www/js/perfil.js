// Função utilitária para obter token JWT salvo (ajuste conforme seu app)
function getToken() {
    return localStorage.getItem('token');
}

function carregarPerfil() {
    $.ajax({
        url: 'https://seu-backend-url/perfil',
        method: 'GET',
        headers: { Authorization: 'Bearer ' + getToken() },
        success: function(data) {
            $('#profileName').text(data.name);
            $('#profileTipo').text(data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1));
            $('#totalRedacoes').text(data.totalRedacoes);
            $('#ultimaNota').text(data.ultimaNota !== null ? data.ultimaNota : '-');
            if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
            $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
            $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
            $('#descricaoInput').val(data.descricao || '');
        }
    });
}

let editando = false;
$('#editProfileBtn').on('click', function(e) {
    e.preventDefault();
    if (!editando) {
        // Ativar edição
        editando = true;
        $('#profileName').attr('contenteditable', true).focus();
        $('#instagramSpan').hide();
        $('#instagramInput').val($('#instagramSpan').text().replace('@','')).show().focus();
        $('#profileAvatar').css('cursor', 'pointer');
        $('#descricaoPerfil').hide();
        $('#descricaoInput').val($('#descricaoPerfil').text()).show().focus();
    } else {
        // Salvar edição
        editando = false;
        $('#profileName').attr('contenteditable', false);
        $('#instagramInput').hide();
        $('#instagramSpan').show();
        $('#profileAvatar').css('cursor', 'default');
        $('#descricaoPerfil').show();
        $('#descricaoInput').hide();
        salvarPerfil();
    }
});

// Selecionar nova foto
$('#profileAvatar').on('click', function() {
    if (editando) $('#fotoPerfilInput').click();
});
$('#fotoPerfilInput').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            $('#profileImg').attr('src', ev.target.result);
        };
        reader.readAsDataURL(file);
    }
});

function salvarPerfil() {
    const formData = new FormData();
    formData.append('name', $('#profileName').text());
    formData.append('instagram', $('#instagramInput').val());
    formData.append('descricao', $('#descricaoInput').val());
    const file = $('#fotoPerfilInput')[0].files[0];
    if (file) formData.append('fotoPerfil', file);

    $.ajax({
        url: 'https://seu-backend-url/perfil',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + getToken() },
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            $('#profileName').text(data.name);
            $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
            if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
            $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
            alert('Perfil atualizado!');
        },
        error: function() {
            alert('Erro ao atualizar perfil');
        }
    });
}

$(document).ready(function() {
    carregarPerfil();
    $('#instagramInput').on('blur', function() {
        $('#instagramSpan').text('@' + $(this).val());
    });
});
