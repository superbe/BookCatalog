////////////////////////////////////////////////////////////////////////////////
// Воспользуемся тем, что скрипт начинает исполняться сразу после загрузки и не 
// будем ждать загрузки всего документа. Сформируем всю структуру приложения.
////////////////////////////////////////////////////////////////////////////////

// Не замыкаем, так как:
// 1. Других библиотек не подгружено, используются только системные объекты.
// 2. Пакуется.
// 3. Потом подумать как это сделать правильно.

// Текущая культура.
var currentCulture;
var currentFavorites;
var currentTags;
//localStorage.clear();

// Выносим в начало классы общего назначения.

// Загрузчик данных.
// TODO: Потом доработать, дополнить другими методами.
function Request() {
	var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;
	this._xhr = new XHR();
}

Request.prototype = {
	Get: function (url, handlerComplete, handlerError, data) {
		var _this = this;
		_this._xhr.data = data;
		_this._xhr.upload.onprogress = function (event) { log(event.loaded + ' / ' + event.total); }
		_this._xhr.open('GET', url, true);
		_this._xhr.timeout = 30000;
		_this._xhr.onload = handlerComplete;
		_this._xhr.onerror = handlerError;
		_this._xhr.send();
	}
};

// Функция построения куска кода по шаблону.
function buildTemplate(part) {
	try {
		var fn = new Function("obj",
			"var p=[],print=function(){p.push.apply(p,arguments);};" +
			"with(obj){p.push('" + document.querySelector(part).innerHTML
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/[\r\t\n]/g, " ")
				.split("<%").join("\t")
				.replace(/((^|%>)[^\t]*)'/g, "$1\r")
				.replace(/\t=(.*?)%>/g, "',$1,'")
				.split("\t").join("');")
				.split("%>").join("p.push('")
				.split("\r").join("\\'") + "');} return p.join('');");
	} catch (error) {
		console.log(error);
	}
	return fn
}


// Формируем классы словаря Dictionary.
// Класс пары ключ-значение.
function KeyValuePair(key, value) {
	this.key = key;
	this.value = value;
}

KeyValuePair.prototype = {
	key: function () {
		return this.key;
	},
	value: function () {
		return this.value;
	}
	// Возможно потребуются методы ToString и Parse.
}

// Класс списка.
// TODO: Написать тесты, отработать.
function List() {
	this._items = new Array();
}

List.prototype = {
	// Количество элементов в списке.
	count: function () {
		return this._items.length;
	},
	// Текущий элемент списка.
	item: function (index) {
		if (index < this._items.length)
			return this._items[index];
		return null;
	},
	// Добавить новый элемент в список.
	add: function (value) {
		this._items.push(value);
	},
	// Добавить в список другой список.
	addRange: function (value) {
		for (var i = 0; i < value.length; i++) {
			this.add(value[i]);
		}
	},
	// Очистить список.
	clear: function () {
		this._items.length = 0;
	},
	// Проверить наличие значения в списке.
	contains: function (value) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] === value)
				return true;
		}
		return false;
	},
	// Скопировать список в другой список.
	copyTo: function (value) {
		value.length = 0;
		for (var i = 0; i < this._items.length; i++) {
			value.push(this._items[i]);
		}
	},
	// Найти элемент в списке.
	find: function (value) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] === value)
				return this._items[i];
		}
		return null;
	},
	// Найти все элементы в списке.
	findAll: function (value) {
		var result = new Array();
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] === value)
				result.push(this._items[i]);
		}
		return result;
	},
	// Найти индекс текущего значения.
	indexOf: function (value) {
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] === value)
				return i;
		}
		return -1;
	},
	// Найти все индексы текущего значения.
	indexOfAll: function (value) {
		var result = new Array();
		for (var i = 0; i < this._items.length; i++) {
			if (this._items[i] === value)
				result.push(i);
		}
		return result;
	},
	// Вставить элемент в определенное место списка.
	insert: function (index, value) {
		this._items.splice(index, 0, value);
	},
	// Получить подмассив из списка.
	getRange: function (index, count) {
		if (index < this._items.length) {
			if (index + count >= this._items.length)
				count = this._items.length - index;
			var result = new Array();
			for (var i = index; i < count; i++) {
				result.push(this._items[i]);
			}
			return result;
		}
		return null;
	},
	// Удалить элемент из списка.
	remove: function (value) {
		var index = this.indexOf(value);
		if (index >= 0)
			this.removeAt(index);
	},
	// Удалить элемент из определенного места из списка.
	removeAt: function (index) {
		this._items.splice(index, 1);
	},
	// Удалить несколько элементов из списка.
	removeRange: function (index, count) {
		this._items.splice(index, count);
	},
	// Обратить порядок списка.
	reverse: function () {
		this._items.reverse();
	},
	// Сортировать список.
	sort: function () {
		this._items.Sort();
	},
	// Преобразовать в строку.
	toString: function () {
		return JSON.stringify(this);
	},
	// Распарсить строку в словарь.
	parse: function (value) {
		var result = new List();
		var items = JSON.parse(value)._items;
		for (var i = 0; i < items.length; i++) {
			result.add(items[i]);
		}
		return result;
	}
}

