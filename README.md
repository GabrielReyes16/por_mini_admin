<<<<<<< HEAD

# Penguins on Road Mini - Admin Panel

**Penguins on Road Mini** es una aplicación diseñada para ayudar a mi novia a visualizar rutas de transporte público en su dispositivo móvil. Este panel de administración permite agregar, editar y eliminar rutas de transporte con información detallada, como puntos de inicio y destino, paraderos de subida y bajada, el bus que tenga la ruta adecuada, y otros detalles clave como el precio y el tiempo de viaje. 

Este admin se utiliza para ingresar la información que será vista en la app móvil construida con **React Native**. Las rutas y paraderos utilizan coordenadas (X, Y) para facilitar la localización precisa de cada punto. Es un proyecto con enfoque cerrado, pero que puede facilmente cambiar a algo más escalable (que no sea todo tan manual, quizas eintroducir mapas para tomas las coordenadas más rápido), pero lo hago para ayudar a mi novia y para practicar React c:

## Descripción del Proyecto

### Funcionalidad
Debes crear manualmente los buses, las subidas, bajadas y los inicios  y destinos. Con todo esto creado, puedes crear una **ruta**

- **Rutas**: Permite gestionar las rutas de transporte público, especificando los detalles como:
  - **Punto de inicio**
  - **Punto de destino**
  - **Paradero de subida**
  - **Paradero de bajada**
  - **Bus a tomar**
  - **Precio**
  - **Tiempo estimado de viaje**
  - **Comentarios adicionales**
  
- **Coordenadas X, Y**: Para cada punto (inicio, subida, bajada, destino), se gestionan las coordenadas X e Y que representan la ubicación exacta en el mapa.

### Estructura

Este admin está diseñado para ser sencillo y accesible, permitiendo a los usuarios ingresar información sin complicaciones. Está dividido en dos secciones principales:

1. **Formulario de Edición/Creación de Rutas**: Para agregar nuevas rutas o editar las existentes. Aquí se seleccionan buses, paraderos, destinos e inicios mediante un formulario con listas desplegables cargadas desde la base de datos.
  
2. **Listado de Rutas Registradas**: Muestra las rutas que ya han sido agregadas, con opciones para editar o eliminar cada ruta.

### Tecnologías Utilizadas

- **React**: Biblioteca de JavaScript para construir la interfaz de usuario.
- **Vite**: Herramienta de construcción rápida y optimizada para el desarrollo de aplicaciones en React.
- **Supabase**: Base de datos y almacenamiento en la nube para gestionar la información de rutas y otras entidades.
- **Bootstrap**: Framework CSS para un diseño responsivo y accesible.

### Setup

1. Clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd por_mini
   ```

2. Instala las dependencias:
=======
# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

>>>>>>> 86dc115862ac4d69f1f87ee7adac693ee52a7fba
   ```bash
   npm install
   ```

<<<<<<< HEAD
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Accede al localhost

5. Configura las variables de entorno para Supabase:
   ```js
   // src/supabase/client.js
   import { createClient } from '@supabase/supabase-js'

   const supabaseUrl = 'TU_SUPABASE_URL'
   const supabaseKey = 'TU_SUPABASE_KEY'

   export const supabase = createClient(supabaseUrl, supabaseKey)
   ```

### Contribuciones

Por ahora no está abierto a contribuciones, pero si cambio de perspectiva se los haré saber c:

=======
2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
>>>>>>> 86dc115862ac4d69f1f87ee7adac693ee52a7fba
