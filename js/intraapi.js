(function (Framework7, $$) {
    'use strict';

    var url = 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx/api/',     // адрес API
        rcount = 2,                                             // кол-во попыток загрузки данных
        req, reqPOST, intraapi;

    req = function (path, success, error, retry) {
        if (retry === undefined) retry = rcount;
        return $$.ajax({
            // Подписать запрос
            url: !DEBUG || DEBUG === false ? url : 'api_debug/' + path + '?sign=' + localStorage.getItem('sign'), 
            success: success,
            error: function (xhr) {
                if (!DEBUG || DEBUG === false) console.log(xhr);
                if (retry > 0 && !(xhr.status === 403 && xhr.statusText === 'Forbidden')) {
                    req(path, success, error, retry -= 1);
                } else {
                    error(xhr);
                }
            }
        });
    };

    reqPOST = function (path, data, success, error, retry) {
        if (retry === undefined) retry = rcount;
        return $$.ajax({
            url: !DEBUG || DEBUG === false ? url : 'api/' + path,
            method: 'POST',
            data: data,
            success: success,
            error: function (xhr) {
                if (!DEBUG || DEBUG === false) console.log(xhr);
                if (retry > 0 && !(xhr.status === 403 && xhr.statusText === 'Forbidden')) {
                    reqPOST(path, data, success, error, retry - 1);
                } else {
                    error(xhr);
                }
            }
        })
    };

    intraapi = {

        url: url,

        // Загрузка категорий
        loadCategories: function (success, error) {
            return req('categories', success, error);
        },

        // Загрузка последних статей
        loadTopArticles: function (lastLoadedIndex, success, error) {
            if (!lastLoadedIndex) lastLoadedIndex = 1;
            return req('toparticles/' + lastLoadedIndex, success, error);
        },

        // Загрузка статей по категории
        loadArticles: function (categoryId, lastLoadedIndex, success, error) {
            if (!lastLoadedIndex) lastLoadedIndex = 1;
            return req('articles/' + categoryId + '/' + lastLoadedIndex, success, error);
        },

        // Загрузка статьи
        loadArticle: function (articleId, success, error) {
            return req('article/' + articleId, success, error);
        },

        // Авторизация
        checkAuth: function (data, success, error) {
            return reqPOST('auth/', data, success, error);
        }
    };

    window.intraapi = intraapi;

} (Framework7, Dom7));
