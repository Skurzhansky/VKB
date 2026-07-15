/* =========================================================
   Воронежский клуб байдарочников — интерактив
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Header on scroll ---------- */
  const header = document.getElementById("siteHeader");
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll);
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const open = mainNav.style.display === "flex";
    mainNav.style.display = open ? "" : "flex";
    mainNav.style.flexDirection = "column";
    mainNav.style.position = "absolute";
    mainNav.style.top = "100%";
    mainNav.style.left = "0";
    mainNav.style.right = "0";
    mainNav.style.background = "rgba(10,36,56,.97)";
    mainNav.style.padding = "12px 20px";
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    if (window.innerWidth <= 1024) mainNav.style.display = "";
  }));

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  /* =========================================================
     МАРШРУТЫ — данные примерные (для демонстрации макета).
     Замените coords и km на реальные GPS-треки вашего клуба.
     ========================================================= */
  const routesData = {
    voronezh: {
      color: "#3fb6c9",
      name: "Река Воронеж",
      points: [
        { lat: 51.8500, lng: 39.2400, km: 0,  label: "Старт — Чертовицкое" },
        { lat: 51.9100, lng: 39.3000, km: 9,  label: "Середина маршрута" },
        { lat: 51.9803, lng: 39.3583, km: 18, label: "Финиш — Рамонь" }
      ]
    },
    don: {
      color: "#f2994a",
      name: "Река Дон",
      points: [
        { lat: 51.3970, lng: 39.0450, km: 0,  label: "Старт — Костёнки" },
        { lat: 51.2000, lng: 39.1200, km: 16, label: "Стоянка на берегу" },
        { lat: 50.9805, lng: 39.2967, km: 32, label: "Финиш — Дивногорье" }
      ]
    },
    hoper: {
      color: "#7c5cff",
      name: "Река Хопёр",
      points: [
        { lat: 51.1010, lng: 41.9210, km: 0,  label: "Старт — Новохопёрск" },
        { lat: 50.9500, lng: 41.9700, km: 22, label: "Промежуточный пункт" },
        { lat: 50.7961, lng: 42.0170, km: 45, label: "Финиш — Урюпинск" }
      ]
    },
    vdhr: {
      color: "#2ecc71",
      name: "Река Усманка",
      points: [
        { lat: 51.7920, lng: 39.5060, km: 0,  label: "Старт — Боровое" },
        { lat: 51.8300, lng: 39.5600, km: 7,  label: "Середина маршрута" },
        { lat: 51.8650, lng: 39.6050, km: 14, label: "Финиш — турбаза «Лесная сказка»" }
      ]
    }
  };

  /* =========================================================
     КАРТЫ — Яндекс.Карты (API 2.1)
     Вставьте бесплатный ключ ниже. Как получить (5 минут):
       1) https://developer.tech.yandex.ru/services/  → войти
       2) "Подключить API" → выбрать "JavaScript API" (Геокодер не нужен) → Продолжить
       3) Скопировать ключ и вставить в YANDEX_API_KEY ниже.
     ========================================================= */
  const YANDEX_API_KEY = "19a290c6-c4a7-4146-bbbb-0f59bfe19094"; // ключ Яндекс.Карт

  const CLUB_COORDS = [51.6712, 39.1978]; // ул. Челюскинцев, 101, Воронеж (примерно — уточните)

  let routesMap, ymRouteGroups = {};

  function mapFallback(el, title) {
    if (!el) return;
    el.innerHTML =
      '<div class="map-fallback">' +
        '<b>🗺️ Карта Яндекс</b>' +
        '<span>' + title + '</span>' +
        '<span>Чтобы карта отобразилась, вставьте бесплатный API-ключ Яндекс.Карт в файле ' +
        '<code>assets/script.js</code> (переменная <code>YANDEX_API_KEY</code>).</span>' +
        '<a href="https://developer.tech.yandex.ru/services/" target="_blank" rel="noopener">Получить ключ →</a>' +
      '</div>';
  }

  function initRoutesMap() {
    const mapEl = document.getElementById("routes-map");
    if (!mapEl) return;
    routesMap = new ymaps.Map(mapEl, {
      center: [51.55, 40.2], zoom: 7, controls: ["zoomControl", "fullscreenControl"]
    }, { suppressMapOpenBlock: true });
    routesMap.behaviors.disable("scrollZoom");

    Object.entries(routesData).forEach(([key, route]) => {
      const coords = route.points.map(p => [p.lat, p.lng]);
      const group = new ymaps.GeoObjectCollection();
      group.add(new ymaps.Polyline(coords, {}, {
        strokeColor: route.color, strokeWidth: 5, strokeOpacity: 0.9
      }));
      route.points.forEach(p => {
        group.add(new ymaps.Placemark([p.lat, p.lng], {
          hintContent: route.name + " — " + p.km + " км",
          balloonContentHeader: route.name,
          balloonContentBody: p.label + "<br><b>" + p.km + " км</b> от старта"
        }, { preset: "islands#circleIcon", iconColor: route.color }));
      });
      routesMap.geoObjects.add(group);
      ymRouteGroups[key] = group;
    });

    focusRoute("voronezh");
  }

  function focusRoute(key) {
    if (!routesMap || !ymRouteGroups[key]) return;
    routesMap.setBounds(ymRouteGroups[key].getBounds(), { checkZoomRange: true, zoomMargin: 35 });
  }

  function initContactsMap() {
    const mapEl = document.getElementById("contacts-map");
    if (!mapEl) return;
    const map = new ymaps.Map(mapEl, {
      center: CLUB_COORDS, zoom: 15, controls: ["zoomControl"]
    }, { suppressMapOpenBlock: true });
    map.behaviors.disable("scrollZoom");
    map.geoObjects.add(new ymaps.Placemark(CLUB_COORDS, {
      balloonContentHeader: "Воронежский клуб байдарочников",
      balloonContentBody: "ул. Челюскинцев, 101",
      hintContent: "Мы здесь"
    }, { preset: "islands#blueSportIcon" }));
  }

  function initYandexMaps() {
    initRoutesMap();
    initContactsMap();
  }

  // клики по маршрутам работают независимо от загрузки карты
  document.querySelectorAll(".route-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".route-item").forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");
      focusRoute(item.dataset.route);
    });
  });

  // Загружаем API Яндекс.Карт только если на странице есть карта
  const hasMap = document.getElementById("routes-map") || document.getElementById("contacts-map");
  if (hasMap) {
    if (!YANDEX_API_KEY || YANDEX_API_KEY.indexOf("ВАШ_КЛЮЧ") === 0) {
      mapFallback(document.getElementById("routes-map"), "Маршруты клуба на карте");
      mapFallback(document.getElementById("contacts-map"), "г. Воронеж, ул. Челюскинцев, 101");
    } else {
      const s = document.createElement("script");
      s.src = "https://api-maps.yandex.ru/2.1/?apikey=" + encodeURIComponent(YANDEX_API_KEY) + "&lang=ru_RU";
      s.onload = () => ymaps.ready(initYandexMaps);
      s.onerror = () => {
        mapFallback(document.getElementById("routes-map"), "Не удалось загрузить карту");
        mapFallback(document.getElementById("contacts-map"), "Не удалось загрузить карту");
      };
      document.head.appendChild(s);
    }
  }

  /* ---------- Форма заявки ---------- */
  const applyForm = document.getElementById("applyForm");
  const formSuccess = document.getElementById("formSuccess");
  if (applyForm) {
    applyForm.addEventListener("submit", (e) => {
      e.preventDefault();
      // ЗАГЛУШКА: здесь нет реального бэкенда.
      // Подключите Formspree / Google Forms / свой сервер, чтобы заявки приходили вам на почту.
      formSuccess.classList.add("show");
      applyForm.reset();
      setTimeout(() => formSuccess.classList.remove("show"), 6000);
    });
  }

});
