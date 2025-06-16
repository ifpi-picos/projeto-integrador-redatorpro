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

let editando = false;
let alterado = false;
let interesses = [];
let skeletonTimeout = null;

// Skeleton loader
function mostrarSkeleton() {
    $('#profileName').html('<span class="skeleton skeleton-text"></span>');
    $('#profileTipo').html('<span class="skeleton skeleton-text"></span>');
    $('#totalRedacoes').html('<span class="skeleton skeleton-text"></span>');
    $('#ultimaNota').html('<span class="skeleton skeleton-text"></span>');
    $('#descricaoPerfil').html('<span class="skeleton skeleton-text"></span>');
    $('#profileStatus').html('<span class="skeleton skeleton-text"></span>');
    $('#profileImg').addClass('skeleton-img');
    $('#instagramSpan').html('<span class="skeleton skeleton-text"></span>');
    $('.interests').html('<span class="skeleton skeleton-tag"></span> <span class="skeleton skeleton-tag"></span>');
}
function esconderSkeleton() {
    $('#profileName, #profileTipo, #totalRedacoes, #ultimaNota, #descricaoPerfil, #profileStatus, #instagramSpan').find('.skeleton').remove();
    $('#profileImg').removeClass('skeleton-img');
    $('.interests').find('.skeleton').remove();
}

function validarCampos() {
    const nome = $('#profileName').text().trim();
    const instagram = $('#instagramInput').val().trim();
    const descricao = $('#descricaoInput').val().trim();
    const status = $('#statusInput').val().trim();
    let erros = [];
    if (!nome) erros.push('O nome não pode ser vazio.');
    if (instagram && !/^[a-zA-Z0-9._]+$/.test(instagram)) erros.push('O Instagram só pode conter letras, números, ponto ou underline.');
    if (descricao.length > 200) erros.push('A descrição deve ter no máximo 200 caracteres.');
    if (status.length > 60) erros.push('O status deve ter no máximo 60 caracteres.');
    return erros;
}

function carregarPerfil() {
    mostrarSkeleton();
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
            esconderSkeleton();
            if (data && data.name) {
                $('#profileName').text(data.name);
                $('#profileTipo').text(data.tipo ? (data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1)) : '');
                $('#totalRedacoes').text(data.totalRedacoes !== undefined ? data.totalRedacoes : '0');
                $('#ultimaNota').text(data.ultimaNota !== null && data.ultimaNota !== undefined ? data.ultimaNota : '-');
                if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
                $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
                $('#instagramInput').val(data.instagram || '');
                $('.social-btn')
                    .attr('href', data.instagram ? 'https://instagram.com/' + data.instagram : '#')
                    .attr('target', data.instagram ? '_blank' : '')
                    .toggleClass('disabled', !data.instagram);
                $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
                $('#descricaoInput').val(data.descricao || '');
                $('#profileStatus').text(data.status || 'Bem-vindo!');
                $('#statusInput').val(data.status || '');
                interesses = Array.isArray(data.interesses) ? data.interesses : [];
                renderizarInteresses();
            } else {
                esconderSkeleton();
                $('#profileName').text('Nome não encontrado');
                $('.social-btn').hide();
            }
        },
        error: function(xhr) {
            esconderSkeleton();
            let msg = 'Erro ao carregar perfil.';
            if (xhr.status === 401) msg = 'Sua sessão expirou. Faça login novamente.';
            else if (xhr.responseJSON && xhr.responseJSON.error) msg = xhr.responseJSON.error;
            $('#profileName').text('Erro ao carregar');
            $('#profileTipo').text('');
            $('#totalRedacoes').text('0');
            $('#ultimaNota').text('-');
            $('#descricaoPerfil').text('Clique no lápis para editar sua descrição.');
            $('.social-btn').addClass('disabled').attr('href', '#');
            $('#instagramSpan').text('');
            alert(msg);
        }
    });
}

function renderizarInteresses() {
    const $container = $('.interests');
    $container.empty();
    interesses.forEach((tag, idx) => {
        $container.append(`<span class="interest" tabindex="0" aria-label="Área de interesse: ${tag}">${tag} <button class="remove-tag" data-idx="${idx}" aria-label="Remover ${tag}">&times;</button></span>`);
    });
    if (editando) {
        $container.append('<input type="text" id="novoInteresseInput" maxlength="20" placeholder="Adicionar..." aria-label="Adicionar área de interesse" style="margin-left:5px; min-width:80px;">');
    }
}

