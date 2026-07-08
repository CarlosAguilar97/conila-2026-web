# Guía de Configuración: Formulario a Google Sheets + Drive + Email

Esta guía contiene los pasos necesarios para configurar el almacenamiento de registros y el envío de correos usando tu cuenta normal de Gmail.

---

## Paso 1: Preparar Google Sheets y Google Drive

1. Ve a [Google Sheets](https://sheets.google.com) y crea una nueva **Hoja de cálculo en blanco**.
2. Asígnale un nombre a tu hoja de cálculo, por ejemplo: `CONILA 2026 Registro`.
3. (Opcional) Puedes crear una carpeta en tu Google Drive llamada `CONILA 2026 Fotos` para las imágenes de perfil, aunque el script la creará automáticamente en tu unidad principal si no existe.

---

## Paso 2: Configurar Google Apps Script

1. Dentro de tu nueva hoja de cálculo de Google Sheets, ve al menú superior:
   - Haz clic en **Extensiones** > **Apps Script**.
2. Se abrirá el editor de código de Google Apps Script.
3. Si hay código por defecto (`function myFunction() { ... }`), bórralo por completo.
4. Abre el archivo [google_script.js](file:///f:/Claudia/google_script.js) de este proyecto, copia todo su contenido y pégalo en el editor de Apps Script.
5. Haz clic en el icono del **Disco (Guardar)** o presiona `Ctrl + S` para guardar el proyecto.

---

## Paso 3: Desplegar como Web App (Aplicación Web)

Para que el formulario web pueda comunicarse con Google Sheets, debemos publicar el script públicamente:

1. En la esquina superior derecha del editor de Apps Script, haz clic en el botón **Implementar** (Deploy) y selecciona **Nueva implementación** (New deployment).
2. Haz clic en el engranaje de configuración al lado de "Seleccionar tipo" y elige **Aplicación web** (Web app).
3. Configura los siguientes campos (¡Muy Importante!):
   - **Descripción**: `CONILA 2026 API`
   - **Ejecutar como** (Execute as): Selecciona **Tú (tu_correo@gmail.com)**.
   - **Quién tiene acceso** (Who has access): Selecciona **Cualquiera** (Anyone). *(Esto permite que el formulario de la web pueda enviar datos de forma anónima o externa).*
4. Haz clic en **Implementar**.
5. **Autorizar Acceso**:
   - Google te pedirá autorizar los permisos para que el script lea/escriba en tu Sheets, guarde archivos en tu Drive y envíe correos electrónicos desde tu cuenta de Gmail.
   - Haz clic en **Autorizar acceso**, elige tu cuenta de Google.
   - Si te aparece un aviso de *"Google no ha verificado esta aplicación"*, haz clic en **Configuración avanzada** (Advanced) abajo a la izquierda, y luego selecciona **Ir a Proyecto sin título (no seguro)** o **Go to Untitled Project (unsafe)**.
   - Finalmente, haz clic en **Permitir** (Allow).
6. Una vez completado, verás una ventana que dice "Implementación completada correctamente".
7. **Copiar URL de la App Web**: Copia la URL que aparece bajo el campo **URL de la aplicación web** (debe terminar en `/exec`).

---

## Paso 4: Vincular la URL en el Frontend (`app.js`)

1. Abre el archivo [app.js](file:///f:/Claudia/app.js) en tu editor.
2. Busca la línea:
   ```javascript
   const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbx_CAMBIAR_ESTO_POR_TU_URL/exec";
   ```
3. Reemplaza `"https://script.google.com/macros/s/AKfycbx_CAMBIAR_ESTO_POR_TU_URL/exec"` por la **URL que copiaste en el Paso 3**.
4. Guarda el archivo.

### Alternativa para Pruebas Rápidas sin Editar el Código:
Puedes abrir tu página en el navegador (`index.html`), abrir la consola web de desarrollador (presionando `F12`) y escribir el comando de prueba que configuramos en `app.js`:
```javascript
setScriptURL('TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI');
```
Esto guardará la URL localmente en tu navegador para realizar pruebas instantáneas.

---

## Paso 5: Cómo probar el flujo completo

1. Abre tu archivo `index.html` en cualquier navegador web.
2. Llena el formulario con un Nombre, un Correo válido y sube una foto de prueba.
3. Haz clic en **Registrarme ahora**.
4. El formulario mostrará un indicador de carga y luego el mensaje de **¡Registro Exitoso!**.
5. Revisa:
   - Tu hoja de **Google Sheets**: Verás que se ha creado la cabecera y una nueva fila con tus datos y el enlace.
   - Tu carpeta de **Google Drive**: Verás la imagen subida.
   - Tu bandeja de entrada del **Correo de prueba**: Habrás recibido un email responsivo y decorado confirmando el registro de prueba.
