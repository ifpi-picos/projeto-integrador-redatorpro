// RECUPERAR O ID DETALHE DO LOCALSTORAGE
var id = parseInt(localStorage.getItem("detalhe"));

// PEGAR OS DADOS DOS CORRETORES DO LOCALSTORAGE
var corretores = JSON.parse(localStorage.getItem("corretores"));

// ENCONTRAR O CORRETOR CORRESPONDENTE AO ID
var item = corretores.find((corretor) => corretor.id === id);

if (item) {
    console.log("Corretor encontrado: ", item);

    // ALIMENTAR A PÁGINA DETALHES
    $("#imagem-detalhe").attr("src", item.imagem);
    $("#nome-detalhe").html(item.nome);
    $("#especialidade-detalhe").html(item.especialidade);
    $("#rating-detalhe").html(item.rating);
    $("#like-detalhe").html(item.likes);
    $("#rewies-detalhe").html(item.rewies + " reviews");
    $("#descrição-detalhe").html(item.descrição);
    
    // GUARDAR ITEM COMPLETO NO LOCALSTORAGE PARA COMPARTILHAMENTO
    localStorage.setItem("detalheCorretor", JSON.stringify(item));
} else {
    console.log("Corretor não encontrado");
    // REDIRECIONAR PARA PÁGINA PRINCIPAL SE NÃO ENCONTRAR O CORRETOR
    window.location.href = "https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html";
}

// PEGAR A LISTA DE FAVORITOS
var listafav = JSON.parse(localStorage.getItem("listafav")) || [];

// VERIFICAR SE O CORRETOR JÁ ESTÁ NOS FAVORITOS AO CARREGAR A PÁGINA
var itemEmFavorito = listafav.find((f) => f.item.id === item.id);
if (itemEmFavorito) {
    $("#ad-card i").removeClass("ri-heart-3-line").addClass("ri-heart-fill");
}

// FUNÇÃO PARA ADICIONAR OU REMOVER DOS FAVORITOS
function toggleFavorito(item) {
    var index = listafav.findIndex((f) => f.item.id === item.id);
    let heartIcon = $("#ad-card i");

    if (index !== -1) {
        // Se já estiver nos favoritos, remover
        listafav.splice(index, 1);
        heartIcon.removeClass("ri-heart-fill").addClass("ri-heart-3-line");

        var toastRemove = app.toast.create({
            text: `${item.nome} removido(a) da sua lista de favoritos`,
            position: "center",
            closeTimeout: 2000,
        });

        toastRemove.open();
    } else {
        // Se não estiver nos favoritos, adicionar
        listafav.push({ item: item });
        heartIcon.removeClass("ri-heart-3-line").addClass("ri-heart-fill");

        var toastCenter = app.toast.create({
            text: `${item.nome} adicionado(a) à sua lista de favoritos`,
            position: "center",
            closeTimeout: 2000,
        });

        toastCenter.open();
    }

    // ATUALIZAR O LOCALSTORAGE
    localStorage.setItem("listafav", JSON.stringify(listafav));
}

// EVENTO DE CLIQUE NO BOTÃO DE FAVORITO
$("#ad-card").on("click", function () {
    toggleFavorito(item);
});

// [MANTENHA TODO O CÓDIGO ANTERIOR ATÉ A FUNÇÃO compartilharPerfil()]

// FUNÇÃO DE COMPARTILHAMENTO CORRIGIDA
function compartilharPerfil() {
    const item = JSON.parse(localStorage.getItem("detalheCorretor"));
    if (!item) {
        console.error("Dados do corretor não encontrados");
        return;
    }

    const appUrl = "https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html";
    const mensagem = `🌟 Olha quem está no RedatorPro! 🌟\n\n` +
                     `😌 ${item.nome}\n` +
                     `🔸 ${item.especialidade}\n` +
                     `⭐ Avaliação: ${item.rating}/5 (${item.rewies} reviews)\n\n` +
                     `🔍 Conheça este e outros corretores no RedatorPro!\n` +
                     `${appUrl}`;

    // Verifica se é mobile e tem API de compartilhamento
    if (navigator.share) {
        navigator.share({
            title: `Conheça ${item.nome} - RedatorPro`,
            text: mensagem,
            url: appUrl
        }).catch(err => {
            console.log('Erro ao compartilhar:', err);
            copiarParaAreaTransferencia(mensagem);
        });
    } else {
        // CÓDIGO CORRIGIDO AQUI - SEMPRE COPIAR A MENSAGEM COMPLETA NO DESKTOP
        copiarParaAreaTransferencia(mensagem);
        
        // Opcional: Abrir popup com opções de compartilhamento
        abrirPopupCompartilhamento(mensagem);
    }
}


// NOVA FUNÇÃO PARA POPUP DE COMPARTILHAMENTO (OPCIONAL)
function abrirPopupCompartilhamento(mensagem) {
    const appUrl = "https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html";
    
    // Cria elementos do popup
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'white';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    popup.style.zIndex = '1000';
    popup.style.maxWidth = '80%';
    popup.style.textAlign = 'center';
    
    popup.innerHTML = `
        <h3 style="margin-top: 0;">Compartilhar perfil</h3>
        <p>Escolha como deseja compartilhar:</p>
        <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
            <a href="https://web.whatsapp.com/send?text=${encodeURIComponent(mensagem)}" target="_blank" style="font-size: 24px; color: #25D366;">
                <i class="fab fa-whatsapp"></i>
            </a>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(mensagem)}" target="_blank" style="font-size: 24px; color: #1DA1F2;">
                <i class="fab fa-twitter"></i>
            </a>
            <a href="mailto:?body=${encodeURIComponent(mensagem)}&subject=Conheça ${encodeURIComponent(item.nome)} no RedatorPro" style="font-size: 24px; color: #EA4335;">
                <i class="fas fa-envelope"></i>
            </a>
        </div>
        <button onclick="copiarParaAreaTransferencia('${mensagem.replace(/'/g, "\\'")}')" style="padding: 8px 15px; background: #4285f4; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-copy"></i> Copiar mensagem
        </button>
        <button onclick="this.parentElement.remove()" style="padding: 8px 15px; margin-left: 10px; background: #f1f1f1; border: none; border-radius: 5px; cursor: pointer;">
            Fechar
        </button>
    `;
    
    document.body.appendChild(popup);
}

// FUNÇÃO PARA TRUNCAR DESCRIÇÃO
function truncateDescription(desc, maxLength) {
    if (desc.length > maxLength) {
        return desc.substring(0, maxLength) + '...';
    }
    return desc;
}

// FUNÇÃO FALLBACK PARA COPIAR TEXTO
function copiarParaAreaTransferencia(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        const toast = app.toast.create({
            text: 'Link e mensagem copiados! Cole no seu app favorito',
            position: 'center',
            closeTimeout: 2000,
        });
        toast.open();
    }).catch(err => {
        // Fallback para navegadores muito antigos
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const toast = app.toast.create({
            text: 'Texto copiado! Cole onde desejar',
            position: 'center',
            closeTimeout: 2000,
        });
        toast.open();
    });
}

// ADICIONAR EVENTO DE CLIQUE AO BOTÃO DE COMPARTILHAR
$(document).ready(function() {
    $("#share-profile-btn").on('click', function(e) {
        e.preventDefault();
        compartilharPerfil();
    });
});