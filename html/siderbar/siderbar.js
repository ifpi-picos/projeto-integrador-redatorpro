const sidebar = document.querySelector(".sidebar");
const sidebarToggleBtn = document.querySelector(".sidebar-toggle");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");
const searchForm = document.querySelector(".search-form");

const updateThemeIcon = () => {
    const isDark = document.body.classList.contains("dark-theme");
    themeIcon.textContent = isDark ? "light_mode" : "dark_mode";
};

const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
updateThemeIcon();

sidebarToggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
});

searchForm.addEventListener("click", () => {
    if(sidebar.classList.contains("collapsed")) {
        sidebar.classList.remove("collapsed");
        searchForm.querySelector("input").focus();
    }
})

themeToggleBtn.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    updateThemeIcon();
});

// Seleciona todos os elementos que possuem a classe "side-item"
const sideItemsNovo = document.querySelectorAll('.menu-link');

// Adiciona um evento de clique para cada item da barra lateral
sideItemsNovo.forEach(item => {
    item.addEventListener('click', () => {
        // Remove a classe "active" de todos os itens
        sideItemsNovo.forEach(i => i.classList.remove('active'));

        // Adiciona a classe "active" ao item clicado
        item.classList.add('active');
    });
});
