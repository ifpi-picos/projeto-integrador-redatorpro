// Função utilitária para obter token JWT salvo (ajuste conforme seu app)
function getToken() {
    // Busca o token dentro do objeto loggedUser
    let token = null;
    try {
        const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
        token = loggedUser && loggedUser.token ? loggedUser.token : null;
    } catch (e) {
        token = null;
    }
    console.log('[getToken] Token recuperado:', token);
    return token;
}

function carregarPerfil() {
    console.log('[carregarPerfil] Iniciando carregamento do perfil...');
    const token = getToken();
    if (!token) {
        alert('Você não está logado. Faça login novamente.');
        return;
    }
    $.ajax({
        url: 'https://express-e3hm.onrender.com/perfil',
        method: 'GET',
        headers: { Authorization: 'Bearer ' + token },
        success: function(data) {
            console.log('[carregarPerfil] Dados recebidos:', data);
            if (data && data.name) {
                $('#profileName').text(data.name);
                $('#profileTipo').text(data.tipo ? (data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1)) : '');
                $('#totalRedacoes').text(data.totalRedacoes !== undefined ? data.totalRedacoes : '0');
                $('#ultimaNota').text(data.ultimaNota !== null && data.ultimaNota !== undefined ? data.ultimaNota : '-');
                if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
                // Instagram
                $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
                $('#instagramInput').val(data.instagram || '');
                // Atualiza o botão do Instagram
                $('.social-btn')
                    .attr('href', data.instagram ? 'https://instagram.com/' + data.instagram : '#')
                    .attr('target', data.instagram ? '_blank' : '')
                    .toggleClass('disabled', !data.instagram);
                $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
                $('#descricaoInput').val(data.descricao || '');
            } else {
                $('#profileName').text('Nome não encontrado');
                $('.social-btn').hide();
            }
        },
        error: function(xhr) {
            console.error('[carregarPerfil] Erro ao carregar perfil:', xhr);
            $('#profileName').text('Erro ao carregar');
            $('#profileTipo').text('');
            $('#totalRedacoes').text('0');
            $('#ultimaNota').text('-');
            $('#descricaoPerfil').text('Clique no lápis para editar sua descrição.');
            $('.social-btn').addClass('disabled').attr('href', '#');
            $('#instagramSpan').text('');
            if (xhr.status === 401) {
                alert('Sua sessão expirou. Faça login novamente.');
                // Redirecionar para login se desejar
            }
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
        $('#profileAvatar').css('cursor', 'pointer');
        $('#descricaoPerfil').hide();
        $('#descricaoInput').val($('#descricaoPerfil').text()).show().focus();
        $('#instagramSpan').hide();
        $('#instagramInput').show().focus();
        // Mostra o ícone de câmera
        $('#cameraIcon').show();
    } else {
        // Salvar edição
        editando = false;
        $('#profileName').attr('contenteditable', false);
        $('#profileAvatar').css('cursor', 'default');
        $('#descricaoPerfil').show();
        $('#descricaoInput').hide();
        $('#instagramSpan').show();
        $('#instagramInput').hide();
        // Esconde o ícone de câmera
        $('#cameraIcon').hide();
        salvarPerfil();
    }
});

// Ícone de câmera abre o seletor de arquivo
$('#cameraIcon').on('click', function(e) {
    e.preventDefault();
    $('#fotoPerfilInput').click();
});

// Selecionar nova foto (mantém funcionalidade anterior)
$('#profileAvatar').on('click', function(e) {
    if (editando && !$(e.target).is('#cameraIcon, #fotoPerfilInput')) {
        // Só abre o seletor se clicar fora do ícone de câmera
        $('#fotoPerfilInput').click();
    }
});
$('#fotoPerfilInput').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            $('#profileImg').attr('src', ev.target.result);
        };
        reader.readAsDataURL(file);

        // Se não estiver em modo edição, ativa o modo edição automaticamente
        if (!editando) {
            editando = true;
            $('#profileName').attr('contenteditable', true);
            $('#profileAvatar').css('cursor', 'pointer');
            $('#descricaoPerfil').hide();
            $('#descricaoInput').val($('#descricaoPerfil').text()).show();
            $('#instagramSpan').hide();
            $('#instagramInput').show();
        }
    }
});

function salvarPerfil() {
    const formData = new FormData();
    formData.append('name', $('#profileName').text());
    formData.append('instagram', $('#instagramInput').val());
    formData.append('descricao', $('#descricaoInput').val());
    const file = $('#fotoPerfilInput')[0].files[0];
    if (file) formData.append('fotoPerfil', file);

    console.log('[salvarPerfil] Enviando dados:', {
        name: $('#profileName').text(),
        instagram: $('#instagramInput').val(),
        descricao: $('#descricaoInput').val(),
        file: file ? file.name : null
    });

    $.ajax({
        url: 'https://express-e3hm.onrender.com/perfil',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + getToken() },
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log('[salvarPerfil] Perfil atualizado:', data);
            $('#profileName').text(data.name);
            $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
            $('#instagramInput').val(data.instagram || '');
            if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
            $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
            // Atualiza o botão do Instagram
            $('.social-btn')
                .attr('href', data.instagram ? 'https://instagram.com/' + data.instagram : '#')
                .attr('target', data.instagram ? '_blank' : '')
                .toggleClass('disabled', !data.instagram);
            alert('Perfil atualizado!');
        },
        error: function(xhr) {
            console.error('[salvarPerfil] Erro ao atualizar perfil:', xhr);
            alert('Erro ao atualizar perfil');
        }
    });
}

$(document).ready(function() {
    carregarPerfil();
    // Atualiza o texto do span ao sair do input
    $('#instagramInput').on('blur', function() {
        $('#instagramSpan').text($(this).val() ? '@' + $(this).val() : 'Adicionar Instagram');
    });
});