function mostrarLoaderFoto() {
    $('#profileImg').addClass('loading-img');
    $('#cameraIcon').addClass('loading-spinner');
}
function esconderLoaderFoto() {
    $('#profileImg').removeClass('loading-img');
    $('#cameraIcon').removeClass('loading-spinner');
}

$('#editProfileBtn').on('click', function(e) {
    e.preventDefault();
    if (!editando) {
        editando = true;
        alterado = false;
        // Feedback visual
        $('#profileName').attr('contenteditable', true).addClass('editando-campo').focus();
        $('#profileAvatar').css('cursor', 'pointer').addClass('editando-campo');
        $('#descricaoPerfil').hide();
        $('#descricaoInput').val($('#descricaoPerfil').text()).show().addClass('editando-campo').focus();
        $('#instagramSpan').hide();
        $('#instagramInput').show().addClass('editando-campo').focus();
        $('#profileStatus').hide();
        $('#statusInput').val($('#profileStatus').text()).show().addClass('editando-campo').focus();
        $('#cameraIcon').show();
        $('.profile-card, .profile-header-mobile').addClass('editando-bg');
        $('.profile-section-title').addClass('editando-titulo');
        renderizarInteresses();
        $('.interests').addClass('editando-campo');
        // Animação
        $('.profile-header-mobile, .profile-card').css('transition', 'box-shadow 0.3s, background 0.3s');
    } else {
        // Salvar edição
        const erros = validarCampos();
        if (erros.length) {
            alert(erros.join('\n'));
            return;
        }
        editando = false;
        $('#profileName').attr('contenteditable', false).removeClass('editando-campo');
        $('#profileAvatar').css('cursor', 'default').removeClass('editando-campo');
        $('#descricaoPerfil').show();
        $('#descricaoInput').hide().removeClass('editando-campo');
        $('#instagramSpan').show();
        $('#instagramInput').hide().removeClass('editando-campo');
        $('#profileStatus').show();
        $('#statusInput').hide().removeClass('editando-campo');
        $('#cameraIcon').hide();
        $('.profile-card, .profile-header-mobile').removeClass('editando-bg');
        $('.profile-section-title').removeClass('editando-titulo');
        $('.interests').removeClass('editando-campo');
        renderizarInteresses();
        salvarPerfil();
    }
});

$('#profileName, #instagramInput, #descricaoInput, #statusInput').on('input', function() {
    if (editando) alterado = true;
});
$('#novoInteresseInput').on('input', function() {
    alterado = true;
});

$('#cameraIcon').on('click', function(e) {
    e.preventDefault();
    $('#fotoPerfilInput').click();
});
$('#profileAvatar').on('click', function(e) {
    if (editando && !$(e.target).is('#cameraIcon, #fotoPerfilInput')) {
        $('#fotoPerfilInput').click();
    }
});
$('#fotoPerfilInput').on('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        mostrarLoaderFoto();
        const reader = new FileReader();
        reader.onload = function(ev) {
            $('#profileImg').attr('src', ev.target.result);
            esconderLoaderFoto();
        };
        reader.readAsDataURL(file);
        if (!editando) {
            editando = true;
            $('#profileName').attr('contenteditable', true).addClass('editando-campo');
            $('#profileAvatar').css('cursor', 'pointer').addClass('editando-campo');
            $('#descricaoPerfil').hide();
            $('#descricaoInput').val($('#descricaoPerfil').text()).show().addClass('editando-campo');
            $('#instagramSpan').hide();
            $('#instagramInput').show().addClass('editando-campo');
            $('#profileStatus').hide();
            $('#statusInput').val($('#profileStatus').text()).show().addClass('editando-campo');
            $('#cameraIcon').show();
            $('.profile-card, .profile-header-mobile').addClass('editando-bg');
            $('.profile-section-title').addClass('editando-titulo');
            renderizarInteresses();
            $('.interests').addClass('editando-campo');
        }
        alterado = true;
    }
});

