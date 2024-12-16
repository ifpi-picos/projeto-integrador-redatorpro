const userName = document.querySelector('#userName')
const userEmail = document.querySelector('#userEmail')

userName.textContent = localStorage.getItem('name')
userEmail.textContent = localStorage.getItem('email')

