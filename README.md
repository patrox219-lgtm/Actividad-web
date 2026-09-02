# EspaciosUC — Sistema de reservas de espacios universitarios

Aplicación frontend que permite consultar la disponibilidad de salas, laboratorios, salas de estudio y salas de reunión de una universidad, y gestionar solicitudes de reserva. Proyecto desarrollado para la actividad evaluada **"Desarrollo de Interfaz Frontend"**.

## Integrantes

- Nombre estudiante 1
- Nombre estudiante 2
- Nombre estudiante 3

## Problemática

Una universidad cuenta con distintos tipos de espacios (salas de clases, laboratorios, salas de estudio y salas de reunión) utilizados por estudiantes, docentes y organizaciones estudiantiles. La disponibilidad de estos espacios es difícil de consultar y no existe una interfaz centralizada para solicitarlos. Esta aplicación resuelve ese problema permitiendo consultar espacios disponibles, filtrarlos y solicitar o cancelar reservas desde una interfaz web.

## Tecnologías utilizadas

- **HTML5** semántico
- **CSS3** propio (sin frameworks de diseño adicionales)
- **Bootstrap 5** (grid, modal, formularios)
- **JavaScript** (ES6+, manipulación del DOM, `localStorage`)
- **Git**, **GitHub** y **Git Flow** para el control de versiones

## Funcionalidades

- Listado de espacios disponibles con nombre, ubicación, capacidad y características.
- Búsqueda por texto y filtros por edificio, tipo de espacio, capacidad mínima y fecha.
- Formulario de solicitud de reserva con validación (fecha, horario, nombre, motivo).
- Prevención de reservas duplicadas para un mismo espacio, fecha y horario.
- Vista **"Mis reservas"** con listado de solicitudes y opción de cancelar.
- Mensajes visuales (toasts) para confirmar acciones o informar errores.
- Diseño responsive: computador, tablet y teléfono.
- Datos de espacios y reservas simulados mediante JavaScript (arrays/objetos) y persistidos en `localStorage` del navegador — no requiere backend ni base de datos.

## Estructura del proyecto

```
proyecto/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── assets/
│   └── ...
└── README.md
```

## Cómo ejecutar el proyecto

No requiere instalación ni servidor. Basta con abrir `index.html` en el navegador, o usar una extensión tipo "Live Server" en VS Code para recargar automáticamente durante el desarrollo.

## Flujo de trabajo Git / Git Flow sugerido

```bash
# Clonar el repositorio
git clone https://github.com/usuario/espacios-uc.git
cd espacios-uc

# Ramas principales
git checkout -b develop
git checkout -b feature/listado-espacios develop
# ... trabajar y hacer commits descriptivos ...
git push -u origin feature/listado-espacios
# abrir Pull Request hacia develop desde GitHub
```

Ramas utilizadas:

- `main`: versión estable del proyecto.
- `develop`: integración de funcionalidades.
- `feature/*`: una rama por funcionalidad (ej. `feature/filtros`, `feature/formulario-reserva`, `feature/mis-reservas`).

Cada funcionalidad se integra a `develop` mediante Pull Request, y `develop` se integra a `main` una vez estabilizada la entrega.

## Notas de diseño

La interfaz se organiza como un directorio de espacios (listado tipo ficha/registro) en lugar de tarjetas genéricas, para evocar un catálogo o guía de campus. La tipografía combina una serif editorial (`Source Serif 4`) para títulos y nombres de espacios con una sans-serif (`Inter`) para la interfaz, sobre una paleta cálida de papel con acentos en tono bronce, salvia (disponible) y terracota (alta demanda / cancelar).
