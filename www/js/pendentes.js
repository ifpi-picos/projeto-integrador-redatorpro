// pendentes.js
// Exibe as redações pendentes do usuário logado

window.initPendentesPage = function () {
    const lista = document.getElementById('pendentes-list');
    const loading = document.getElementById('pendentes-loading');
    const empty = document.getElementById('pendentes-empty');

    // NOVO: controles
    const searchInput = document.getElementById('pendentes-search');
    const filterAllBtn = document.getElementById('filter-all');
    const filterPendBtn = document.getElementById('filter-pendentes');
    const filterCorrBtn = document.getElementById('filter-corrigidas');

    // Estado em memória
    let allItems = [];
    let currentFilter = 'all'; // all | pendente | corrigida
    let currentQuery = '';

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

    function isViewed(essayId) {
        return localStorage.getItem(`correcao_viewed_${essayId}`) === 'true';
    }
    function setViewed(essayId) {
        localStorage.setItem(`correcao_viewed_${essayId}`, 'true');
    }

    // NOVO: renderização com busca/filtro/ordenação de prioridade
    function applyFilters() {
        const q = currentQuery.trim().toLowerCase();
        let items = allItems.slice();

        // Filtro por status
        if (currentFilter === 'pendente') {
            items = items.filter(i => (i.notaTotal === undefined || i.notaTotal === null));
        } else if (currentFilter === 'corrigida') {
            items = items.filter(i => (i.notaTotal !== undefined && i.notaTotal !== null));
        }

        // Busca por tema
        if (q) {
            items = items.filter(i => (i.tema || '').toLowerCase().includes(q));
        }

        // Ordenação:
        // 1) Corrigidas não visualizadas primeiro
        // 2) Demais por data (mais recentes primeiro)
        items.sort((a, b) => {
            const aCorr = a.notaTotal !== undefined && a.notaTotal !== null;
            const bCorr = b.notaTotal !== undefined && b.notaTotal !== null;
            const aPri = aCorr && !isViewed(a.id) ? 1 : 0;
            const bPri = bCorr && !isViewed(b.id) ? 1 : 0;
            if (aPri !== bPri) return bPri - aPri; // b primeiro se prioridade 1

            const ad = new Date(a.createdAt || 0).getTime();
            const bd = new Date(b.createdAt || 0).getTime();
            return bd - ad; // mais recente primeiro
        });

        renderLista(items);
    }

    function renderLista(redacoes) {
        lista.innerHTML = '';
        if (!redacoes.length) {
            empty.style.display = 'block';
            return;
        }
        empty.style.display = 'none';

        for (const p of redacoes) {
            const status = (p.notaTotal !== undefined && p.notaTotal !== null) ? 'Corrigida' : 'Pendente';
            let dataFormatada = '';
            if (p.createdAt) {
                const d = new Date(p.createdAt);
                dataFormatada = d.toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
            }
            let preview = '', restante = '';
            if (p.texto && typeof p.texto === 'string') {
                const textoLimpo = p.texto.replace(/\s+/g, ' ').trim();
                if (textoLimpo.length > 100) {
                    preview = textoLimpo.slice(0, 100) + '...';
                    restante = textoLimpo.slice(100);
                } else {
                    preview = textoLimpo;
                    restante = '';
                }
            }

            const card = document.createElement('div');
            card.className = 'pendente-card ' + (status === 'Corrigida' ? 'card-corrigida' : 'card-pendente');

            card.innerHTML = `
                <div class="pendente-header">
                    <span class="pendente-tema">${p.tema || 'Tema não informado'}</span>
                    <span class="pendente-status ${status === 'Corrigida' ? 'status-corrigida' : ''}">${status}</span>
                </div>
                <div class="pendente-info" style="font-size:0.97rem;color:#555;display:flex;gap:12px;align-items:center;margin-bottom:2px;">
                    ${dataFormatada ? `<span style='color:#888;font-size:0.95em;'><i class='ri-calendar-line'></i> ${dataFormatada}</span>` : ''}
                </div>
                <div class="pendente-texto">
                    ${p.imagemUrl ? '<i>Redação enviada como imagem</i>' : `
                        <span class="preview">${preview}</span>
                        ${restante ? `<span class="restante">${restante}</span>
                        <span class="ler-mais">ver mais</span>
                        <span class="ler-menos" style="display:none;">ver menos</span>` : ''}
                    `}
                </div>
                ${p.imagemUrl ? `<img class='pendente-img' loading="lazy" src='${p.imagemUrl}' alt='Redação enviada'>` : ''}
                ${status === 'Corrigida' ? `<button type="button" class="btn-ver-correcao" data-id="${p.id}"><i class="ri-eye-line"></i> Ver Correção</button>` : ''}
            `;

            if (!p.imagemUrl && restante) {
                card.addEventListener('click', (ev) => {
                    if (ev.target.classList.contains('ler-mais') || ev.target.classList.contains('ler-menos') || ev.target.classList.contains('btn-ver-correcao')) return;
                    card.classList.toggle('expanded');
                });
                const lerMais = card.querySelector('.ler-mais');
                const lerMenos = card.querySelector('.ler-menos');
                if (lerMais && lerMenos) {
                    lerMais.onclick = (e) => { e.stopPropagation(); card.classList.add('expanded'); };
                    lerMenos.onclick = (e) => { e.stopPropagation(); card.classList.remove('expanded'); };
                }
            }

            // Ação do botão "Ver Correção"
            const btnVer = card.querySelector('.btn-ver-correcao');
            if (btnVer) {
                btnVer.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = btnVer.getAttribute('data-id');
                    setViewed(id);
                    // TODO: navegar para a página de visualização da correção, quando existir.
                    // Ex.: app.views.main.router.navigate(`/vercorrecao/?id=${id}`);
                    applyFilters(); // reordena removendo prioridade, se aplicável
                });
            }

            lista.appendChild(card);
        }
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
            const resp = await fetch(`https://express-e3hm.onrender.com/red-corretores/pendentes?userId=${encodeURIComponent(userId)}`);
            if (!resp.ok) throw new Error('Erro ao buscar pendentes');
            const pendentes = await resp.json();
            allItems = Array.isArray(pendentes) ? pendentes : [];
            loading.style.display = 'none';
            applyFilters();
        } catch (e) {
            console.error('[Pendentes] Erro ao carregar pendentes:', e);
            loading.style.display = 'none';
            empty.style.display = 'block';
            empty.textContent = 'Erro ao carregar redações.';
        }
    }

    // Listeners de busca e filtros
    searchInput && searchInput.addEventListener('input', function () {
        currentQuery = this.value || '';
        applyFilters();
    });
    function setActiveFilter(which) {
        currentFilter = which;
        filterAllBtn && filterAllBtn.classList.toggle('active', which === 'all');
        filterPendBtn && filterPendBtn.classList.toggle('active', which === 'pendente');
        filterCorrBtn && filterCorrBtn.classList.toggle('active', which === 'corrigida');
        applyFilters();
    }
    filterAllBtn && filterAllBtn.addEventListener('click', () => setActiveFilter('all'));
    filterPendBtn && filterPendBtn.addEventListener('click', () => setActiveFilter('pendente'));
    filterCorrBtn && filterCorrBtn.addEventListener('click', () => setActiveFilter('corrigida'));

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
    document.addEventListener('DOMContentLoaded', function () {
        window.initPendentesPage && window.initPendentesPage();
    });

