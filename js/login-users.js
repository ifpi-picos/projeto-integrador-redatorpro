document.querySelector('.sign-in-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.querySelector('.input-wrap input[type="email"]').value;
    const password = document.querySelector('.input-wrap input[type="password"]').value;

    try {
        // Envia as credenciais para a rota de login no backend
        const response = await fetch('https://express-e3hm.onrender.com/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
            credentials: 'include', // Para enviar cookies de sessão
        });

        const data = await response.json();

        if (response.ok) {
            // Se o login for bem-sucedido, armazena as informações no localStorage
            localStorage.setItem('loggedUser', JSON.stringify({ name: data.user.name, email: data.user.email }));

            // Redireciona para a página principal
            window.location.href = 'https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html';
        } else {
            alert(data.error || 'Email ou senha inválidos. Por favor, tente novamente.');
        }

    } catch (error) {
        console.error('Erro ao conectar ao backend:', error);
        alert('Ocorreu um erro ao tentar se conectar ao servidor. Tente novamente mais tarde.');
    }
});

