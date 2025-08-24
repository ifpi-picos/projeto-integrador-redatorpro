document.addEventListener('DOMContentLoaded', function () {
  const BACKEND = 'https://express-e3hm.onrender.com';
  const form = document.getElementById('recuperarForm');
  const statusMsg = document.getElementById('statusMsg');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      statusMsg.innerHTML = "Enviando...";
      const email = document.getElementById('emailRecuperar').value;
      try {
        const resp = await fetch(`${BACKEND}/users/recuperar-senha`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        const ct = (resp.headers.get('content-type') || '').toLowerCase();
        let data;
        if (ct.includes('application/json')) {
          data = await resp.json();
        } else {
          const text = await resp.text();
          data = { message: text };
        }

        if (resp.ok) {
          statusMsg.innerHTML = `<span style="color:green;">${data.message || "E-mail de recuperação enviado! Verifique sua caixa de entrada."}</span>`;
        } else {
          statusMsg.innerHTML = `<span style="color:red;">${data.error || data.message || "Erro ao enviar e-mail de recuperação."}</span>`;
        }
      } catch (err) {
        console.error(err);
        statusMsg.innerHTML = `<span style="color:red;">Erro ao conectar ao servidor.</span>`;
      }
    });
  }
});
