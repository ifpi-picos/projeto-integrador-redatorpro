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
let userEmail = '';
const sugestoesInteresses = [
    "Redação ENEM", "Gramática", "BTS", "Produção Textual", "Atualidades", "Ciências Humanas", "Ciências da Natureza", "Tecnologia", "Educação", "Política", "Saúde", "Meio Ambiente"
];

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
    $('#profileEmail').html('<span class="skeleton skeleton-text"></span>');
    $('.interests').html('<span class="skeleton skeleton-tag"></span> <span class="skeleton skeleton-tag"></span>');
}
function esconderSkeleton() {
    $('#profileName, #profileTipo, #totalRedacoes, #ultimaNota, #descricaoPerfil, #profileStatus, #instagramSpan, #profileEmail').find('.skeleton').remove();
    $('#profileImg').removeClass('skeleton-img');
    $('.interests').find('.skeleton').remove();
}

function validarCampos() {
    const nome = $('#profileName').text().trim();
    const instagram = $('#instagramInput').val().trim();
    const descricao = $('#descricaoInput').val().trim();
    let erros = [];
    if (!nome) erros.push('O nome não pode ser vazio.');
    if (instagram && !/^[a-zA-Z0-9._]+$/.test(instagram)) erros.push('O Instagram só pode conter letras, números, ponto ou underline.');
    if (descricao.length > 200) erros.push('A descrição deve ter no máximo 200 caracteres.');
    return erros;
}

function renderizarPerfil(data) {
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
        userEmail = data.email || '';
        $('#profileEmail').text(userEmail);
        interesses = Array.isArray(data.interesses) ? data.interesses : [];
        renderizarInteresses();
        setModoVisualizacao();
    } else {
        $('#profileName').text('Nome não encontrado');
        $('.social-btn').hide();
    }
}

function salvarPerfilNoCache(data) {
    if (data) {
        try {
            localStorage.setItem('profileCache', JSON.stringify(data));
        } catch (e) {
            // Falha silenciosa
        }
    }
}

function carregarPerfilDoCache() {
    try {
        const cache = localStorage.getItem('profileCache');
        if (cache) {
            const data = JSON.parse(cache);
            renderizarPerfil(data);
            esconderSkeleton();
            return true;
        }
    } catch (e) {}
    return false;
}

function carregarPerfil() {
    mostrarSkeleton();
    // 1. Tenta mostrar cache imediatamente
    carregarPerfilDoCache();
    // 2. Busca atualização do backend
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
            renderizarPerfil(data);
            salvarPerfilNoCache(data);
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
            $('#profileEmail').text('');
            alert(msg);
        }
    });
}

function setModoEdicao() {
    editando = true;
    alterado = false;
    // Só campos editáveis ficam destacados
    $('#profileName').attr('contenteditable', true).addClass('editando-campo').focus();
    $('#profileAvatar').addClass('editando-campo').css('cursor', 'pointer');
    $('#descricaoPerfil').hide();
    $('#descricaoInput').val($('#descricaoPerfil').text()).show().addClass('editando-campo');
    $('#instagramSpan').hide();
    $('#instagramInput').show().addClass('editando-campo');
    $('#cameraIcon').show();
    $('.profile-card, .profile-header-mobile').addClass('editando-bg');
    $('.profile-section-title').addClass('editando-titulo');
    $('.interests').addClass('editando-campo');
    renderizarInteresses();
    $('.profile-header-mobile, .profile-card').css('transition', 'box-shadow 0.3s, background 0.3s');
}

function setModoVisualizacao() {
    editando = false;
    $('#profileName').attr('contenteditable', false).removeClass('editando-campo');
    $('#profileAvatar').removeClass('editando-campo').css('cursor', 'default');
    $('#descricaoPerfil').show();
    $('#descricaoInput').hide().removeClass('editando-campo');
    $('#instagramSpan').show();
    $('#instagramInput').hide().removeClass('editando-campo');
    $('#cameraIcon').hide();
    $('.profile-card, .profile-header-mobile').removeClass('editando-bg');
    $('.profile-section-title').removeClass('editando-titulo');
    $('.interests').removeClass('editando-campo');
    renderizarInteresses();
}

$('#editProfileBtn').off('click').on('click', function(e) {
    e.preventDefault();
    if (!editando) {
        setModoEdicao();
    } else {
        const erros = validarCampos();
        if (erros.length) {
            alert(erros.join('\n'));
            return;
        }
        setModoVisualizacao();
        salvarPerfil();
    }
});