// Класс словаря.
// TODO: Написать тесты, отработать.
function Dictionary() {
	this._items = new List();
}

Dictionary.prototype = {
	// Количество элементов в словаре.
	count: function () {
		return this._items.count();
	},
	// Ключи словаря.
	keys: function () {
		var result = new List();
		var length = this._items.count();
		for (var i = 0; i < length; i++) {
			var item = this._items.item(i);
			if (item)
				result.add(item.key);
		}
		return result;
	},
	// Значения словаря.
	values: function () {
		var result = new List();
		var length = this._items.count();
		for (var i = 0; i < length; i++) {
			var item = this._items.item(i);
			if (item)
				result.add(item.value);
		}
		return result;
	},
	// Текущий элемент словаря.
	item: function (index) {
		if (index < this._items.count())
			return this._items.item(index);
		return null;
	},
	// Добавить новый элемент в словарь.
	add: function (key, value) {
		if (this.containsKey(key))
			throw new Error("Данный ключ '" + key + "' уже существует в словаре.");
		else {
			var item = new KeyValuePair(key + "", value)
			this._items.add(item);
		}
	},
	// Очистить словарь.
	clear: function () {
		this._items.clear();
	},
	// Проверить наличие значения в словаре.
	contains: function (value) {
		return this._items.contains(value);
	},
	// Проверить наличие ключа в словаре.
	containsKey: function (value) {
		return this.keys().contains(value);
	},
	// Проверить наличие значения в словаре.
	containsValue: function (value) {
		return this.values().contains(value);
	},
	// Скопировать словарь в другой словарь.
	copyTo: function (array) {
		this._items.copyTo(array);
	},
	// Удалить элемент из словаря.
	remove: function (value) {
		this._items.remove(value);
	},
	// Обратить порядок словаря.
	reverse: function () {
		this._items.reverse();
	},
	// Сортировать словарь.
	sort: function () {
		this._items.Sort();
	},
	// Преобразовать словарь в строку.
	toString: function () {
		return JSON.stringify(this);
	},
	// Распарсить строку в словарь.
	parse: function (value) {
		var result = new Dictionary();
		var items = JSON.parse(value)._items._items;
		for (var i = 0; i < items.length; i++) {
			result.add(items[i].key, items[i].value);
		}
		return result;
	}
}

// Инициализируем локальное хранилище.

