$(function () {

  // Same as document.querySelector("#navbarToggle").addEventListener("blur",...
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

var dc = {};

// Домашняя страница
var homeHtmlUrl = "snippets/home-snippet.html";

// Категории
var allCategoriesUrl = "https://davids-restaurant.herokuapp.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";

// Меню для категорий
var menuItemsUrl = "https://davids-restaurant.herokuapp.com/menu_items.json?category=";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

// ************************************************************************** //
// ************************************************************************** //
//                            РАБОЧИЕ ФУНКЦИИ                                 //

// Вставка новго HTML в селектор
var insertHtml = function (selector, html) {
  var targetElem = document.querySelector(selector);
  targetElem.innerHTML = html;
};

// Иконка ожидания ответа с сервера
var showLoading = function (selector) {
  var html = "<div class='text-center'>";
  html += "<img src='images/ajax-loader.gif'></div>";
  insertHtml(selector, html);
};

// Замена указанного свойства {{propName}} в строке 'string'
var insertProperty = function (string, propName, propValue) {
  var propToReplace = "{{" + propName + "}}";
  string = string
    .replace(new RegExp(propToReplace, "g"), propValue);
  return string;
};


// ************************************************************************** //
// ************************************************************************** //
//              АКТИВАЦИЯ / ДЕАКТИВАЦИЯ ОСНОВНЫХ ПУНКТОВ МЕНЮ                 //

// Remove the class 'active' from home and switch to Menu button
var switchMenuToActive = function () {
    // Remove 'active' from home button
    var classes = document.querySelector("#navHomeButton").className;
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    if (classes.indexOf("active") === -1) {
        classes += " active";
        document.querySelector("#navMenuButton").className = classes;
    }
};

// On page load (before images or CSS)
document.addEventListener("DOMContentLoaded", function (event) {

// TODO: STEP 0: Посмотрите на код
// Мы изменили этот код, чтобы получить все категории с сервера, а не просто запросить домашний HTML-фрагмент.
// Теперь у нас также есть еще одна функция под названием "buildAndShowHomeHTML()", которая будет получать все категории
// с сервера и обрабатывать их: выберите случайную категорию, извлеките домашний HTML-фрагмент,
// вставьте эту случайную категорию в домашний HTML-фрагмент, а затем вставьте этот фрагмент на нашу главную страницу (index.html).


// TODO: STEP 1: Substitute [...] below with the *value* of the function buildAndShowHomeHTML,
// so it can be called when server responds with the categories data.

// *** start ***
// При первом показе страницы
showLoading("#main-content");
$ajaxUtils.sendGetRequest(
  allCategoriesUrl,
  buildAndShowHomeHTML, // ***** <---- TODO: STEP 1: Substitute [...] ******
  true);
});
// *** finish **


// ************************************************************************** //
// ************************************************************************** //
//                         НАЧАЛЬНАЯ СТРАНИЦА САЙТА                           //


// Создает HTML-код для домашней страницы на основе массива категорий, возвращаемого с сервера.
function buildAndShowHomeHTML (categories) {

  // Load home snippet page
  $ajaxUtils.sendGetRequest(
    homeHtmlUrl,
    function (homeHtml) {

      var str = homeHtml;

      // TODO: STEP 2:
      // Получаем один случайный элемент из всего списка категорий
      // На выходе - объект 'Категория'
      var chosenCategoryShortName = chooseRandomCategory(categories);

      // Берем у этого объекта его краткое название "short_name"
      var shortNameOfCategory = chosenCategoryShortName.short_name;

      // TODO: STEP 3: Заменить {{randomCategoryShortName}} в домашнем html фрагменте
      // с выбранной категорией из STEP 2.
      var homeHtmlToInsertIntoMainPage = insertProperty(str, "randomCategoryShortName", "'" + shortNameOfCategory + "'");

      // TODO: STEP 4: Вставляем новый HTML, полученный STEP 3 в контейнер на главной странице
      insertHtml("#main-content", homeHtmlToInsertIntoMainPage);
    },
    false); // False, потому что мы получаем только обычный HTML с сервера, поэтому нет необходимости обрабатывать JSON
}


// Заданный массив объектов категории возвращает случайный объект категории.
function chooseRandomCategory (categories) {

  // Выберите случайный индекс в массиве (от 0 включительно до длины массива-1 )
  var randomArrayIndex = Math.floor(Math.random() * categories.length);

  // возвращает объект категории с этим индексом случайного массива
  return categories[randomArrayIndex];
}



// ************************************************************************** //
// ************************************************************************** //
//                            ЗАГРУЗКА КАТЕГОРИЙ                              //


// Load the menu categories view
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    allCategoriesUrl,
    buildAndShowCategoriesHTML);
};


