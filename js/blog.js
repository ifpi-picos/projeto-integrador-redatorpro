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