// Создаем объекты локального хранилища.
if (localStorage) {
	// Если файл загружен впервые формируем структуру локального хранилища.
	if (!localStorage.culture) {
		// Структура языковой культуры.
		localStorage.culture = JSON.stringify({
			en: {
				title: "Book catalog",
				logo_title: "Catalog",
				catalog_button_title: "Catalog",
				my_favorites_button_title: "My Favorites",
				copyright: "Eugene Babarykin",
				catalog_title: "Catalog",
				my_favorites_title: "My Favorites",
				to_favorites: "To favorites",
				search_placeholder: "Search in catalog",
				search_btn: "Search",
				no_search_text: "Your search did not match any documents.",
				miniature_checked_text: "Miniature",
				title_checked_text: "Title",
				author_checked_text: "Author",
				publisher_checked_text: "Publisher",
				insert_tags: "Enter tags:",
				// Специального списка рубрик в API нет, поэтому собираем заранее + с учетом местной культуры.
				subjects: [
					{ title: "All", value: "null" },
					{ title: "Art", value: "art" },
					{ title: "Fantasy", value: "fantasy" },
					{ title: "Biographies", value: "biographies" },
					{ title: "Science", value: "science" },
					{ title: "Recipes", value: "recipes" },
					{ title: "Romance", value: "romance" },
					{ title: "Religion", value: "religion" },
					{ title: "Mystery And Detective Stories", value: "mystery_and_detective_stories" },
					{ title: "Music", value: "music" },
					{ title: "Medicine", value: "medicine" },
					{ title: "Plays", value: "plays" },
					{ title: "History", value: "history" },
					{ title: "Children", value: "children" },
					{ title: "Science Fiction", value: "science_fiction" },
					{ title: "Textbooks", value: "textbooks" },
				]
			},
			ru: {
				title: "Книжный каталог",
				logo_title: "Каталог",
				catalog_button_title: "Каталог",
				my_favorites_button_title: "Избранное",
				copyright: "Евгений Бабарыкин",
				catalog_title: "Каталог",
				my_favorites_title: "Избранное",
				to_favorites: "В избранное",
				search_placeholder: "Поиск по каталогу",
				search_btn: "Искать",
				no_search_text: "По вашему запросу ничего не найдено.",
				miniature_checked_text: "Миниатюра",
				title_checked_text: "Название",
				author_checked_text: "Автор",
				publisher_checked_text: "Год",
				insert_tags: "Введите теги:",
				// Специального списка рубрик в API нет, поэтому собираем заранее + с учетом местной культуры.
				subjects: [
					{ title: "Все разделы", value: "null" },
					{ title: "Художественная литература", value: "art" },
					{ title: "Фантастика", value: "fantasy" },
					{ title: "Биографии", value: "biographies" },
					{ title: "Наука", value: "science" },
					{ title: "Рецепты", value: "recipes" },
					{ title: "Романс", value: "romance" },
					{ title: "Религия", value: "religion" },
					{ title: "Мистика и детективы", value: "mystery_and_detective_stories" },
					{ title: "Музыка", value: "music" },
					{ title: "Медицина", value: "medicine" },
					{ title: "Пьесы", value: "plays" },
					{ title: "История", value: "history" },
					{ title: "Детская литература", value: "children" },
					{ title: "Научная фантастика", value: "science_fiction" },
					{ title: "Учебная литература", value: "textbooks" },
				]
			}
		});
		localStorage.currentCulture = "ru";
		localStorage.currentController = "Catalog";
		localStorage.favorites = new Dictionary().toString();
		localStorage.tags = new Dictionary().toString();
	}
	// Сохраняем загруженные значения в глобальный объект.
	var cultures = JSON.parse(localStorage.culture);
	currentCulture = cultures[localStorage.currentCulture + ''];
	currentFavorites = new Dictionary().parse(localStorage.favorites);
	currentTags = new Dictionary().parse(localStorage.tags);
} else {
	alert("Ваш браузер не поддерживает локальные хранилища данных")
}

