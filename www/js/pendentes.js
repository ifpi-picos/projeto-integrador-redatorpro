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
            // Busca todas as redações do usuário (pendentes e corrigidas)
            const resp = await fetch(`/red-corretores/pendentes?userId=${encodeURIComponent(userId)}`);
            if (!resp.ok) throw new Error('Erro ao buscar pendentes');
            const pendentes = await resp.json();
            const redacoes = pendentes; // por enquanto só pendentes
            if (!redacoes.length) {
                empty.style.display = 'block';
                loading.style.display = 'none';
                empty.textContent = 'Nenhuma redação enviada para correção.';
                return;
            }
            // Para cada redação, busca o nome do corretor (se backend retornar, use p.corretorNome)
            for (const p of redacoes) {
                // Formata data
                let dataFormatada = '';
                if (p.createdAt) {
                    const d = new Date(p.createdAt);
                    dataFormatada = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                }
                // Status
                let status = 'Pendente';
                if (p.notaTotal !== undefined && p.notaTotal !== null) status = 'Corrigida';
                // Nome do corretor (se backend retornar)
                let corretorNome = p.corretorNome || (p.corretor && p.corretor.name) || 'Corretor';
                // Card
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
});
