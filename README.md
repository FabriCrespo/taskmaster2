# 🚀 TaskMaster: Gestor de Tareas con Tema "Back to the Future"

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 📝 Descripción

TaskMaster es una aplicación móvil moderna de gestión de tareas que combina funcionalidad práctica con un tema divertido inspirado en "Back to the Future". La aplicación permite a los usuarios organizar sus tareas diarias mientras disfrutan de elementos visuales y easter eggs relacionados con la película.

## ✨ Características Principales

- 📱 Interfaz de usuario intuitiva y responsive
- ✅ Creación, edición y eliminación de tareas
- 🕒 Organización temporal de tareas (pasado, presente, futuro)
- 🎨 Tema personalizado de "Back to the Future"
- 🎯 Sistema de easter eggs temáticos
- 👤 Perfil de usuario personalizado
- 📊 Línea temporal de tareas
- 🔒 Autenticación segura con Supabase
- 🌙 Modo oscuro/claro
- 🎵 Efectos de sonido temáticos

## 🛠️ Tecnologías Utilizadas

- **Frontend:**
  - React Native v0.76.6
  - Expo v52.0.33
  - TypeScript
  - React Navigation
  - Lucide Icons v0.475.0
  - Expo Router v4.0.17

- **Backend:**
  - Supabase v2.39.3
  - PostgreSQL (Base de datos)

- **Herramientas de Desarrollo:**
  - Expo CLI
  - TypeScript
  - ESLint
  - Prettier

## 📲 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/FabriCrespo/taskmaster.git
```

2. Instala las dependencias:
```bash
cd taskmaster
npm install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Añade tus credenciales de Supabase:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

4. Inicia la aplicación:
```bash
npx expo start
```

## 🎮 Uso

1. **Registro/Inicio de Sesión:**
   - Crea una cuenta nueva o inicia sesión con credenciales existentes
   - Autenticación segura a través de Supabase

2. **Gestión de Tareas:**
   - Crea nuevas tareas con título, descripción y fecha
   - Organiza tareas por categorías:
     - Personal
     - Trabajo
     - Estudio
     - Salud
     - Otro
   - Marca tareas como completadas
   - Visualiza el progreso en la línea temporal

3. **Características Temáticas:**
   - Descubre easter eggs relacionados con "Back to the Future"
   - Personaliza tu perfil con elementos temáticos
   - Explora la línea temporal de tareas estilo DeLorean

## 🗄️ Estructura de la Base de Datos

La aplicación utiliza Supabase con las siguientes tablas principales:

### Tabla Users
- `id`: UUID (Primary Key)
- `agent_name`: TEXT
- `email`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `push_token`: TEXT

### Tabla Tasks
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key)
- `title`: TEXT
- `description`: TEXT
- `task_type`: ENUM
- `status`: ENUM
- `due_date`: DATE
- `due_time`: TIME
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `completed_at`: TIMESTAMP

## 🤝 Contribución

Las contribuciones son bienvenidas. Para cambios importantes:

1. Haz fork del repositorio
2. Crea una nueva rama (`git checkout -b feature/AmazingFeature`)
3. Realiza tus cambios
4. Commit (`git commit -m 'Add: AmazingFeature'`)
5. Push a la rama (`git push origin feature/AmazingFeature`)
6. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## 👨‍💻 Autor

- **Fabricio Crespo** - [GitHub](https://github.com/FabriCrespo)

## 🙏 Agradecimientos

- Inspirado en la trilogía "Back to the Future"
- Iconos por Lucide React Native
- Comunidad de React Native y Expo
- Equipo de Supabase

---
⌨️ con ❤️ por [Fabricio Crespo](https://github.com/FabriCrespo) 🚀