// Инициализация страницы.
function init() {
	// Инициировали текущую культуру.
	setContextByCulture(currentCulture);
	// Сформировали модель.
	// Сформировали представление.
	var view = new View({
		'context': document.querySelector("div#article"),
		'catalog_button': document.querySelector("a#catalog"),
		'my_favorites_button': document.querySelector("a#my_favorites"),
		'subjects_input': document.querySelector("select#subjects_input"),
		'search_input': document.querySelector("input#search_input"),
		'send_button': document.querySelector("button#send-btn"),
		'prev_button': document.querySelector("span#prev_page"),
		'next_button': document.querySelector("span#next_page"),
		'page_hidden': document.querySelector("input#current_page_hidden")
	});
	// Сформировали контроллер.
	var controller = new Controller(view);
	// Отобразили представление.
	view.show();
}

// Поменяли содержаниие в зависимости от текущей культуры.
function setContextByCulture(culture) {
	document.title = culture.title;
	var logo = document.querySelector("a.logo-type");
	logo.title = culture.logo_title;
	var catalog_button = document.querySelector("a#catalog");
	catalog_button.innerHTML = culture.catalog_button_title;
	var my_favorites_button = document.querySelector("a#my_favorites");
	my_favorites_button.innerHTML = culture.my_favorites_button_title;
	var copyright_by = document.querySelector("span#copyright");
	copyright_by.innerHTML = culture.copyright;
	if (localStorage.currentController == "Catalog") {
		var context_title = document.querySelector("h1#context_title");
		context_title.innerHTML = culture.catalog_title;
		SetSearchForm(culture);
	}
	if (localStorage.currentController == "MyFavorites") {
		var context_title = document.querySelector("h1#context_title");
		context_title.innerHTML = culture.my_favorites_title;
	}
	var no_search_text = document.querySelector("div#no_search_text");
	if (no_search_text) {
		no_search_text.innerHTML = culture.no_search_text;
	}
	var favorite_star = document.querySelectorAll("div.searchResultItemCTA");
	if (favorite_star) {
		for (var i = 0; i < favorite_star.length; i++) {
			favorite_star[i].setAttribute("title", culture.to_favorites);
		}
	}
	var label_check_miniature = document.querySelector("label#label_check_miniature");
	if (label_check_miniature) { label_check_miniature.innerHTML = culture.miniature_checked_text; }
	var label_check_title = document.querySelector("label#label_check_title");
	if (label_check_title) { label_check_title.innerHTML = culture.title_checked_text; }
	var label_check_author = document.querySelector("label#label_check_author");
	if (label_check_author) { label_check_author.innerHTML = culture.author_checked_text; }
	var label_check_publisher = document.querySelector("label#label_check_publisher");
	if (label_check_publisher) { label_check_publisher.innerHTML = culture.publisher_checked_text; }
}

// Заполнить форму поиска.
function SetSearchForm(culture) {
	// Заполнили выпадающий список.
	var select_subjects_input = document.querySelector("select#subjects_input");
	if (select_subjects_input) {
		select_subjects_input.innerHTML = "";
		for (i = 0; i < culture.subjects.length; i++) {
			var item = culture.subjects[i];
			var option = document.createElement("option");
			option.text = item.title;
			option.value = item.value;
			select_subjects_input.options.add(option);
		}
	}
	// Заполнили поле строки запроса.
	var string_search_input = document.querySelector("input#search_input");
	if (string_search_input)
		string_search_input.setAttribute("placeholder", culture.search_placeholder);
	// Заполнили титлу к кнопке.
	var button_send = document.querySelector("button.send-btn");
	if (button_send)
		button_send.setAttribute("title", culture.search_btn);
}

// Задать текущую культуру.
function setCulture(cultureName) {
	setCurrentCulture(cultureName);
	setContextByCulture(currentCulture);
}

// Задать текущую культуру.
function setCurrentCulture(cultureName) {
	if (localStorage) {
		localStorage.currentCulture = cultureName;
		var cultures = JSON.parse(localStorage.culture);
		currentCulture = cultures[cultureName + ''];
	}
}

// Событие.
function Event(sender) {
	// Собственник события.
	this._sender = sender;
	// Коллекция наблюдателей.
	this._listeners = [];
}

