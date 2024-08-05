ScrollReveal().reveal('.btn', {
    origin: 'left',
    delay: 1200,
    duraction: 4000,
    distance: '40%',
});

ScrollReveal().reveal('.textInicial', {
    delay: 100,
});
ScrollReveal().reveal('.subInicial', {
    delay: 500,
    duraction: 4000,
    distance: '20%',
});

ScrollReveal().reveal('.fea-box', {
    duraction: 4000,
    distance: '20%',
    interval: 400,
});

ScrollReveal().reveal('.h1lp', {
    origin: 'left',
    duraction: 4000,
    distance: '40%',
});

ScrollReveal().reveal('.pazul', {
    delay: 500,
    duraction: 4000,
    distance: '40%',
});

ScrollReveal().reveal('.ferramentas', { interval: 400 });

ScrollReveal().reveal('.funções', { 
    interval: 300,
    origin: 'left',
    duraction: 4000,
    distance: '40%',
});

ScrollReveal().reveal('.logoLogin', {
    delay: 100,
});

ScrollReveal().reveal('.subTextLogin', {
    delay: 700,
});

ScrollReveal().reveal('.surgir', {
    delay: 2000,
});

ScrollReveal().reveal('.btn3', {
    delay: 2000,
});

class MobileNavbar {
    constructor(mobileMenu, navList, closeMenu) {
        this.mobileMenu = document.querySelector(mobileMenu);
        this.navList = document.querySelector(navList);
        this.closeMenu = document.querySelector(closeMenu);
        this.activeClass = 'active';
    }

    handleClick() {
        this.navList.classList.toggle(this.activeClass);
        this.mobileMenu.classList.toggle(this.activeClass);
        this.closeMenu.classList.toggle(this.activeClass);
    }

    addClickEvent() {
        this.mobileMenu.addEventListener("click", this.handleClick.bind(this));
        this.closeMenu.addEventListener("click", this.handleClick.bind(this));
    }

    init(){
        if (this.mobileMenu && this.closeMenu) {
            this.addClickEvent();
        }

        return this;
    }
}

const mobileNavbar = new MobileNavbar(
    '#menu-btn',
    '.navlp .navigation ul',
    '#menu-close'
);
mobileNavbar.init();
