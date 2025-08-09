// pendentes.js
// Exibe as redações pendentes do usuário logado

document.addEventListener('DOMContentLoaded', function () {
    const lista = document.getElementById('pendentes-list');
    const loading = document.getElementById('pendentes-loading');
    const empty = document.getElementById('pendentes-empty');

    function getUserId() {
        // Exemplo: buscar do localStorage, cookies ou Framework7
        return localStorage.getItem('userId') || null;
    }

    async function carregarPendentes() {
        loading.style.display = 'block';
        empty.style.display = 'none';
        lista.innerHTML = '';
        const userId = getUserId();
        if (!userId) {
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Usuário não autenticado.';
            return;
        }
        try {
            const resp = await fetch(`/red-corretores/pendentes?userId=${encodeURIComponent(userId)}`);
            if (!resp.ok) throw new Error('Erro ao buscar pendentes');
            const pendentes = await resp.json();
            if (!pendentes.length) {
                empty.style.display = 'block';
                loading.style.display = 'none';
                return;
            }
            pendentes.forEach(p => {
                const card = document.createElement('div');
                card.className = 'pendente-card';
                card.innerHTML = `
                    <div class="pendente-header">
                        <span class="pendente-tema">${p.tema || 'Tema não informado'}</span>
                        <span class="pendente-status">${p.status || 'Pendente'}</span>
                    </div>
                    <div class="pendente-texto">${p.texto ? p.texto.replace(/\n/g, '<br>') : ''}</div>
                    ${p.imagemUrl ? `<img class='pendente-img' src='${p.imagemUrl}' alt='Redação enviada'>` : ''}
                `;
                lista.appendChild(card);
            });
            loading.style.display = 'none';
        } catch (e) {
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Erro ao carregar pendentes.';
        }
    }

    carregarPendentes();
});
