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

//Filtro
$(document).ready(function () {
    $(".filter-item").click(function () {
        const value = $(this).attr("data-filter");
        if (value == "all"){
            $(".post-box").show("1000")
        } else{
            $(".post-box")
                .not("." + value)
                .hide(1000);
            $(".post-box")
            .filter("." + value)
            .show("1000")
        }
    });
    $(".filter-item").click(function () {
        $(this).addClass("active-filter").siblings().removeClass("active-filter")
    });
});
