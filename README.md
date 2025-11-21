# Portfolio Personal - Martín Giner

Portfolio personal profesional desarrollado con Astro y Tailwind CSS, con diseño dark mode limpio y moderno.

## 🚀 Características

- ✨ **Dark mode** profesional y elegante
- 🎯 **Navegación fija** responsive con enlaces a todas las páginas
- 🏠 **Página de inicio** con hero section destacado
- 👤 **Sobre mí** con habilidades técnicas organizadas
- 💼 **Proyectos** cargados dinámicamente desde Markdown
- 📝 **Detalle de proyectos** con routing por slug
- 📧 **Contacto** con información y formulario
- 🎨 **Animaciones suaves** en toda la interfaz
- 📱 **Diseño responsive** optimizado para todos los dispositivos
- 🔍 **SEO optimizado** con meta tags apropiados
- 🇪🇸 **Todo en español**

## 🛠️ Stack Tecnológico

- **[Astro](https://astro.build)** 4.15 - Framework estático moderno
- **[Tailwind CSS](https://tailwindcss.com)** 3.4 - Framework de estilos utility-first
- **TypeScript** - Tipado estático
- **Markdown** - Gestión de contenido de proyectos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── cv.pdf              # CV para descargar
│   └── favicon.svg         # Icono del sitio
├── src/
│   ├── content/
│   │   ├── config.ts       # Configuración de colecciones
│   │   └── projects/       # Proyectos en Markdown
│   ├── layouts/
│   │   └── Layout.astro    # Layout principal
│   ├── pages/
│   │   ├── index.astro     # Página de inicio
│   │   ├── sobre-mi.astro  # Página sobre mí
│   │   ├── contacto.astro  # Página de contacto
│   │   └── proyectos/
│   │       ├── index.astro # Listado de proyectos
│   │       └── [slug].astro # Detalle de proyecto
│   └── env.d.ts
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

## ✍️ Añadir Nuevos Proyectos

Para añadir un nuevo proyecto, crea un archivo Markdown en `src/content/projects/`:

```markdown
---
title: 'Título del Proyecto'
description: 'Breve descripción'
technologies: ['Angular', 'Spring Boot', 'PostgreSQL']
github: 'https://github.com/usuario/proyecto'
demo: 'https://demo.example.com'
order: 1
---

## Descripción

Contenido del proyecto en Markdown...
```

## 🎨 Personalización

### Colores

Los colores del tema dark se pueden personalizar en `tailwind.config.mjs`:

```js
theme: {
  extend: {
    colors: {
      dark: {
        bg: '#0a0a0a',
        surface: '#1a1a1a',
        border: '#2a2a2a',
      }
    }
  }
}
```

### Información Personal

Edita los archivos en `src/pages/` para actualizar:

- Nombre y descripción en `index.astro`
- Habilidades y experiencia en `sobre-mi.astro`
- Información de contacto en `contacto.astro`

## 📝 Licencia

Proyecto personal - © 2025 Martín Giner

## 🤝 Contribuciones

Este es un proyecto personal, pero sugerencias y mejoras son bienvenidas.
