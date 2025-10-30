# 🎬 Movie-Wave (Frontend)

**Movie-Wave** es una aplicación web desarrollada con **React + TypeScript + Vite**, que permite a los usuarios explorar, gestionar y guardar en favoritos su contenido audiovisual preferido.  
Este frontend se conecta con un **backend en Node.js/Express** y una base de datos **Supabase**, ofreciendo autenticación segura, gestión de usuarios y un sistema de favoritos.

---

## 🚀 Características principales

- 🔐 **Autenticación de usuarios** con Supabase (registro, login y logout).
- 🎞️ **Exploración de películas y series** con visualización de información detallada.
- ❤️ **Gestión de favoritos**: agregar o eliminar contenido de la lista personal.
- 👤 **Gestión de perfil de usuario** (edición de datos).
- ⚙️ **Protección de rutas** mediante componente `AuthGuard`.
- 📱 **Diseño responsive** y dinámico.
- ⚡ **Frontend optimizado con Vite y React Hooks**.

---

## 🧰 Tecnologías utilizadas

| Tipo | Tecnología |
|------|-------------|
| Framework | [React](https://react.dev/) |
| Lenguaje | TypeScript |
| Empaquetador | [Vite](https://vitejs.dev/) |
| Estilos | CSS / SASS |
| Backend API | Node.js + Express |
| Base de datos | [Supabase](https://supabase.com/) |
| Navegación | React Router DOM |
| Autenticación | Supabase Auth |
| Control de estado | React Hooks (`useState`, `useEffect`) |

---

## 📁 Estructura del proyecto

Movie-Wave-Frontend/
├── public/ # Archivos estáticos
├── src/
│ ├── assets/ # Imágenes y recursos multimedia
│ ├── components/ # Componentes reutilizables
│ ├── pages/ # Vistas principales (Login, Dashboard, Perfil, etc.)
│ ├── routes/ # Rutas protegidas y configuración de navegación
│ ├── styles/ # Archivos de estilos (CSS/SASS)
│ ├── supabaseClient.ts # Configuración de conexión a Supabase
│ ├── App.tsx # Componente raíz de la aplicación
│ ├── main.tsx # Punto de entrada principal
│ └── vite-env.d.ts # Tipado para Vite
└── package.json



---

## ⚙️ Instalación y configuración

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/Movie-Wave-Frontend.git
cd Movie-Wave-Frontend


 2️⃣ Instalar dependencias
npm install

 3️⃣ Configurar variables de entorno

Crea un archivo .env en la raíz del proyecto con tus credenciales de Supabase:

VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key

 4️⃣ Ejecutar el proyecto en modo desarrollo
npm run dev


La aplicación se ejecutará en:
👉 http://localhost:5173

🔗 Conexión con el Backend

El frontend se comunica con el backend (API Express) a través de peticiones HTTP a endpoints como:

GET /api/favorites/:userId → Obtiene los favoritos del usuario

POST /api/favorites → Agrega un nuevo favorito

DELETE /api/favorites → Elimina un favorito existente

GET /api/favorites/:userId/:contentId/check → Verifica si un contenido ya está en favoritos

Asegúrate de tener el backend corriendo antes de iniciar el frontend:

npm run dev   # en el directorio backend

🧑‍💻 Componente clave: AuthGuard

El componente AuthGuard.tsx protege las rutas privadas de la aplicación, verificando la sesión activa del usuario mediante Supabase.
Si no hay sesión, redirige automáticamente al login.

🎨 Estilos y diseño

El proyecto utiliza SASS para una mejor modularización y personalización de estilos.
Cada vista (Login, Dashboard, Productos, Perfil, etc.) tiene su propio archivo de estilos.

🧠 Scripts disponibles
Script	Descripción
npm run dev	Inicia el servidor de desarrollo con Vite
npm run build	Compila el proyecto para producción
npm run preview	Previsualiza la versión de producción
npm run lint	Ejecuta el linter para verificar el código
🧾 Licencia

Este proyecto fue desarrollado como parte del Proyecto Integrador del 7° semestre de Ingeniería de Sistemas (Univalle).
Puedes usarlo y modificarlo libremente con fines educativos o personales.

💬 Autores

👨‍💻 Gean Franco Muñoz Toro
👨‍💻 Joshua Arciniegas
Proyecto académico — Universidad del Valle
📧 Contacto: (puedes agregar tu correo si quieres)

⭐ Contribuciones

Las contribuciones son bienvenidas.
Si deseas colaborar, crea un fork del proyecto y abre un pull request con tus mejoras.