document.addEventListener('DOMContentLoaded', function () {
  const BACKEND = 'https://express-e3hm.onrender.com';
  const form = document.getElementById('recuperarForm');
  const emailInput = document.getElementById('emailRecuperar');
  const btn = document.getElementById('btnEnviar');
  const statusMsg = document.getElementById('statusMsg');

  if (!form || !emailInput || !btn || !statusMsg) return;

  function validaEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  emailInput.addEventListener('input', () => {
    btn.disabled = !validaEmail(emailInput.value.trim());
    statusMsg.textContent = '';
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!validaEmail(email)) {
      statusMsg.innerHTML = '<span style="color:#c33;">E-mail inválido.</span>';
      return;
    }
    btn.disabled = true;
    statusMsg.innerHTML = 'Enviando...';
    try {
      const resp = await fetch(`${BACKEND}/users/recuperar-senha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
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
        statusMsg.innerHTML = `<span style="color:green;">${data.message || 'Verifique seu e-mail para o link de recuperação.'}</span>`;
      } else {
        statusMsg.innerHTML = `<span style="color:#c33;">${data.error || data.message || 'Erro ao solicitar recuperação.'}</span>`;
      }
    } catch (err) {
      console.error(err);
      statusMsg.innerHTML = '<span style="color:#c33;">Erro ao conectar ao servidor.</span>';
    } finally {
      btn.disabled = false;
    }
  });
});