Event.prototype = {
	// Добавить наблюдателя.
	attach: function (listener) {
		this._listeners.push(listener);
	},
	notify: function (args) {
		var index;

		for (index = 0; index < this._listeners.length; index += 1) {
			this._listeners[index](this._sender, args);
		}
	}
};

// Представление отображает модель и предоставляет элементы пользовательского 
// интерфейса. Контроллер используется для обработки взаимодействий пользователя.
function View(elements) {
	// Активные элементы DOM.
	this._elements = elements;
	// События.
	// События кнопки "Каталог".
	this.catalogButtonClicked = new Event(this);
	// События кнопки "Избранное".
	this.myFavoritesButtonClicked = new Event(this);
	// Событие нажатия кнопки поиска.
	this.searchButtonClicked = new Event(this);
	this.filterButtonClicked = new Event(this);
	this.prewButtonClicked = new Event(this);
	this.nextButtonClicked = new Event(this);
	this.detailButtonClicked = new Event(this);
	var _this = this;
	this.cache = {};
	this._currentModel = null;
	// Присоединяем наблюдателей к HTML-элементам управления
	// Отображаемое содержание страницы.
	// Кнопка "Каталог".
	this._elements.catalog_button.addEventListener("click", function () {
		_this.catalogButtonClicked.notify();
	});
	// Кнопка "Ибранное"
	this._elements.my_favorites_button.addEventListener("click", function () {
		_this.myFavoritesButtonClicked.notify();
	});
}

