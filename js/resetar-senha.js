document.addEventListener('DOMContentLoaded', function () {
  const BACKEND = 'https://express-e3hm.onrender.com'; // ajuste se necessário
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const form = document.getElementById('resetarSenhaForm');
  const nova = document.getElementById('novaSenha');
  const conf = document.getElementById('confirmarSenha');
  const btn = document.getElementById('btnRedefinir');
  const status = document.getElementById('statusMsg');
  const pwdInfo = document.getElementById('pwdInfo');

  if (!form || !nova || !conf || !btn || !status) return;

  if (!token) {
    status.innerHTML = '<span style="color:#c33;">Token de redefinição não encontrado na URL.</span>';
    btn.disabled = true;
    nova.disabled = true;
    conf.disabled = true;
    return;
  }

  function atualizarEstado() {
    const s = nova.value || '';
    const ok = s.length >= 4 && s === conf.value && conf.value.length > 0;
    btn.disabled = !ok;
    if (s.length === 0) { pwdInfo.textContent = ''; }
    else if (s.length < 6) { pwdInfo.textContent = 'Senha fraca'; pwdInfo.style.color = '#c66'; }
    else { pwdInfo.textContent = 'Senha OK'; pwdInfo.style.color = '#2a9d8f'; }
  }

  nova.addEventListener('input', atualizarEstado);
  conf.addEventListener('input', atualizarEstado);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (nova.value.length < 4) {
      status.innerHTML = '<span style="color:#c33;">A senha deve ter ao menos 4 caracteres.</span>';
      return;
    }
    if (nova.value !== conf.value) {
      status.innerHTML = '<span style="color:#c33;">As senhas não coincidem.</span>';
      return;
    }
    btn.disabled = true;
    status.innerHTML = 'Enviando...';
    try {
      const resp = await fetch(`${BACKEND}/users/resetar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha: nova.value })
      });

      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      let data;
      if (ct.includes('application/json')) {
        try { data = await resp.json(); } catch (err) { data = { message: await resp.text() }; }
      } else {
        const text = await resp.text();
        data = { message: text };
      }

      if (resp.ok) {
        status.innerHTML = `<span style="color:green;">${data.message || 'Senha redefinida com sucesso. Faça login com a nova senha.'}</span>`;
        form.reset();
        btn.disabled = true;
        pwdInfo.textContent = '';
      } else {
        status.innerHTML = `<span style="color:#c33;">${data.error || data.message || 'Erro ao redefinir senha.'}</span>`;
        btn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      status.innerHTML = '<span style="color:#c33;">Erro ao conectar ao servidor.</span>';
      btn.disabled = false;
    }
  });
});
