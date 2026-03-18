(function () {
  'use strict';

  const WHATSAPP_NUMBER = '79063385061';

  // Цены блюд (руб.) — соответствуют option value в select
  const DISH_PRICES = {
    'Поцелуй (порция)': 120,
    'Поцелуй (целиком)': 120,
    'Эклер (штука)': 100,
    'Эклер (целиком)': 100,
    'Мужской идеал (порция)': 140,
    'Мужской идеал (целиком)': 140,
    'Торт со шпинатом (порция)': 160,
    'Торт со шпинатом (целиком)': 1000,
    'Хачапури (штука)': 150,
    'Хачапури (целиком)': 150,
    'Хинкали (порция)': 80,
    'Хинкали (целиком)': 80
  };

  // --- Корзина заказа (блюда с количеством и ценой) ---
  let orderItems = [];

  // --- Элементы ---
  const header = document.getElementById('header');
  const burgerBtn = document.getElementById('burger-btn');
  const dishSelect = document.getElementById('dish-select');
  const dishQtyInput = document.getElementById('dish-qty');
  const addDishBtn = document.getElementById('add-dish');
  const cartContainer = document.getElementById('cart-items');
  const mainForm = document.getElementById('main-form');
  const sendWhatsAppBtn = document.getElementById('send-whatsapp');
  const dateInput = mainForm && mainForm.querySelector('input[name="date"]');

  // --- Бургер-меню ---
  if (burgerBtn && header) {
    burgerBtn.addEventListener('click', function () {
      const isOpen = header.classList.toggle('header--menu-open');
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Закрытие при клике по ссылке (скролл к якорю)
    document.querySelectorAll('.nav__link, .header__order').forEach(function (link) {
      link.addEventListener('click', function () {
        header.classList.remove('header--menu-open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- Количество: кнопки +/- ---
  const qtyMinus = document.querySelector('.quantity__btn--minus');
  const qtyPlus = document.querySelector('.quantity__btn--plus');

  if (qtyMinus && dishQtyInput) {
    qtyMinus.addEventListener('click', function () {
      const v = parseInt(dishQtyInput.value, 10) || 1;
      dishQtyInput.value = Math.max(1, v - 1);
    });
  }
  if (qtyPlus && dishQtyInput) {
    qtyPlus.addEventListener('click', function () {
      const v = parseInt(dishQtyInput.value, 10) || 1;
      dishQtyInput.value = Math.min(99, v + 1);
    });
  }

  // --- Добавить блюдо в список заказа ---
  function addDish() {
    const name = dishSelect.value;
    if (!name) return;
    const qty = parseInt(dishQtyInput.value, 10) || 1;
    const price = DISH_PRICES[name] != null ? DISH_PRICES[name] : 0;
    const existing = orderItems.find(function (item) { return item.name === name; });
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
    } else {
      orderItems.push({ name: name, qty: qty, price: price });
    }
    renderCart();
    dishQtyInput.value = 1;
  }

  function removeDish(index) {
    orderItems.splice(index, 1);
    renderCart();
  }

  function renderCart() {
    cartContainer.innerHTML = '';
    orderItems.forEach(function (item, index) {
      const price = item.price != null ? item.price : 0;
      const sum = price * item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML =
        '<span class="cart-item__name">' + escapeHtml(item.name) + '</span>' +
        '<span class="cart-item__details">' +
          '<span class="cart-item__qty">× ' + item.qty + '</span>' +
          '<span class="cart-item__sum">' + sum + ' ₽</span>' +
        '</span>' +
        '<button type="button" class="cart-item__remove" data-index="' + index + '">Удалить</button>';
      cartContainer.appendChild(div);
    });

    if (orderItems.length > 0) {
      const total = orderItems.reduce(function (acc, item) {
        const p = item.price != null ? item.price : 0;
        return acc + p * item.qty;
      }, 0);
      const totalEl = document.createElement('div');
      totalEl.className = 'cart-total';
      totalEl.innerHTML = '<span class="cart-total__label">Итого:</span> <span class="cart-total__value">' + total + ' ₽</span>';
      cartContainer.appendChild(totalEl);
    }

    cartContainer.querySelectorAll('.cart-item__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        removeDish(idx);
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  if (addDishBtn) addDishBtn.addEventListener('click', addDish);

  // --- Кастомный выпадающий список блюд ---
  const dishSelectTrigger = document.getElementById('dish-select-trigger');
  const dishSelectDropdown = document.getElementById('dish-select-dropdown');

  if (dishSelect && dishSelectTrigger && dishSelectDropdown) {
    const triggerText = dishSelectTrigger.querySelector('.select-trigger__text');
    const placeholder = '— Выберите блюдо —';

    function updateTriggerDisplay() {
      const value = dishSelect.value;
      triggerText.textContent = value || placeholder;
      triggerText.classList.toggle('select-trigger__text--placeholder', !value);
      dishSelectDropdown.querySelectorAll('.select-dropdown__option').forEach(function (opt) {
        opt.classList.toggle('is-selected', opt.getAttribute('data-value') === value);
      });
    }

    function openDropdown() {
      dishSelectDropdown.classList.add('is-open');
      dishSelectTrigger.setAttribute('aria-expanded', 'true');
      dishSelectDropdown.setAttribute('aria-hidden', 'false');
    }

    function closeDropdown() {
      dishSelectDropdown.classList.remove('is-open');
      dishSelectTrigger.setAttribute('aria-expanded', 'false');
      dishSelectDropdown.setAttribute('aria-hidden', 'true');
    }

    // Заполняем список из <option>
    Array.prototype.forEach.call(dishSelect.options, function (opt) {
      const value = opt.value;
      const text = opt.textContent;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'select-dropdown__option';
      btn.setAttribute('role', 'option');
      btn.setAttribute('data-value', value);
      btn.textContent = text;
      btn.addEventListener('click', function () {
        dishSelect.value = value;
        updateTriggerDisplay();
        closeDropdown();
      });
      dishSelectDropdown.appendChild(btn);
    });

    dishSelectTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      if (dishSelectDropdown.classList.contains('is-open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    });

    document.addEventListener('click', function (e) {
      if (dishSelectDropdown.classList.contains('is-open') &&
          !dishSelectTrigger.contains(e.target) &&
          !dishSelectDropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    updateTriggerDisplay();
  }

  // --- Отправка в WhatsApp ---
  function buildWhatsAppText() {
    const nameEl = mainForm.querySelector('[name="name"]');
    const phoneEl = mainForm.querySelector('[name="phone"]');
    const dateEl = mainForm.querySelector('[name="date"]');
    const commentEl = mainForm.querySelector('[name="comment"]');

    const name = (nameEl && nameEl.value) ? nameEl.value.trim() : '';
    const phone = (phoneEl && phoneEl.value) ? phoneEl.value.trim() : '';
    const date = (dateEl && dateEl.value) ? dateEl.value : '';
    const comment = (commentEl && commentEl.value) ? commentEl.value.trim() : '';

    const lines = ['*Заявка с сайта Печь & Пряности*', ''];

    if (name) lines.push('Имя: ' + name);
    if (phone) lines.push('Телефон: ' + phone);
    if (date) lines.push('Желаемая дата доставки: ' + date);

    if (orderItems.length > 0) {
      lines.push('', '*Заказ:*');
      let total = 0;
      orderItems.forEach(function (item) {
        const price = item.price != null ? item.price : 0;
        const sum = price * item.qty;
        total += sum;
        lines.push('• ' + item.name + ' — ' + item.qty + ' шт. × ' + price + ' ₽ = ' + sum + ' ₽');
      });
      lines.push('', '*Итого: ' + total + ' ₽*');
    }

    if (comment) {
      lines.push('', '*Комментарий:* ' + comment);
    }

    return lines.join('\n');
  }

  function sendToWhatsApp() {
    const text = buildWhatsAppText();
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
    window.location.href = url;
  }

  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', sendToWhatsApp);
  }

  // Минимальная дата заказа — только сегодня и будущее
  if (dateInput) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    dateInput.setAttribute('min', y + '-' + m + '-' + d);
  }

  // Тень у шапки при прокрутке
  if (header) {
    function onScroll() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
