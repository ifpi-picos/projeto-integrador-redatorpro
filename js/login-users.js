document.querySelector('.sign-in-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.querySelector('.input-wrap input[type="email"]').value;
    const password = document.querySelector('.input-wrap input[type="password"]').value;

    try {
        const response = await fetch('https://express-e3hm.onrender.com/users');
        const users = await response.json();

        // Verifica se as credenciais são válidas
        const user = users.find(user => user.email === email && user.password === password);

        if (user) {
            // Armazena os dados do usuário no localStorage
            localStorage.setItem('loggedUser', JSON.stringify({ name: user.name, email: user.email }));

            // Redireciona para a página principal
            window.location.href = 'https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html';
        } else {
            alert('Email ou senha inválidos. Por favor, tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao conectar ao backend:', error);
        alert('Ocorreu um erro ao tentar se conectar ao servidor. Tente novamente mais tarde.');
    }
});
