/*global Framework7, Dom7, Template7, moment, intraapi */

(function (Framework7, $$, intraapi) {
    'use strict';

    var app, mainView, loginScreen, authInProgress;

    // Инициализация приложения
    app = new Framework7({
        animateNavBackIcon: false,
        material: true,
        materialRipple: false,
        onPageInit: function (app, page) {
            if (page.name === 'index') {

            }
        }
    });

    // Добавить основное представление
    mainView = app.addView('.view-main', {
        // Enable dynamic Navbar
        dynamicNavbar: false,
        // Enable Dom Cache so we can use all inline pages
        domCache: false
        /*
        reloadPages: true,
        preloadPreviousPage: false
        */
    });

    // Окно авторизации
    loginScreen = $$('.login-screen');
    authInProgress = false;

    // События окна авторизации
    $$('.login-screen .button').on('click', function (e) {

        // Если авторизация в процессе, то возврат
        if (authInProgress) return;
        authInProgress = true;

        // Очистить ошибки 
        loginScreen.find('.error').text('');
        loginScreen.find('.login-screen-preloader').addClass('in-display');
        // Введенные данные 
        var authData = $$.serializeObject(app.formToJSON(loginScreen.find('form')[0]));

        if (DEBUG && DEBUG === true) console.log(authData);

        // Задержка на 2 сек
        setTimeout(function () {
            intraapi.auth(authData, function (result) {
                result = JSON.parse(result);
                if (result) {
                    result = result['#value'];
                    if (result.auth === true) {
                        // Обновить локальное хранилище
                        localStorage.setItem('sign', result.sign);
                        // Обновить категории 
                        getCategories();
                        // Обновить последние статьи 
                        getLastItems();
                        // Закрыть окно авторизации
                        app.closeModal(loginScreen);
                    } else {
                        // Ошибка авторизации  
                        loginScreen.find('.error').text('Данные не прошли проверку.');
                    }
                }
                authInProgress = false;
                loginScreen.find('.login-screen-preloader').removeClass('in-display');
            },
            function (e) {
                authInProgress = false;
                loginScreen.find('.login-screen-preloader').removeClass('in-display');
                if (e.status === 403 && e.statusText === 'Forbidden') {
                    // Ошибка авторизации  
                    loginScreen.find('.error').text('Данные не прошли проверку.');
                }
            });
        }, 2000);
    });

    // Получить категории
    function getCategories(refresh) {
        var results = refresh ? [] : JSON.parse(localStorage.getItem('categories')) || [];
        if (results.length === 0) {
            intraapi.loadCategories(function (data) {
                results = JSON.parse(data);
                if (results) {
                    results = results['#value'];
                    // Обновить локальное хранилище
                    localStorage.setItem('categories', JSON.stringify(results));
                    // Обновить категории
                    updateCategories(results);
                }
            },
            function (e) {

            });
        } else {
            // Обновить категории
            updateCategories(results);
        }
        return results;
    }

    // Обновить категории
    function updateCategories(categories) {
        var itemsHTML = '<ul>';
        for (var i = 0; i < categories.length; i++) {
            itemsHTML +=
                '<li>' +
                '   <a href="category.html?categoryId=' + categories[i].id + '" class="item-link item-content close-panel">' +
                '       <div class="item-inner">' +
                '           <div class="item-title">' + categories[i].title + '</div>' +
                '       </div>' +
                '   </a>' +
                '</li>';
        }
        itemsHTML += '</ul>';
        $$('div.list-block.categories').html(itemsHTML);
    }

    // Получить последние статьи
    function getLastItems(refresh) {
        var results = refresh ? [] : JSON.parse(localStorage.getItem('top')) || [];
        if (results.length === 0) {
            intraapi.loadTopArticles(1, function (data) {
                results = JSON.parse(data);
                if (results) {
                    results = results['#value'];
                    // Обновить локальное хранилище
                    localStorage.setItem('top', JSON.stringify(results));
                    // Обновить последние статьи
                    updateLastItems(results);
                }
            },
            function (e) {

            });
        } else {
            // Обновить последние статьи
            updateLastItems(results);
        }
        return results;
    }

    // Обновить последние статьи 
    function updateLastItems(items) {
        var itemsHTML = '';
        for (var i = 0; i < items.length; i++) {
            itemsHTML +=
            '<a href="item.html?itemId=' + items[i].id + '" class="link">' +
            '   <div class="card">' +
            '       <div class="card-header">' + items[i].title + '</div>' +
            '       <div class="card-content">' +
            '           <div class="card-content-inner">' +
            '               <p>Card with header and footer. Card header is used to display card title and footer for some additional information or for custom actions.</p>' +
            '               <p class="color-gray">Posted on January 21, 2015</p>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '</a>';
        }
        $$(mainView.activePage.container).find('.last-items').html(itemsHTML);
    }

    // Проверка авторизации приложения
    function checkAuth() {
        var sign = localStorage.getItem('sign'),
            isFirstRun = (sign === undefined || sign === '');

        intraapi.checkSign({ "sign": sign },
            function (data) {
                data = JSON.parse(data);
                if (data) {
                    data = data['#value'];
                    if (data.auth === true) {
                        sign = data.sign;
                        // Если приложение авторизовано, то обновить локальное хранилище 
                        localStorage.setItem('sign', sign);
                        // Обновить категории 
                        getCategories();
                        // Обновить последние статьи 
                        getLastItems();
                    } else {
                        // Если не авторизовано, то показать окно авторизации
                        app.loginScreen(loginScreen);
                    }
                }
            },
            function (e) {

            }
        );
    }

    // Проверить, что приложение авторизовано
    checkAuth();

    // Экспортировать объект приложения в глобальное пространство
    window.app = app;

} (Framework7, Dom7, intraapi));