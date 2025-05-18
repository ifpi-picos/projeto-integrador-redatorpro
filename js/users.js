async function adicionarUsuario() {
  const campoNome = document.querySelector('#nome');
  const campoEmail = document.querySelector("#email");
  const campoSenha = document.querySelector("#senha");
  const campoTipo = document.querySelector("#tipoUsuario");

  const tipo = campoTipo ? campoTipo.value : "estudante";

  if (tipo === "corretor") {
    const experiencia = document.querySelector("#experiencia").value;
    const escolaridade = document.querySelector("#escolaridade").value;
    const certificado = document.querySelector("#certificado").files[0];

    const formData = new FormData();
    formData.append('name', campoNome.value);
    formData.append('email', campoEmail.value);
    formData.append('password', campoSenha.value);
    formData.append('tipo', tipo);
    formData.append('experiencia', experiencia);
    formData.append('escolaridade', escolaridade);
    formData.append('certificado', certificado);

    const resposta = await fetch('https://express-e3hm.onrender.com/users', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (resposta.ok) {
      alert('Cadastro enviado para avaliação. Aguarde aprovação.');
      window.location.reload();
    } else {
      alert('Erro ao realizar cadastro!');
    }
    return;
  }

  // Estudante
  const usuario = {
    name: campoNome.value,
    email: campoEmail.value,
    password: campoSenha.value,
    tipo: tipo
  };

  const resposta = await fetch('https://express-e3hm.onrender.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(usuario),
    credentials: 'include'
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

