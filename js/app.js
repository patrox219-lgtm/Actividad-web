/* ==========================================================================
   Sistema de reservas de espacios universitarios
   Datos simulados + lógica de interfaz (sin backend)
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. DATOS SIMULADOS
     ------------------------------------------------------------------ */
  const ESPACIOS = [
    { id: "A-101", nombre: "Sala 101", tipo: "Sala de clases", edificio: "Edificio A", piso: "Piso 1", capacidad: 40, caracteristicas: ["Proyector", "Pizarra"] },
    { id: "A-204", nombre: "Sala 204", tipo: "Sala de clases", edificio: "Edificio A", piso: "Piso 2", capacidad: 35, caracteristicas: ["Proyector", "Aire acondicionado"] },
    { id: "B-Lab1", nombre: "Laboratorio de Redes", tipo: "Laboratorio", edificio: "Edificio B", piso: "Piso 1", capacidad: 24, caracteristicas: ["20 estaciones PC", "Switches y routers"] },
    { id: "B-Lab2", nombre: "Laboratorio de Programación", tipo: "Laboratorio", edificio: "Edificio B", piso: "Piso 1", capacidad: 30, caracteristicas: ["30 estaciones PC", "Proyector"] },
    { id: "B-Lab3", nombre: "Laboratorio de Física", tipo: "Laboratorio", edificio: "Edificio B", piso: "Piso 2", capacidad: 20, caracteristicas: ["Mesones de trabajo", "Equipos de medición"] },
    { id: "C-E01", nombre: "Sala de Estudio 1", tipo: "Sala de estudio", edificio: "Edificio C", piso: "Piso 1", capacidad: 6, caracteristicas: ["Pizarra blanca", "Enchufes"] },
    { id: "C-E02", nombre: "Sala de Estudio 2", tipo: "Sala de estudio", edificio: "Edificio C", piso: "Piso 1", capacidad: 8, caracteristicas: ["Pizarra blanca", "Vista al patio"] },
    { id: "C-E03", nombre: "Sala de Estudio 3", tipo: "Sala de estudio", edificio: "Edificio C", piso: "Piso 2", capacidad: 4, caracteristicas: ["Enchufes", "Silenciosa"] },
    { id: "D-Reu1", nombre: "Sala de Reuniones Norte", tipo: "Sala de reunión", edificio: "Edificio D", piso: "Piso 3", capacidad: 12, caracteristicas: ["Pantalla para videollamada", "Mesa ovalada"] },
    { id: "D-Reu2", nombre: "Sala de Reuniones Sur", tipo: "Sala de reunión", edificio: "Edificio D", piso: "Piso 3", capacidad: 10, caracteristicas: ["Pizarra", "Vista exterior"] },
    { id: "A-Aud", nombre: "Auditorio Principal", tipo: "Auditorio", edificio: "Edificio A", piso: "Piso 1", capacidad: 120, caracteristicas: ["Sistema de audio", "Escenario"] },
    { id: "C-Coop", nombre: "Espacio Colaborativo", tipo: "Sala de estudio", edificio: "Edificio C", piso: "Piso 1", capacidad: 16, caracteristicas: ["Mobiliario modular", "Pantallas móviles"] },
  ];

  const STORAGE_KEY = "reservas-espacios-uc";

  /* ------------------------------------------------------------------
     2. ESTADO
     ------------------------------------------------------------------ */
  let reservas = cargarReservas();
  let espacioSeleccionado = null;

  /* ------------------------------------------------------------------
     3. REFERENCIAS DOM
     ------------------------------------------------------------------ */
  const el = {
    navTabs: document.querySelectorAll(".nav-tab"),
    views: document.querySelectorAll(".view"),
    reservasCount: document.getElementById("reservas-count"),

    filtersForm: document.getElementById("filters-form"),
    fSearch: document.getElementById("f-search"),
    fEdificio: document.getElementById("f-edificio"),
    fTipo: document.getElementById("f-tipo"),
    fCapacidad: document.getElementById("f-capacidad"),
    fFecha: document.getElementById("f-fecha"),
    btnClearFilters: document.getElementById("btn-clear-filters"),

    roomLedger: document.getElementById("room-ledger"),
    resultsCount: document.getElementById("results-count"),
    emptyState: document.getElementById("empty-state"),

    reservationsList: document.getElementById("reservations-list"),
    reservationsEmpty: document.getElementById("reservations-empty"),

    modalEl: document.getElementById("modal-reservar"),
    modalTipo: document.getElementById("modal-room-tipo"),
    modalTitle: document.getElementById("modal-reservar-title"),
    modalSummary: document.getElementById("modal-room-summary"),
    modalAlert: document.getElementById("modal-alert"),
    formReservar: document.getElementById("form-reservar"),
    rFecha: document.getElementById("r-fecha"),
    rHora: document.getElementById("r-hora"),
    rNombre: document.getElementById("r-nombre"),
    rMotivo: document.getElementById("r-motivo"),

    toastStack: document.getElementById("toast-stack"),
  };

  const modalReservar = new bootstrap.Modal(el.modalEl);

  /* ------------------------------------------------------------------
     4. UTILIDADES
     ------------------------------------------------------------------ */
  function cargarReservas() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("No se pudieron leer las reservas guardadas:", err);
      return [];
    }
  }

  function guardarReservas() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
    } catch (err) {
      console.error("No se pudieron guardar las reservas:", err);
    }
  }

  function formatearFecha(fechaISO) {
    if (!fechaISO) return "";
    const [y, m, d] = fechaISO.split("-");
    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
    return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
  }

  function hoyISO() {
    const hoy = new Date();
    const off = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy - off).toISOString().slice(0, 10);
  }

  function mostrarToast(mensaje, tipo) {
    const toast = document.createElement("div");
    toast.className = `toast-msg is-${tipo || "success"}`;
    toast.textContent = mensaje;
    el.toastStack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function contarReservasActivas(espacioId, fecha, hora) {
    return reservas.filter(
      (r) => r.espacioId === espacioId && r.fecha === fecha && r.hora === hora && r.estado === "confirmada"
    ).length;
  }

  /* ------------------------------------------------------------------
     5. NAVEGACIÓN ENTRE VISTAS
     ------------------------------------------------------------------ */
  function cambiarVista(nombreVista) {
    el.navTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === nombreVista));
    el.views.forEach((view) => {
      view.hidden = view.dataset.viewPanel !== nombreVista;
    });
    if (nombreVista === "reservas") renderReservas();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  el.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => cambiarVista(tab.dataset.view));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => cambiarVista(btn.dataset.goto));
  });

  /* ------------------------------------------------------------------
     6. FILTROS: poblar selects dinámicamente
     ------------------------------------------------------------------ */
  function poblarFiltros() {
    const edificios = [...new Set(ESPACIOS.map((e) => e.edificio))].sort();
    const tipos = [...new Set(ESPACIOS.map((e) => e.tipo))].sort();

    edificios.forEach((edif) => {
      const opt = document.createElement("option");
      opt.value = edif;
      opt.textContent = edif;
      el.fEdificio.appendChild(opt);
    });

    tipos.forEach((tipo) => {
      const opt = document.createElement("option");
      opt.value = tipo;
      opt.textContent = tipo;
      el.fTipo.appendChild(opt);
    });
  }

  function obtenerEspaciosFiltrados() {
    const texto = el.fSearch.value.trim().toLowerCase();
    const edificio = el.fEdificio.value;
    const tipo = el.fTipo.value;
    const capacidadMin = parseInt(el.fCapacidad.value, 10) || 0;

    return ESPACIOS.filter((e) => {
      const coincideTexto =
        !texto ||
        e.nombre.toLowerCase().includes(texto) ||
        e.edificio.toLowerCase().includes(texto) ||
        e.tipo.toLowerCase().includes(texto);
      const coincideEdificio = !edificio || e.edificio === edificio;
      const coincideTipo = !tipo || e.tipo === tipo;
      const coincideCapacidad = e.capacidad >= capacidadMin;
      return coincideTexto && coincideEdificio && coincideTipo && coincideCapacidad;
    });
  }

  /* ------------------------------------------------------------------
     7. RENDER: listado de espacios
     ------------------------------------------------------------------ */
  function renderEspacios() {
    const lista = obtenerEspaciosFiltrados();
    el.roomLedger.innerHTML = "";

    el.resultsCount.textContent =
      lista.length === 1 ? "1 espacio encontrado" : `${lista.length} espacios encontrados`;

    el.emptyState.hidden = lista.length !== 0;
    el.roomLedger.hidden = lista.length === 0;

    lista.forEach((espacio) => {
      const fechaConsulta = el.fFecha.value;
      const ocupadas = fechaConsulta
        ? reservas.filter((r) => r.espacioId === espacio.id && r.fecha === fechaConsulta && r.estado === "confirmada").length
        : 0;
      const limitado = fechaConsulta && ocupadas >= 4;

      const row = document.createElement("div");
      row.className = "room-row";
      row.setAttribute("role", "listitem");
      row.innerHTML = `
        <div class="room-main">
          <div class="room-heading">
            <h3 class="room-name">${espacio.nombre}</h3>
            <span class="room-type-tag">${espacio.tipo}</span>
          </div>
          <p class="room-location">${espacio.edificio} &middot; ${espacio.piso}</p>
          <div class="room-meta">
            <span>Capacidad: ${espacio.capacidad} personas</span>
            <span>${espacio.caracteristicas.join(" &middot; ")}</span>
          </div>
        </div>
        <div class="room-side">
          <span class="availability-tag ${limitado ? "is-limited" : "is-available"}">
            ${fechaConsulta ? (limitado ? "Alta demanda" : "Disponible") : "Consultar horario"}
          </span>
          <button type="button" class="btn-ink" data-reservar="${espacio.id}">Reservar</button>
        </div>
      `;
      el.roomLedger.appendChild(row);
    });

    document.querySelectorAll("[data-reservar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalReserva(btn.dataset.reservar));
    });
  }

  [el.fSearch, el.fEdificio, el.fTipo, el.fCapacidad, el.fFecha].forEach((input) => {
    input.addEventListener("input", renderEspacios);
    input.addEventListener("change", renderEspacios);
  });

  el.btnClearFilters.addEventListener("click", () => {
    setTimeout(renderEspacios, 0);
  });

  /* ------------------------------------------------------------------
     8. MODAL DE RESERVA
     ------------------------------------------------------------------ */
  function abrirModalReserva(espacioId) {
    espacioSeleccionado = ESPACIOS.find((e) => e.id === espacioId);
    if (!espacioSeleccionado) return;

    el.modalTipo.textContent = espacioSeleccionado.tipo;
    el.modalTitle.textContent = espacioSeleccionado.nombre;
    el.modalSummary.innerHTML = `
      <span>${espacioSeleccionado.edificio} &middot; ${espacioSeleccionado.piso}</span>
      <span>Capacidad: ${espacioSeleccionado.capacidad} personas</span>
    `;

    el.formReservar.reset();
    el.formReservar.classList.remove("was-validated");
    el.modalAlert.hidden = true;
    el.rFecha.min = hoyISO();

    modalReservar.show();
  }

  el.formReservar.addEventListener("submit", function (event) {
    event.preventDefault();
    event.stopPropagation();

    el.modalAlert.hidden = true;

    if (!el.formReservar.checkValidity()) {
      el.formReservar.classList.add("was-validated");
      return;
    }

    const fecha = el.rFecha.value;
    const hora = el.rHora.value;

    const yaExiste = reservas.some(
      (r) =>
        r.espacioId === espacioSeleccionado.id &&
        r.fecha === fecha &&
        r.hora === hora &&
        r.estado === "confirmada"
    );

    if (yaExiste) {
      el.modalAlert.textContent = "Este espacio ya tiene una reserva confirmada en ese horario. Elige otro horario.";
      el.modalAlert.hidden = false;
      return;
    }

    const nuevaReserva = {
      id: "R-" + Date.now(),
      espacioId: espacioSeleccionado.id,
      espacioNombre: espacioSeleccionado.nombre,
      edificio: espacioSeleccionado.edificio,
      fecha,
      hora,
      solicitante: el.rNombre.value.trim(),
      motivo: el.rMotivo.value.trim(),
      estado: "confirmada",
      creada: new Date().toISOString(),
    };

    reservas.unshift(nuevaReserva);
    guardarReservas();
    actualizarContadorReservas();
    renderEspacios();

    modalReservar.hide();
    mostrarToast(`Reserva confirmada: ${espacioSeleccionado.nombre}, ${formatearFecha(fecha)}.`, "success");
  });

  /* ------------------------------------------------------------------
     9. MIS RESERVAS
     ------------------------------------------------------------------ */
  function renderReservas() {
    el.reservationsList.innerHTML = "";
    const activas = reservas.filter((r) => r.estado === "confirmada");

    el.reservationsEmpty.hidden = activas.length !== 0;
    el.reservationsList.hidden = activas.length === 0;

    activas.forEach((r) => {
      const row = document.createElement("div");
      row.className = "reservation-row";
      row.innerHTML = `
        <div>
          <p class="reservation-room">${r.espacioNombre}
            <span class="reservation-status">Confirmada</span>
          </p>
          <div class="reservation-meta">
            <span>${r.edificio}</span>
            <span>${formatearFecha(r.fecha)}</span>
            <span>${r.hora}</span>
            <span>Reservado por ${r.solicitante}</span>
          </div>
        </div>
        <button type="button" class="btn-cancel-reserva" data-cancelar="${r.id}">Cancelar reserva</button>
      `;
      el.reservationsList.appendChild(row);
    });

    document.querySelectorAll("[data-cancelar]").forEach((btn) => {
      btn.addEventListener("click", () => cancelarReserva(btn.dataset.cancelar));
    });
  }

  function cancelarReserva(reservaId) {
    const reserva = reservas.find((r) => r.id === reservaId);
    if (!reserva) return;

    reservas = reservas.filter((r) => r.id !== reservaId);
    guardarReservas();
    actualizarContadorReservas();
    renderReservas();
    renderEspacios();
    mostrarToast(`Reserva cancelada: ${reserva.espacioNombre}, ${formatearFecha(reserva.fecha)}.`, "error");
  }

  function actualizarContadorReservas() {
    const activas = reservas.filter((r) => r.estado === "confirmada").length;
    el.reservasCount.textContent = activas;
    el.reservasCount.hidden = activas === 0;
  }

  /* ------------------------------------------------------------------
     10. INICIALIZACIÓN
     ------------------------------------------------------------------ */
  function init() {
    poblarFiltros();
    renderEspacios();
    actualizarContadorReservas();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