$(document).on('click', '.remove-tag', function(e) {
    e.stopPropagation();
    const idx = $(this).data('idx');
    interesses.splice(idx, 1);
    renderizarInteresses();
    alterado = true;
});
$(document).on('keydown', '#novoInteresseInput', function(e) {
    if (e.key === 'Enter') {
        const val = $(this).val().trim();
        if (val && interesses.length < 8 && val.length <= 20 && !interesses.includes(val)) {
            interesses.push(val);
            renderizarInteresses();
            $('#novoInteresseInput').focus();
            alterado = true;
        }
        $(this).val('');
    }
});

function salvarPerfil() {
    const formData = new FormData();
    formData.append('name', $('#profileName').text());
    formData.append('instagram', $('#instagramInput').val());
    formData.append('descricao', $('#descricaoInput').val());
    formData.append('status', $('#statusInput').val());
    formData.append('interesses', JSON.stringify(interesses));
    const file = $('#fotoPerfilInput')[0].files[0];
    if (file) formData.append('fotoPerfil', file);

    mostrarLoaderFoto();
    $.ajax({
        url: 'https://express-e3hm.onrender.com/perfil',
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + getToken() },
        data: formData,
        processData: false,
        contentType: false,
        success: function(data) {
            esconderLoaderFoto();
            $('#profileName').text(data.name);
            $('#instagramSpan').text(data.instagram ? '@' + data.instagram : 'Adicionar Instagram');
            $('#instagramInput').val(data.instagram || '');
            if (data.fotoPerfil) $('#profileImg').attr('src', data.fotoPerfil);
            $('#descricaoPerfil').text(data.descricao || 'Clique no lápis para editar sua descrição.');
            $('#profileStatus').text(data.status || 'Bem-vindo!');
            $('#statusInput').val(data.status || '');
            interesses = Array.isArray(data.interesses) ? data.interesses : [];
            renderizarInteresses();
            $('.social-btn')
                .attr('href', data.instagram ? 'https://instagram.com/' + data.instagram : '#')
                .attr('target', data.instagram ? '_blank' : '')
                .toggleClass('disabled', !data.instagram);
            alert('Perfil atualizado!');
            alterado = false;
        },
        error: function(xhr) {
            esconderLoaderFoto();
            let msg = 'Erro ao atualizar perfil.';
            if (xhr.responseJSON && xhr.responseJSON.error) msg = xhr.responseJSON.error;
            else if (xhr.status === 413) msg = 'A imagem é muito grande. Tente uma menor.';
            alert(msg);
        }
    });
}

$(document).ready(function() {
    // Adiciona campo status editável e input de status
    if (!$('#statusInput').length) {
        $('#profileStatus').after('<input type="text" id="statusInput" maxlength="60" style="display:none;width:100%;" aria-label="Status do perfil">');
    }
    carregarPerfil();
    $('#instagramInput').on('blur', function() {
        $('#instagramSpan').text($(this).val() ? '@' + $(this).val() : 'Adicionar Instagram');
    });
    // Confirmação de saída sem salvar
    window.onbeforeunload = function() {
        if (editando && alterado) return 'Você tem alterações não salvas. Deseja sair sem salvar?';
    };
    // Acessibilidade: aria-labels
    $('#profileName').attr('aria-label', 'Nome do usuário');
    $('#profileAvatar').attr('aria-label', 'Foto do perfil');
    $('#editProfileBtn').attr('aria-label', 'Editar perfil');
    $('#descricaoPerfil').attr('aria-label', 'Descrição do perfil');
    $('#instagramInput').attr('aria-label', 'Instagram');
    $('#descricaoInput').attr('aria-label', 'Descrição');
    $('#cameraIcon').attr('aria-label', 'Alterar foto do perfil');
    $('#profileStatus').attr('aria-label', 'Status do perfil');
    $('.profile-action-btn.social-btn').attr('aria-label', 'Abrir Instagram');
    $('.profile-action-btn.essays-btn').attr('aria-label', 'Ver redações');
    // Animação suave ao alternar edição
    $('.profile-header-mobile, .profile-card').css('transition', 'box-shadow 0.3s, background 0.3s');
});
