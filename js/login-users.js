document.querySelector('.sign-in-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.querySelector('.input-wrap input[type="email"]').value;
    const password = document.querySelector('.input-wrap input[type="password"]').value;

    try {
        const response = await fetch('https://express-e3hm.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include' // Para manter a sessão
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.error || 'Email ou senha inválidos. Tente novamente.');
            return;
        }

        const data = await response.json();
        // Armazena os dados do usuário no localStorage
        localStorage.setItem('loggedUser', JSON.stringify({ name: data.user.name, email: data.user.email }));

        // Redireciona para a página principal
        window.location.href = 'https://ifpi-picos.github.io/projeto-integrador-redatorpro/www/index.html';
    } catch (error) {
        console.error('Erro ao conectar ao backend:', error);
        alert('Ocorreu um erro ao tentar se conectar ao servidor. Tente novamente mais tarde.');
    }
});