// TODO: Надо сделать маршрутизацию.
// TODO: Вынести общие вещи в абстрактный класс.
View.prototype = {
	// Показать картинку.
	show: function () {
		var model = {
			'subject': 'null',
			'search': '',
			'page': undefined,
			'data': {
				docs: []
			}
		};
		this.catalogView("template#catalog_context", model);
		setContextByCulture(currentCulture);
	},
	// Отстроить представление каталога.
	catalogView: function (part, model) {
		// Отрисовали страницу.
		var context = this._setTemplate(part);
		SetSearchForm(currentCulture);
		var _this = this;
		// Выбрали раздел.
		_this._elements.subjects_input = document.querySelector("div#article select#subjects_input");
		for (i = 0; i < _this._elements.subjects_input.options.length; i++) {
			var item = _this._elements.subjects_input.options[i];
			if (model != undefined && item.value === model.subject)
				item.setAttribute("selected", "selected");
		}
		// Задали строку запроса.
		_this._elements.search_input = document.querySelector("div#article input#search_input");
		_this._elements.search_input.value = model != undefined && model.search != undefined ? model.search : _this._elements.search_input.value = '';
		// Настроили кнопку поиска.
		_this._elements.send_button = document.querySelector("div#article button.send-btn");
		_this._elements.send_button.addEventListener("click", function () {
			_this.searchButtonClicked.notify();
		});
		_this._elements.prev_button = document.querySelector("span#prev_page");
		_this._elements.prev_button.addEventListener("click", function () {
			_this.prewButtonClicked.notify();
		});
		_this._elements.next_button = document.querySelector("span#next_page");
		_this._elements.next_button.addEventListener("click", function () {
			_this.nextButtonClicked.notify();
		});
		var page = +model.data.start / 100 - +model.data.start % 100 + 1;
		var maxpage = +model.data.numFound / 100 - +model.data.numFound % 100 + 1;
		if (page > maxpage) page = maxpage;
		//if (isNaN(page) || page == undefined || page == null) page = 1;
		_this._elements.page_hidden = document.querySelector("input#current_page_hidden");
		_this._elements.page_hidden.value = page;
		document.querySelector("span#current_page").innerHTML = page;
		// Формируем отображаемый список книг.
		var context = document.querySelector("ul#siteSearch");
		context.innerHTML = "";
		var docs = model != undefined && "null" === model.subject ? model.data.docs : model.data.works;

		toggleChecked("div#paginator", docs.length != 0 && !isNaN(page))
		if (docs.length == 0)
			document.querySelector("div#searchResults").innerHTML = "<div id=\"no_search_text\" class=\"searchResultItem\">" + currentCulture.no_search_text + "</div>";
		else
			for (var i = 0; i < docs.length; i++) {
				var item = docs[i];
				item.cover_edition_key = item.cover_edition_key ? ("http://covers.openlibrary.org/b/olid/" + item.cover_edition_key + "-M.jpg") : "http://openlibrary.org/images/icons/avatar_book-sm.png";
				this._setDocInfo(context, "template#catalog_context_item", item);
			}
		setContextByCulture(currentCulture);
		window.scrollTo(0, 0);
	},
	// Отстроить представление конкретной книги.
	detailsView: function (part, model) {
		var _this = this;
		var context = _this._elements.context;
		context.innerHTML = "";
		if (!model.first_publish_year) model.first_publish_year = 2018;
		if (!model.author_name) model.author_name = " ";
		if (!model.first_sentence) model.first_sentence = " ";
		if (!model.first_sentence) model.first_sentence = " ";
		if (!model.isbn) model.isbn = " ";
		if (!model.oclc) model.oclc = " ";
		if (!model.publisher) model.publisher = " ";
		model.cover_edition_key = model.cover_edition_key ? model.cover_edition_key : "http://openlibrary.org/images/icons/avatar_book-sm.png";
		var ul = document.createElement('div');
		ul.id = "details_view";
		ul.innerHTML = this._BuildTemplate(part)(model);
		var add_tag = ul.querySelector("span.add-tag");
		add_tag.model = model;
		var tags_section_container = ul.querySelector("div#tags_section_container");
		var length = currentTags.keys().count();
		for (var i = 0; i < length; i++) {
			var item = currentTags.item(i);
			if (item.value.indexOf(model.key) >= 0) {
				var span = document.createElement("span");
				span.id = item.key;
				var smodel = new KeyValuePair(item.key, model.key);
				span.innerHTML = buildTemplate("template#tag_tmp")(smodel);
				tags_section_container.appendChild(span);
			}
		}
		context.appendChild(ul);
	},
	// Отстроить представление избранных документов.
	favoritesView: function (part, model) {
		// Отрисовали страницу.
		var context = this._setTemplate(part);
		SetSearchForm(currentCulture);
		var _this = this;
		// Задали строку запроса.
		_this._elements.search_input = document.querySelector("div#article input#search_input");
		_this._elements.search_input.value = model != undefined && model.search != undefined ? model.search : _this._elements.search_input.value = '';
		// Настроили кнопку поиска.
		_this._elements.send_button = document.querySelector("div#article button.send-btn");
		_this._elements.send_button.addEventListener("click", function () {
			_this.filterButtonClicked.notify();
		});
		// Формируем отображаемый список книг.
		var result_context = context.querySelector("ul#siteSearch");
		result_context.innerHTML = "";
		var length = model.count();
		if (length == 0)
			document.querySelector("div#searchResults").innerHTML = "<div id=\"no_search_text\" class=\"searchResultItem\">" + currentCulture.no_search_text + "</div>";
		else
			for (var i = 0; i < length; i++) {
				var item = model._items[i];
				this._setDocInfo(result_context, "template#catalog_context_item", item);
			}
		setContextByCulture(currentCulture);
	},
	// Отстроить шаблон представления.
	// TODO: Доработать либо в общий метод _BuildTemplate, либо в представление (предпочтительнее).
	_setTemplate: function (part) {
		var context = this._elements.context;
		context.innerHTML = "";
		var tmpl = document.querySelector(part);
		context.appendChild(tmpl.content.cloneNode(true));
		return context;
	},
	// Отобразить аннотационные сведения о книге.
	_setDocInfo: function (context, part, model) {
		try {
			var _this = this;
			// TODO: Вынести в отдельный метод, а самому обработку модели перенести в контроллер.
			if (!model.first_publish_year) model.first_publish_year = 2018;
			if (!model.author_name) model.author_name = " ";
			model.cover_edition_key = model.cover_edition_key ? (model.cover_edition_key) : "http://openlibrary.org/images/icons/avatar_book-sm.png";
			var newLi = document.createElement('li');
			newLi.className = "searchResultItem";
			newLi.innerHTML = this._BuildTemplate(part)(model);
			// Добавляем модель к объекту.
			var favorite_star = newLi.querySelector("div.searchResultItemCTA");
			favorite_star.setAttribute("title", currentCulture.to_favorites);
			var path = newLi.querySelector("path.favorite_star");
			path.setAttribute("fill", currentFavorites.containsKey(model.key) ? "#FFFF00" : "#CCCCCC");
			path.model = model;
			var a_title = newLi.querySelector("a.a_title");
			a_title.model = model;
			a_title.addEventListener("click", function () {
				// API проработан плохо, поэтому данные передаем из данных поиска.
				_this._currentModel = this.model;
				_this.detailButtonClicked.notify();
			});
			var img_cover = newLi.querySelector("a.img_cover");
			img_cover.model = model;
			img_cover.addEventListener("click", function () {
				// API проработан плохо, поэтому данные передаем из данных поиска.
				_this._currentModel = this.model;
				_this.detailButtonClicked.notify();
			});
			context.appendChild(newLi);
		} catch (error) {
			console.log(error);
			console.log(model);
		}
	},
	// Отстроить шаблон.
	_BuildTemplate: function (part) {
		return buildTemplate(part);
	}
};

