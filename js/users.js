async function adicionarUsuario() {
  const campoNome = document.querySelector('#nome');
  const campoEmail = document.querySelector("#email");
  const campoSenha = document.querySelector("#senha");

  const usuario = {
    name: campoNome.value,
    email: campoEmail.value,
    password: campoSenha.value
  };

  const resposta = await fetch('https://express-e3hm.onrender.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(usuario),
    credentials: 'include' // Para manter a sessão
  });

  if (resposta.ok) {
    console.log('Cadastro realizado com sucesso!!');
    const user = await resposta.json();
    localStorage.setItem('name', user.name);
    localStorage.setItem('email', user.email);
    window.location.href = 'https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html';
  } else {
    console.log('Erro ao realizar cadastro!!');
  }
}