// Builds HTML for the categories page based on the data
// from the server
function buildAndShowCategoriesHTML (categories) {
  // Load title snippet of categories page
  $ajaxUtils.sendGetRequest(
    categoriesTitleHtml,
    function (categoriesTitleHtml) {
      // Retrieve single category snippet
      $ajaxUtils.sendGetRequest(
        categoryHtml,
        function (categoryHtml) {
          // Switch CSS class active to menu button
          switchMenuToActive();

          var categoriesViewHtml =
            buildCategoriesViewHtml(categories,
                                    categoriesTitleHtml,
                                    categoryHtml);
          insertHtml("#main-content", categoriesViewHtml);
        },
        false);
    },
    false);
}


// Using categories data and snippets html
// build categories view HTML to be inserted into page
function buildCategoriesViewHtml(categories,
                                 categoriesTitleHtml,
                                 categoryHtml) {

  var finalHtml = categoriesTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over categories
  for (var i = 0; i < categories.length; i++) {
    // Insert category values
    var html = categoryHtml;
    var name = "" + categories[i].name;
    var short_name = categories[i].short_name;
    html =
      insertProperty(html, "name", name);
    html =
      insertProperty(html,
                     "short_name",
                     short_name);
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}


// ************************************************************************** //
// ************************************************************************** //
//                  ЗАГРУЗКА МЕНЮ ДЛЯ ВЫБРАННОЙ КАТЕГОРИИ                     //

// Load the menu items view
// 'categoryShort' is a short_name for a category
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort,
    buildAndShowMenuItemsHTML);
};


// Builds HTML for the single category page based on the data
// from the server
function buildAndShowMenuItemsHTML (categoryMenuItems) {
  // Load title snippet of menu items page
  $ajaxUtils.sendGetRequest(
    menuItemsTitleHtml,
    function (menuItemsTitleHtml) {
      // Retrieve single menu item snippet
      $ajaxUtils.sendGetRequest(
        menuItemHtml,
        function (menuItemHtml) {
          // Switch CSS class active to menu button
          switchMenuToActive();

          var menuItemsViewHtml =
            buildMenuItemsViewHtml(categoryMenuItems,
                                   menuItemsTitleHtml,
                                   menuItemHtml);
          insertHtml("#main-content", menuItemsViewHtml);
        },
        false);
    },
    false);
}


// Using category and menu items data and snippets html
// build menu items view HTML to be inserted into page
function buildMenuItemsViewHtml(categoryMenuItems,
                                menuItemsTitleHtml,
                                menuItemHtml) {

  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "name",
                   categoryMenuItems.category.name);
  menuItemsTitleHtml =
    insertProperty(menuItemsTitleHtml,
                   "special_instructions",
                   categoryMenuItems.category.special_instructions);

  var finalHtml = menuItemsTitleHtml;
  finalHtml += "<section class='row'>";

  // Loop over menu items
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;
  for (var i = 0; i < menuItems.length; i++) {
    // Insert menu item values
    var html = menuItemHtml;
    html =
      insertProperty(html, "short_name", menuItems[i].short_name);
    html =
      insertProperty(html,
                     "catShortName",
                     catShortName);
    html =
      insertItemPrice(html,
                      "price_small",
                      menuItems[i].price_small);
    html =
      insertItemPortionName(html,
                            "small_portion_name",
                            menuItems[i].small_portion_name);
    html =
      insertItemPrice(html,
                      "price_large",
                      menuItems[i].price_large);
    html =
      insertItemPortionName(html,
                            "large_portion_name",
                            menuItems[i].large_portion_name);
    html =
      insertProperty(html,
                     "name",
                     menuItems[i].name);
    html =
      insertProperty(html,
                     "description",
                     menuItems[i].description);

    // Add clearfix after every second menu item
    if (i % 2 !== 0) {
      html +=
        "<div class='clearfix visible-lg-block visible-md-block'></div>";
    }

    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}


// ************************************************************************** //
// ************************************************************************** //
//               ВЫВОД ДОП. НАЗВАНИЙ И ЦЕНЫ ДЛЯ ЭЛЕМЕНТА МЕНЮ                 //

// Load the menu items view
// 'categoryShort' is a short_name for a category
dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(
    menuItemsUrl + categoryShort,
    buildAndShowMenuItemsHTML);
};

// Appends price with '$' if price exists
function insertItemPrice(html,
                         pricePropName,
                         priceValue) {
  // If not specified, replace with empty string
  if (!priceValue) {
    return insertProperty(html, pricePropName, "");
  }

  priceValue = "$" + priceValue.toFixed(2);
  html = insertProperty(html, pricePropName, priceValue);
  return html;
}


// Appends portion name in parens if it exists
function insertItemPortionName(html,
                               portionPropName,
                               portionValue) {
  // If not specified, return original string
  if (!portionValue) {
    return insertProperty(html, portionPropName, "");
  }

  portionValue = "(" + portionValue + ")";
  html = insertProperty(html, portionPropName, portionValue);
  return html;
}


global.$dc = dc;

})(window);
