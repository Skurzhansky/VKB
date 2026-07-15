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

  let routesMap, routeLayers = {};

  function initRoutesMap() {
    const mapEl = document.getElementById("routes-map");
    if (!mapEl || typeof L === "undefined") return;

    routesMap = L.map(mapEl, { scrollWheelZoom: false }).setView([51.55, 40.2], 7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(routesMap);

    const kmIcon = (color) => L.divIcon({
      className: "km-marker",
      html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);"></div>`,
      iconSize: [14, 14]
    });

    Object.entries(routesData).forEach(([key, route]) => {
      const latlngs = route.points.map(p => [p.lat, p.lng]);
      const line = L.polyline(latlngs, { color: route.color, weight: 5, opacity: 0.85 }).addTo(routesMap);

      const markers = route.points.map(p => {
        return L.marker([p.lat, p.lng], { icon: kmIcon(route.color) })
          .addTo(routesMap)
          .bindPopup(`<b>${route.name}</b><br>${p.label}<br><b>${p.km} км</b> от старта`);
      });

      routeLayers[key] = { line, markers, group: L.featureGroup([line, ...markers]) };
    });

    // показываем первый маршрут активным по умолчанию
    focusRoute("voronezh");
  }

  function focusRoute(key) {
    if (!routesMap || !routeLayers[key]) return;
    routesMap.fitBounds(routeLayers[key].group.getBounds(), { padding: [30, 30] });
  }

  document.querySelectorAll(".route-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".route-item").forEach(i => i.classList.remove("is-active"));
      item.classList.add("is-active");
      focusRoute(item.dataset.route);
    });
  });

  /* ---------- Контакты — карта базы клуба ---------- */
  function initContactsMap() {
    const mapEl = document.getElementById("contacts-map");
    if (!mapEl || typeof L === "undefined") return;
    const clubLatLng = [51.6712, 39.1978]; // ул. Челюскинцев, 101, Воронеж (примерно — уточните при необходимости)
    const map = L.map(mapEl, { scrollWheelZoom: false }).setView(clubLatLng, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.marker(clubLatLng).addTo(map).bindPopup("<b>Воронежский клуб байдарочников</b><br>ул. Челюскинцев, 101").openPopup();
  }

  initRoutesMap();
  initContactsMap();

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
