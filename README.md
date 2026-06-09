# ⚡ e-Go: Mobilitat Elèctrica Intel·ligent i Incidències

![e-Go Banner](https://img.shields.io/badge/e--Go-Sostenibilidad-brightgreen)
![React Native](https://img.shields.io/badge/React_Native-Expo-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-success)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Coverage](https://img.shields.io/badge/Coverage->80%25-brightgreen)

**e-Go** es una plataforma integral diseñada para la gestión de movilidad urbana sostenible y el reporte de incidencias. Permite a los conductores de vehículos eléctricos planificar sus rutas de forma inteligente, localizar puntos de recarga en tiempo real y participar en una comunidad activa mediante dinámicas de gamificación.

---

## ✨ Características y Funcionalidades Principales

* 🗺️ **Mapa Interactivo en Tiempo Real:** Visualización y filtrado de más de 2.300 puntos de recarga activos en Cataluña, integrados directamente con el dataset de *Dades Obertes* (ICAEN).
* 🚗 **Rutas Inteligentes y Autonomía:** Planificación de trayectos con cálculo dinámico basado en la autonomía restante del vehículo. Desvía la ruta automáticamente hacia un cargador compatible si es necesario.
* 🛠️ **Gestión de Incidencias:** Sistema comunitario para reportar averías, vandalismo o mal funcionamiento en las estaciones de carga, manteniendo la información actualizada para todos los usuarios.
* 🎮 **Gamificación y Ránking:** Mecánica de recompensas donde los usuarios acumulan puntos al realizar cargas o validar incidencias. Los puntos permiten desbloquear skins (cosméticos) para el vehículo virtual y competir en un ránking global.
* 💳 **Suscripción Premium:** Modelo freemium integrado con anuncios (AdMob) y una opción de suscripción de pago (vía Stripe) para eliminar la publicidad y obtener ventajas exclusivas.
* 🌍 **Multiidioma (i18n):** Interfaz completamente localizada en Catalán, Español, Inglés e Italiano.
* 🎫 **Integración Cultural (API Aplec):** Conexión con eventos culturales locales para sugerir actividades cercanas al usuario mientras espera que su vehículo se cargue.

### 👥 Roles del Ecosistema
1. **Conductor:** Búsqueda de rutas eficientes, carga, reporte de incidencias y participación en el sistema de puntuación.
2. **Empresa:** Gestión de sus propias estaciones, monitorización de incidencias reportadas en su infraestructura y visualización de analíticas de demanda.
3. **Administrador:** Moderación global de la plataforma, validación de incidencias críticas, control de usuarios y mantenimiento del catálogo de estaciones.

---

## 🏗️ Arquitectura del Proyecto

El repositorio está dividido en dos microservicios principales que separan el Frontend móvil nativo de un Backend robusto y desacoplado:

### 📱 Frontend (`/frontend`)
* **Framework:** React Native con [Expo](https://expo.dev/) (TypeScript).
* **Navegación:** Estructura basada en directorios mediante Expo Router (Tabs & Stack).
* **Gestión de Estado:** `AuthContext` para el ciclo de vida del usuario y persistencia de sesión.
* **Vistas Clave:**
    * `(tabs)/index.tsx`: Pantalla principal dinámica (Bienvenida adaptativa vs. Dashboard de usuario).
    * `login.tsx`: Flujo de autenticación nativa con Google.
    * `explore.tsx`: Exploración avanzada de servicios, rutas y estaciones sobre mapas.

### ⚙️ Backend (`/backend`)
* **Entorno:** Node.js + Express (JavaScript/JSX).
* **Base de Datos:** PostgreSQL (Relacional) estructurado para entornos Cloud (AWS RDS).
* **Autenticación y Seguridad:** Validación de Google OAuth 2.0 y uso de JSON Web Tokens (JWT) para control de acceso basado en roles.
* **Estructura Interna:**
    * `routes/`: Endpoints modulares y desacoplados (auth, stations, cars, etc.).
    * `lib/`: Configuración centralizada de la base de datos (`db.js`) y utilidades auxiliares.

---

## 🗄️ Gestión de Base de Datos (SQL)

La base de datos se inicializa y actualiza mediante scripts secuenciales numerados que se encuentran en la carpeta `backend/sql/`. Deben ejecutarse en orden estricto para generar correctamente las tablas, relaciones y datos semilla (seeders):

1. `001_create_users.sql`: Estructura de la tabla de usuarios y esquemas base.
2. `002_create_admins.sql`: Estructura y privilegios de la tabla de administradores.
3. `003_create_stations.sql`: Definición geométrica y lógica de estaciones de carga y servicios.
4. `...` *(Siguientes scripts automatizados para el despliegue continuo en la infraestructura de AWS en producción).*

---

## 🚀 Guía de Instalación y Configuración Local

### 1. Requisitos Previos
* **Node.js** (v18 o superior).
* **PostgreSQL** instalado y ejecutándose localmente.
* Credenciales configuradas en **Google Cloud Console**.
* **Android Studio** instalado con la siguiente configuración en el *SDK Manager*:
    * *SDK Platforms:* Android 14.0 ("UpsideDownCake").
    * *SDK Tools:* Android SDK Build-Tools, NDK (Side by side), Android SDK Command-line Tools (latest), CMake y Android Emulator.

### 2. Configuración de Variables de Entorno de Sistema
#### 2.1 Configuración de las Variables de Entorno (Linux): (.bashrc  o .zshrc)
nano ~/.bashrc     
Añadir el bloque de Android: (copiar todo y pegar al final) :
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools

Aplicar los cambios: (.bashrc  o .zshrc)
source ~/.bashrc

#### 2.1 Configuración de las Variables de Entorno (Windows):
Buscar en Windows: "Editar las variables de entorno del sistema".
Botón "Variables de entorno".
En "Variables de usuario" darle a Nueva:
Nombre: ANDROID_HOME
Valor: %LOCALAPPDATA%\Android\Sdk
En "Variables del sistema" buscar "Path", darle a Editar y añadir estas 3 rutas:
%LOCALAPPDATA%\Android\Sdk\platform-tools
%LOCALAPPDATA%\Android\Sdk\emulator
%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin

#### Actualizar .env en base al archivo compartido 

### 3. Configuración del Backend
```bash
cd backend
```
```bash
npm install
```
```bash
npx nodemon index.jsx
```

### 4. Configuración del Frontend (puede tardar la primera vez)
```bash
cd frontend
```
```bash
npm install
```
```bash
npx expo run:android 
```

---
## 🧪 Calidad y Testing
El repositorio cuenta con flujos automatizados de CI/CD (GitHub Actions) y monitorización mediante SonarCloud (manteniendo un estado de Quality Gate A y 0 Bugs). Aseguramos de manera estricta una cobertura de código superior al 80%.

* **Frontend:** Pruebas unitarias y de extremo a extremo (E2E) mediante Vitest, Jest y React Testing Library.
* **Backend:** Pruebas unitarias y de integración robustas con Jest y Supertest.

### 🔌 Ejecutar Tests de Integración (Backend)
Las pruebas de integración interactúan con una instancia real de PostgreSQL. Para evitar la mutación accidental de datos en entornos locales de desarrollo o producción, estas pruebas requieren una confirmación explícita.

PowerShell:

```powershell
cd backend
$env:RUN_DB_INTEGRATION="true"
npm run test:integration
```