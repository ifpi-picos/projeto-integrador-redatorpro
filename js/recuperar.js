document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('recuperarForm');
  const statusMsg = document.getElementById('statusMsg');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      statusMsg.innerHTML = "Enviando...";
      const email = document.getElementById('emailRecuperar').value;
      try {
        const resp = await fetch('https://express-e3hm.onrender.com/users/recuperar-senha', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await resp.json();
        if (resp.ok) {
          statusMsg.innerHTML = `<span style="color:green;">${data.message || "E-mail de recuperação enviado! Verifique sua caixa de entrada."}</span>`;
        } else {
          statusMsg.innerHTML = `<span style="color:red;">${data.error || "Erro ao enviar e-mail de recuperação."}</span>`;
        }
      } catch (err) {
        statusMsg.innerHTML = `<span style="color:red;">Erro ao conectar ao servidor.</span>`;
      }
    });
  }
});