$('#profileName, #instagramInput, #descricaoInput').on('input', function() {
    if (editando) alterado = true;
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
        if (!editando) setModoEdicao();
        alterado = true;
    }
});

// Áreas de interesse: sugestões e seleção
function renderizarInteresses() {
    const $container = $('.interests');
    $container.empty();
    interesses.forEach((tag, idx) => {
        $container.append(`<span class="interest selected" tabindex="0" aria-label="Área de interesse: ${tag}">${tag} <button class="remove-tag" data-idx="${idx}" aria-label="Remover ${tag}">&times;</button></span>`);
    });
    if (editando) {
        // Botão para abrir sugestões
        $container.append('<button id="abrirSugestoesInteresse" class="btn-sugestoes-interesse" type="button">+ Adicionar</button>');
        // Container para sugestões (dropdown)
        $container.append('<div id="sugestoesInteressesBox" class="sugestoes-interesses-box" style="display:none;"></div>');
    }
}

$(document).on('click', '#abrirSugestoesInteresse', function(e) {
    e.stopPropagation();
    const $box = $('#sugestoesInteressesBox');
    if ($box.is(':visible')) {
        $box.hide();
        return;
    }
    // Mostra sugestões que ainda não foram selecionadas
    let html = '';
    sugestoesInteresses.forEach(sug => {
        if (!interesses.includes(sug)) {
            html += `<button type="button" class="sugestao-interesse-btn">${sug}</button>`;
        }
    });
    html += `<input type="text" id="novoInteresseInput" maxlength="20" placeholder="Outro..." aria-label="Adicionar área de interesse" style="margin-left:5px; min-width:80px;">`;
    $box.html(html).show();
    $('#novoInteresseInput').focus();
});
$(document).on('click', '.sugestao-interesse-btn', function(e) {
    const val = $(this).text();
    if (val && interesses.length < 8 && !interesses.includes(val)) {
        interesses.push(val);
        renderizarInteresses();
        alterado = true;
    }
});
$(document).on('keydown', '#novoInteresseInput', function(e) {
    if (e.key === 'Enter') {
        const val = $(this).val().trim();
        if (val && interesses.length < 8 && val.length <= 20 && !interesses.includes(val)) {
            interesses.push(val);
            renderizarInteresses();
            alterado = true;
        }
        $(this).val('');
    }
});
$(document).on('click', function(e) {
    // Fecha sugestões se clicar fora
    if (!$(e.target).closest('.sugestoes-interesses-box, #abrirSugestoesInteresse').length) {
        $('#sugestoesInteressesBox').hide();
    }
});
$(document).on('click', '.remove-tag', function(e) {
    e.stopPropagation();
    const idx = $(this).data('idx');
    interesses.splice(idx, 1);
    renderizarInteresses();
    alterado = true;
});

function mostrarLoaderFoto() {
    $('#profileImg').addClass('loading-img');
    $('#cameraIcon').addClass('loading-spinner');
}
function esconderLoaderFoto() {
    $('#profileImg').removeClass('loading-img');
    $('#cameraIcon').removeClass('loading-spinner');
}

function salvarPerfil() {
    const formData = new FormData();
    formData.append('name', $('#profileName').text());
    formData.append('instagram', $('#instagramInput').val());
    formData.append('descricao', $('#descricaoInput').val());
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
            renderizarPerfil(data);
            salvarPerfilNoCache(data);
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
    carregarPerfil();
    $('#instagramInput').on('blur', function() {
        $('#instagramSpan').text($(this).val() ? '@' + $(this).val() : 'Adicionar Instagram');
    });
    window.onbeforeunload = function() {
        if (editando && alterado) return 'Você tem alterações não salvas. Deseja sair sem salvar?';
    };
    $('#profileName').attr('aria-label', 'Nome do usuário');
    $('#profileAvatar').attr('aria-label', 'Foto do perfil');
    $('#editProfileBtn').attr('aria-label', 'Editar perfil');
    $('#descricaoPerfil').attr('aria-label', 'Descrição do perfil');
    $('#instagramInput').attr('aria-label', 'Instagram');
    $('#descricaoInput').attr('aria-label', 'Descrição');
    $('#cameraIcon').attr('aria-label', 'Alterar foto do perfil');
    $('#profileEmail').attr('aria-label', 'E-mail do usuário');
    $('.profile-action-btn.social-btn').attr('aria-label', 'Abrir Instagram');
    $('.profile-action-btn.essays-btn').attr('aria-label', 'Ver redações');
    $('.profile-header-mobile, .profile-card').css('transition', 'box-shadow 0.3s, background 0.3s');
});
