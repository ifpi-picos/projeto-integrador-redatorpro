// pendentes.js
// Exibe as redações pendentes do usuário logado

window.initPendentesPage = function () {
    const lista = document.getElementById('pendentes-list');
    const loading = document.getElementById('pendentes-loading');
    const empty = document.getElementById('pendentes-empty');

    function getUserId() {
        // Primeiro tenta pegar do localStorage
        let userId = localStorage.getItem('userId');
        if (userId) return userId;
        // Se não existir, tenta pegar do loggedUser
        const user = JSON.parse(localStorage.getItem('loggedUser') || 'null');
        if (user && user.id) {
            localStorage.setItem('userId', user.id);
            return user.id;
        }
        // Se não houver id, tenta decodificar o JWT
        if (user && user.token) {
            try {
                const payload = JSON.parse(atob(user.token.split('.')[1]));
                // Procura id, userId ou sub
                if (payload && payload.id) {
                    localStorage.setItem('userId', payload.id);
                    return payload.id;
                }
                if (payload && payload.userId) {
                    localStorage.setItem('userId', payload.userId);
                    return payload.userId;
                }
                if (payload && payload.sub) {
                    localStorage.setItem('userId', payload.sub);
                    return payload.sub;
                }
            } catch (e) {
                console.warn('[Pendentes] Não foi possível decodificar o JWT:', e);
            }
        }
        return null;
    }

    async function carregarPendentes() {
        console.log('[Pendentes] Iniciando carregamento de redações pendentes...');
        loading.style.display = 'block';
        empty.style.display = 'none';
        lista.innerHTML = '';
        const userId = getUserId();
        console.log('[Pendentes] userId:', userId);
        if (!userId) {
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Usuário não autenticado.';
            console.warn('[Pendentes] Usuário não autenticado.');
            return;
        }
        try {
            // Troque esta linha:
            // const resp = await fetch(`/red-corretores/pendentes?userId=${encodeURIComponent(userId)}`);
            // Por esta:
            const resp = await fetch(`https://express-e3hm.onrender.com/red-corretores/pendentes?userId=${encodeURIComponent(userId)}`);
            if (!resp.ok) throw new Error('Erro ao buscar pendentes');
            const pendentes = await resp.json();
            const redacoes = pendentes;
            if (!redacoes.length) {
                empty.style.display = 'block';
                loading.style.display = 'none';
                empty.textContent = 'Nenhuma redação enviada para correção.';
                return;
            }
            for (const p of redacoes) {
                let dataFormatada = '';
                if (p.createdAt) {
                    const d = new Date(p.createdAt);
                    dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                }
                let status = 'Pendente';
                if (p.notaTotal !== undefined && p.notaTotal !== null) status = 'Corrigida';
                let corretorNome = p.corretorNome || (p.corretor && p.corretor.name) || 'Corretor';
                const card = document.createElement('div');
                card.className = 'pendente-card';
                card.innerHTML = `
                    <div class="pendente-header">
                        <span class="pendente-tema">${p.tema || 'Tema não informado'}</span>
                        <span class="pendente-status ${status === 'Corrigida' ? 'status-corrigida' : ''}">${status}</span>
                    </div>
                    <div class="pendente-info" style="font-size:0.97rem;color:#555;display:flex;gap:12px;align-items:center;margin-bottom:2px;">
                        <span><b>Corretor:</b> ${corretorNome}</span>
                        ${dataFormatada ? `<span style='color:#888;font-size:0.95em;'><i class='ri-calendar-line'></i> ${dataFormatada}</span>` : ''}
                    </div>
                    <div class="pendente-texto">${p.texto ? p.texto.replace(/\n/g, '<br>') : (p.imagemUrl ? '<i>Redação enviada como imagem</i>' : '')}</div>
                    ${p.imagemUrl ? `<img class='pendente-img' src='${p.imagemUrl}' alt='Redação enviada'>` : ''}
                `;
                lista.appendChild(card);
            }
            loading.style.display = 'none';
            console.log('[Pendentes] Redações carregadas com sucesso.');
        } catch (e) {
            console.error('[Pendentes] Erro ao carregar pendentes:', e);
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Erro ao carregar redações.';
        }
    }

    carregarPendentes();
};

// Fallback para acesso direto (não SPA)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => window.initPendentesPage && window.initPendentesPage(), 50);
} else {
    document.addEventListener('DOMContentLoaded', function () {
        window.initPendentesPage && window.initPendentesPage();
    });
}
