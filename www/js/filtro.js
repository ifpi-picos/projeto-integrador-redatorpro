// Função para resetar o estado de todos os cartões
function resetarCartoes() {
  const people = document.querySelectorAll('.person-card');
  people.forEach(function(person) {
      person.parentElement.style.display = 'none'; // Oculta todos os cartões
  });
}

// Função para filtrar por nome
function filtrar() {
  resetarCartoes(); // Reseta o estado dos cartões antes de filtrar

  const input = document.getElementById('inputBusca').value.toLowerCase();
  const people = document.querySelectorAll('.person-card');
  let encontrouAlguem = false;

  people.forEach(function(person) {
      const nameElement = person.querySelector('.person-name');
      const name = nameElement.textContent;
      const nameLowerCase = name.toLowerCase();
      
      if (nameLowerCase.includes(input)) {
          // Exibe o nome e destaca a parte correspondente ao que foi digitado
          const regex = new RegExp(`(${input})`, 'gi');
          nameElement.innerHTML = name.replace(regex, '<b>$1</b>'); // Aplica negrito na parte correspondente
          person.parentElement.style.display = 'block'; // Exibe o cartão
          encontrouAlguem = true;
      }
  });

  // Exibe a mensagem "não encontramos ninguém" se não houver correspondências
  document.getElementById('no-results').style.display = encontrouAlguem ? 'none' : 'block';
}

// Função para filtrar por especialidade
function filtrarEspecialidade(especialidade) {
  resetarCartoes(); // Reseta o estado dos cartões antes de filtrar

  const people = document.querySelectorAll('.person-card');

  people.forEach(function(person) {
      const specialty = person.getAttribute('data-specialty');
      if (especialidade === '' || specialty === especialidade) {
          person.parentElement.style.display = 'block'; // Exibe o cartão
      }
  });

  // Limpa o campo de busca ao filtrar por especialidade
  document.getElementById('inputBusca').value = '';
  document.getElementById('no-results').style.display = 'none'; // Oculta a mensagem de "não encontrado"
}

