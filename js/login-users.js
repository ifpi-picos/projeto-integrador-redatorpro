// Função para verificar se o usuário já está logado
function checkLoginStatus() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Se estiver logado, redireciona para a página principal
        window.location.href = 'www/index.html';
    }
}

// Verifica se o usuário já está logado
checkLoginStatus();

// VALIDAR LOGIN
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
            // Define o status de login no localStorage
            localStorage.setItem('isLoggedIn', 'true');

            // Redireciona para a página principal
            window.location.href = 'index.html';
        } else {
            alert('Email ou senha inválidos. Por favor, tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao conectar ao backend:', error);
        alert('Ocorreu um erro ao tentar se conectar ao servidor. Tente novamente mais tarde.');
    }
});
