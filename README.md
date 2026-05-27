# 💻 DocuCloud - Frontend (Angular)

¡Bienvenido al frontend de **DocuCloud**! Esta es una aplicación web moderna, intuitiva y reactiva desarrollada con **Angular 21**, diseñada para brindar a las organizaciones una interfaz fluida para la administración documental, la supervisión de flujos de trabajo en tiempo real y el control de accesos basados en roles.

---

## 🎨 Características de la Interfaz

La aplicación frontend de DocuCloud destaca por las siguientes características de diseño y experiencia de usuario (UX):

*   **Diseño Premium e Intuitivo**: Interfaz limpia, moderna y con micro-animaciones fluidas para una navegación interactiva y agradable.
*   **Gestión Basada en Roles**: Vistas adaptativas según el rol del usuario (Admin de Organización, Revisor, Aprobador, Empleado).
*   **Gestión de Documentos**: Creación con subida de archivos adjuntos, visualización detallada, historial de cambios de estado y borrado directo para creadores/administradores con eliminación en cascada en el servidor.
*   **Flujos de Trabajo Interactivos**: Monitoreo dinámico del progreso de los documentos a través de los pasos definidos (Creación, Revisión, Aprobación).
*   **Notificaciones en Tiempo Real**: Panel de notificaciones dinámico con indicador visual (punto rojo reactivo en la campana de navegación superior) para nuevas tareas asignadas.
*   **Administración de Personal**: Panel de gestión de usuarios que permite cambiar roles mediante selectores instantáneos y ver las actualizaciones en la tabla de forma automática sin recargar el navegador.

---

## 🚀 Tecnologías y Arquitectura

El desarrollo de este frontend sigue los estándares y características modernas de la comunidad de Angular:

*   **Framework Principal**: Angular 21.2.8
*   **Estrategia de Reactividad**: Angular Signals & RxJS
*   **Componentes**: Arquitectura moderna de Componentes Standalone (sin módulos redundantes).
*   **Enrutador**: Angular Router dinámico con Guards de autenticación.
*   **Estilos**: CSS modular y optimizado con diseño responsivo.
*   **Pruebas Unitarias**: Suite configurada y ejecutada bajo **Vitest** (reemplazo ultrarrápido de Karma/Jasmine).

---

## 🛠️ Requisitos Previos

Asegúrate de contar con las siguientes herramientas en tu entorno de desarrollo:

1.  **Node.js**: Versión `18.x`, `20.x` o superior.
    *   *Verifica tu instalación*: `node -v`
2.  **npm**: Gestor de paquetes de Node (incluido por defecto con Node.js).
    *   *Verifica tu versión*: `npm -v`
3.  **Angular CLI** (Opcional, pero recomendado globalmente):
    ```bash
    npm install -g @angular/cli
    ```

---

## 📦 Instalación y Configuración Paso a Paso

### 1. Descargar Dependencias
Navega hasta la raíz de la carpeta del frontend (`frontend-prueba/`) y ejecuta el comando para instalar todas las dependencias requeridas del proyecto:

```bash
npm install
```

### 2. Configurar la URL de la API del Backend
La aplicación frontend se comunica con el API REST de DocuCloud mediante configuraciones centralizadas. Puedes verificar o modificar la URL del backend en el archivo de entorno en:
*   [src/environments/environment.ts](file:///c:/Users/JUAN%20DAVID/OneDrive/Desktop/frontend/frontend-prueba/src/environments/environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/docucloud/api/v1',
  defaultOrganizacionNit: 900123456
};
```

> [!IMPORTANT]  
> Asegúrate de que la dirección IP, puerto (`8080`) y el context path (`/docucloud`) coincidan exactamente con la dirección donde se ejecuta tu Backend.

---

## 🏃 Cómo Iniciar la Aplicación

Para levantar el servidor local de desarrollo de Angular en tu máquina, ejecuta:

```bash
npm run dev
```
o de forma alternativa:
```bash
ng serve
```

Una vez completada la compilación, el servidor estará escuchando en el puerto predeterminado:
*   👉 **[http://localhost:4200/](http://localhost:4200/)**

Abre esta URL en tu navegador. La aplicación cuenta con Hot Reload, por lo que cualquier modificación que realices en el código fuente se reflejará al instante en pantalla sin necesidad de refrescar manualmente.

---

## 👥 Credenciales de Prueba Rápidas
Puedes iniciar sesión inmediatamente en la interfaz utilizando las cuentas creadas de forma automática por el backend durante el inicio (Seed Data):

*   **Administrador de Organización** (Acceso completo a Usuarios, Documentos y Flujos):
    *   **Email**: `admin@docucloud.local`
    *   **Contraseña**: `Admin12345`
*   **Revisor de Documentos** (Acceso a bandeja de revisión de tareas y notificaciones):
    *   **Email**: `carlos@docucloud.local`
    *   **Contraseña**: `Carlos123`
*   **Aprobador de Documentos** (Acceso a bandeja de aprobación de tareas):
    *   **Email**: `laura@docucloud.local`
    *   **Contraseña**: `Laura123`
*   **Empleado / Creador** (Acceso a creación, edición e historial de sus documentos):
    *   **Email**: `andres@docucloud.local`
    *   **Contraseña**: `Andres123`

---

## 🧪 Ejecutar Pruebas Unitarias
El proyecto utiliza **Vitest** como motor de pruebas de alta velocidad para verificar la calidad de los componentes y servicios de Angular. Para correr las pruebas, ejecuta:

```bash
npm run test
```

Este comando mantendrá las pruebas en modo interactivo/observador (watch mode). Si deseas realizar una ejecución rápida única:

```bash
npx vitest run
```

---

## 💡 Resolución de Problemas Comunes (FAQ)

### ❌ Las peticiones fallan con error de red en consola
*   **Causa**: El servidor Backend no está corriendo o está usando una dirección diferente.
*   **Solución**: Verifica que el backend esté activo en `http://localhost:8080/docucloud`. Abre Swagger UI en tu navegador para corroborar que responde adecuadamente.

### ❌ Pantalla en blanco tras iniciar el servidor
*   **Causa**: Posibles errores de compilación previos o incompatibilidades con versiones antiguas de Node.js.
*   **Solución**: Revisa la consola donde ejecutaste `ng serve` para identificar fallos de sintaxis. Borra la carpeta caché `.angular/` y reinstala dependencias ejecutando `rm -rf node_modules package-lock.json && npm install`.

### ❌ Los cambios de rol de usuarios no se visualizan de inmediato en la tabla
*   **Causa**: Versiones previas no forzaban la recarga del listado tras la edición.
*   **Solución**: La vista de [usuarios-page.ts](file:///c:/Users/JUAN%20DAVID/OneDrive/Desktop/frontend/frontend-prueba/src/app/pages/usuarios/usuarios-page.ts) ha sido actualizada para refrescar automáticamente la tabla tras guardar un cambio de rol de manera exitosa.