// Контроллер реагирует на действия пользователя и вызывает изменения в модели.
function Controller(view) {
	this._view = view;
	var _this = this;
	this._view.catalogButtonClicked.attach(function () {
		_this.setCatalog();
	});

	this._view.searchButtonClicked.attach(function (view) {
		_this.setCatalog(view._elements.subjects_input.options[view._elements.subjects_input.selectedIndex].value, view._elements.search_input.value);
	});

	this._view.filterButtonClicked.attach(function (view) {
		_this.setFavorites(view._elements.search_input.value);
	});

	this._view.prewButtonClicked.attach(function (view) {
		var subject = view._elements.subjects_input.options[view._elements.subjects_input.selectedIndex].value;
		var search = view._elements.search_input.value;
		var page = view._elements.page_hidden.value == undefined ? 1 : (+view._elements.page_hidden.value - 1);
		if (page == undefined || page < 1) page = 1;
		_this.setCatalog(subject, search, page);
	});

	this._view.detailButtonClicked.attach(function (view) {
		// Пока так.
		// TODO: Сделать сбор данных с формы.
		_this.setDetail(view._currentModel);
	});

	this._view.nextButtonClicked.attach(function (view) {
		var subject = view._elements.subjects_input.options[view._elements.subjects_input.selectedIndex].value;
		var search = view._elements.search_input.value;
		var page = view._elements.page_hidden.value == undefined ? 2 : (+view._elements.page_hidden.value + 1);
		if (page == undefined || page < 1) page = 1;
		_this.setCatalog(subject, search, page);
	});

	this._view.myFavoritesButtonClicked.attach(function () {
		_this.setFavorites();
	});

	this.request = new Request();
}

