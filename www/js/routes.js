//INICIALIZAÇÃO DO F7 QUANDO DISPOSITIVO ESTÁ PRONTO
document.addEventListener('deviceready', onDeviceReady, false);
var app = new Framework7({
  // App root element
  el: '#app',
  // App Name
  name: 'My App',
  // App id
  id: 'com.myapp.test',
  // Enable swipe panel
  panel: {
    swipe: true,
  },
  dialog: {
    buttonOk: 'Sim',
    buttonCancel: 'Cancelar',
  },
  // Add default routes
  routes: [
    {
      path: '/index/',
      url: 'index.html',
      options: {
        transition: 'f7-dive',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          //app.views.main.router.navigate('/detalhes/');
          $.getScript('js/index.js');

          var swiper = new Swiper(".mySwiper", {
            slidesPerView: 1,
            spaceBetween: 30,
            autoplay: true,
            delay: 3000,
            loop: true,

            breakpoints: {
              50:{
                slidesPerView: 1,
                spaceBetween: 30,
              },
              640:{
                slidesPerView: 2,
                spaceBetween: 30,
              },
              992: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              1200: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            },
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
          });

          var swiper2 = new Swiper(".categorias", {
            slidesPerView: 3,
            spaceBetween: 10,
            freeMode: true,

            breakpoints: {
              50:{
                slidesPerView: 3,
                spaceBetween: 10,
              },
              640:{
                slidesPerView: 6,
                spaceBetween: 10,
              },
              992: {
                slidesPerView: 8,
                spaceBetween: 10,
              },
              1200: {
                slidesPerView: 12,
                spaceBetween: 10,
              },
            },
          });

        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/link2/',
      url: 'link2.html',
      options: {
        transition: 'f7-dive',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").show("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // Fazer algo quando a página for inicializada
          $.getScript('js/filtro.js');
      
          // ALIMENTAR DE FORMA DINÂMICA A TELA LINK2 (CORRETORES)
          fetch('https://backend-usuarios-redatorpro.onrender.com/users') // Nova URL
              .then(response => response.json())
              .then(data => {
                  // Verificar se o backend retorna os dados no formato esperado
                  if (!Array.isArray(data)) {
                      console.error('Formato de dados inesperado:', data);
                      return;
                  }
      
                  // Ordenar dados por nome (name) com localeCompare para considerar acentuação
                  data.sort((a, b) => a.name.localeCompare(b.name));
      
                  // SALVAR DADOS DO BACK-END LOCALMENTE
                  localStorage.setItem('corretores', JSON.stringify(data));
                  console.log('Dados dos corretores salvos no localStorage');
      
                  // Simular carregamento online
                  setTimeout(() => {
      
                      // ESVAZIAR A ÁREA DA LISTA DE CORRETORES
                      $("#person-list").empty();
      
                      // Iterar sobre os dados recebidos e adicionar à lista
                      data.forEach(corretor => {
                          // Construir a URL da imagem usando o número no campo "profilePhoto"
                          var imagemURL = corretor.profilePhoto
                              ? `https://backend-usuarios-redatorpro.onrender.com/uploads/${corretor.profilePhoto}`
                              : 'img/default-photo.png'; // Imagem padrão caso não tenha foto
      
                          var corretorHTML = `
                              <a data-id="${corretor.id}" href="#" class="item">
                                  <div class="person-card" data-name="${corretor.name}" data-specialty="${corretor.specialty}">
                                      <div class="person-info">
                                          <img src="${imagemURL}" alt="${corretor.name}" class="person-photo">
                                          <div class="person-details">
                                              <h3 class="person-name">${corretor.name}</h3>
                                              <p class="person-specialty">${corretor.specialty}</p>
                                          </div>
                                      </div>
                                      <div class="person-rating">
                                          <i class="mdi mdi-star" style="color: orange;"></i>
                                          <span class="rating-score">${corretor.stars ? corretor.stars.toFixed(1) : 'N/A'}</span>
                                      </div>
                                  </div>
                              </a>
                          `;
      
                          $("#person-list").append(corretorHTML);
                      });
      
                      // Adicionar evento de clique nos itens
                      $(".item").on('click', function () {
                          var id = $(this).attr('data-id');
                          localStorage.setItem('detalhe', id);
                          app.views.main.router.navigate('/detalhes/');
                      });
      
                  }, 2500);
      
              })
              .catch(error => console.error('Erro ao fazer fetch dos dados: ' + error));
      },
      
      
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/favoritos/',
      url: 'favoritos.html',
      animate: false,
      options: {
        transition: 'f7-dive',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          //$("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          $.getScript('js/favoritos.js');
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/link4/',
      url: 'link4.html',
      animate: false,
      options: {
        transition: 'f7-dive',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
    {
      path: '/detalhes/',
      url: 'detalhes.html',
      animate: false,
      options: {
        transition: 'f7-dive',
      },
      on: {
        pageBeforeIn: function (event, page) {
          // fazer algo antes da página ser exibida
          $("#menuPrincipal").hide("fast");
        },
        pageAfterIn: function (event, page) {
          // fazer algo depois da página ser exibida
        },
        pageInit: function (event, page) {
          // fazer algo quando a página for inicializada
          $.getScript('js/detalhes.js');
        },
        pageBeforeRemove: function (event, page) {
          // fazer algo antes da página ser removida do DOM
        },
      }
    },
  ],
  // ... other parameters
});

//Para testes direto no navegador
var mainView = app.views.create('.view-main', { url: '/index/' });

//EVENTO PARA SABER O ITEM DO MENU ATUAL
app.on('routeChange', function (route) {
  var currentRoute = route.url;
  console.log(currentRoute);
  document.querySelectorAll('.tab-link').forEach(function (el) {
    el.classList.remove('active');
  });
  var targetEl = document.querySelector('.tab-link[href="' + currentRoute + '"]');
  if (targetEl) {
    targetEl.classList.add('active');
  }
});


function onDeviceReady() {
  //Quando estiver rodando no celular
  var mainView = app.views.create('.view-main', { url: '/index/' });

  //COMANDO PARA "OUVIR" O BOTAO VOLTAR NATIVO DO ANDROID 	
  document.addEventListener("backbutton", function (e) {

    if (mainView.router.currentRoute.path === '/index/') {
      e.preventDefault();
      app.dialog.confirm('Deseja sair do aplicativo?', function () {
        navigator.app.exitApp();
      });
    } else {
      e.preventDefault();
      mainView.router.back({ force: true });
    }
  }, false);

}