Controller.prototype = {
	// Действие отображения каталога.
	setCatalog: function (subject, search, page) {
		var url = "http://openlibrary.org/" + (subject == "null" ? "search.json" : ("subjects/" + subject + ".json"))
		if (search)
			url += "?q=" + search.replace(/ /g, "+");
		if (page && page > 0)
			url += "&page=" + page + "";
		toggleExt(document.querySelector("div#wait_panel"), true);
		this.request.Get(url,
			function () {
				var model = {
					'subject': this.data.subject,
					'search': this.data.search,
					'page': this.data.page,
					'data': JSON.parse(this.responseText)
				};
				this.data.target.catalogView(this.data.part, model);
				toggleExt(document.querySelector("div#wait_panel"), false);
			},
			function () { console.error("Ошибка ajax запроса.\nСтатус ошибки: %d\nUrl ошибки: %s\nСообщение: %s", this.status, this.url, this.responseText); },
			{
				'subject': subject,
				'search': search,
				'page': page,
				'target': this._view,
				'part': "template#catalog_context"
			});
	},
	// Действие отображения конкретного документа.
	setDetail: function (model) {
		this._view.detailsView("template#details_context", model);
	},
	// Действие отображения избранного.
	setFavorites: function (search) {
		var model;
		if (search != undefined && search != null && search != "") {
			var tags = search.split(" ");
			var result = new Dictionary();
			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				var index = currentTags.keys().indexOf(tag);
				var item = currentTags.item(index).value;
				for (var j = 0; j < item.length; j++) {
					if (!result.keys().contains(item[j])) {
						var sub_index = currentFavorites.keys().indexOf(item[j]);
						var sub_item = currentFavorites.item(sub_index).value;
						result.add(item[j], sub_item)
					}
				}
			}
			model = result.values();
		} else {
			model = currentFavorites.values();
		}
		this._view.favoritesView("template#my_favorites_context", model);
	}
};

// Добавляем/удаляем из избранного.
function setFavorite(id, element) {
	if (currentFavorites.containsKey(id)) {
		var index = currentFavorites.keys().indexOf(id);
		var item = currentFavorites.item(index);
		currentFavorites.remove(item)
		element.setAttribute("fill", "#CCCCCC");
	} else {
		currentFavorites.add(id, element.model);
		element.setAttribute("fill", "#FFFF00");
	}
	localStorage.favorites = currentFavorites.toString();
}

// Можно объеденить в common класс.
function toggle(part) {
	var result = document.querySelector(part);
	toggleExt(result, result.style.display === "none" || result.style.display === "")
}

function toggleChecked(part, checked) {
	var result = document.querySelector(part);
	toggleExt(result, checked)
}

function toggleExt(element, checked) {
	if (checked) {
		element.style.display = "block";
	} else {
		element.style.display = "none";
	}
}

function handleCheckboxClick(part, element) {
	var items = document.querySelectorAll(part);
	if (items) {
		for (var i = 0; i < items.length; i++) {
			toggleExt(items[i], element.checked)
		}
	}
}

function addTag(id, element) {
	var tags = prompt(currentCulture.insert_tags).split(" ");
	// Добавили книгу в избранное.
	if (!currentFavorites.containsKey(id)) {
		currentFavorites.add(id, element.model);
		element.setAttribute("fill", "#FFFF00");
	}
	localStorage.favorites = currentFavorites.toString();
	// Добавляем теги.
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		var contains = false;
		if (currentTags.containsKey(tag)) {
			var index = currentTags.keys().indexOf(tag);
			var item = currentTags.item(index);
			if (item.value.indexOf(id) < 0)
				item.value.push(id);
			else
				contains = true;
		} else {
			var value = new Array();
			value.push(id);
			currentTags.add(tag, value);
		}
		if (!contains) {
			var tags_section_container = document.querySelector("div#tags_section_container");
			var span = document.createElement("span");
			span.id = tag;
			var model = new KeyValuePair(tag, id);
			span.innerHTML = buildTemplate("template#tag_tmp")(model);
			tags_section_container.appendChild(span);
		}
	}
	localStorage.tags = currentTags.toString();
}

function deleteTag(key, element) {
	var id = element.getAttribute("value");
	var index = currentTags.keys().indexOf(key);
	var item = currentTags.item(index);
	var index = +item.value.indexOf(id);
	if (index >= 0) {
		item.value.splice(+index, 1);
	}
	localStorage.tags = currentTags.toString();
	var tags_section_container = document.querySelector("div#tags_section_container");
	var tag = document.querySelector("span#" + key);
	tags_section_container.removeChild(tag);
}