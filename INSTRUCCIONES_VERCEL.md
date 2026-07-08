# Guía de Despliegue en Vercel (Alta Disponibilidad Gratuita)

Vercel te permite publicar tu página web de forma gratuita, con alta disponibilidad (CDN global ultrarrápida), certificado SSL automático (HTTPS) y la opción de conectar tu propio dominio `www.conila2026.pe`.

Aquí tienes las dos formas más sencillas de desplegar este proyecto:

---

## Opción A: Despliegue Directo (Arrastrar y Soltar) - Sin Programación ni Git

Esta es la forma más rápida y recomendada si no deseas usar Git:

1. Entra a [Vercel](https://vercel.com/) y regístrate con tu correo o cuenta de Google / GitHub.
2. Ve a tu panel de control de Vercel (Dashboard).
3. Entra a la herramienta oficial de importación rápida: **[vercel.com/new](https://vercel.com/new)**.
4. Baja hasta la sección **"Deploy a new project"** y busca el recuadro que dice **"Drag and drop a folder here to deploy your static site"**.
5. Abre el explorador de archivos de tu computadora y arrastra la carpeta completa de este proyecto (`f:\\Claudia`) a ese recuadro.
6. Vercel detectará que es un sitio estático HTML/CSS/JS y se desplegará en unos segundos.
7. Te dará una URL gratuita y segura similar a `claudia-project.vercel.app` para que la pruebes inmediatamente.

---

## Opción B: Integración con GitHub (Para Actualizaciones Automáticas)

Si quieres subir tu código a GitHub para que cada cambio que hagas se publique automáticamente:

1. Sube tu código a un repositorio privado o público en tu cuenta de [GitHub](https://github.com).
2. Ve a [vercel.com/new](https://vercel.com/new).
3. Conecta tu cuenta de GitHub a Vercel.
4. Selecciona tu repositorio del proyecto y haz clic en **Import**.
5. Deja la configuración por defecto y haz clic en **Deploy**.
6. ¡Listo! Cada vez que hagas un `git push` a tu repositorio, Vercel actualizará la página web automáticamente en menos de 10 segundos sin caídas de servicio.

---

## Paso Final: Configurar tu propio dominio `www.conila2026.pe`

Una vez que adquieras el dominio en un registrador (como punto.pe, GoDaddy, etc.):

1. Entra al panel de tu proyecto en **Vercel**.
2. Ve a la pestaña **Settings** (Configuración) > **Domains** (Dominios).
3. En el campo de texto escribe tu dominio: `www.conila2026.pe` y haz clic en **Add** (Añadir).
4. Vercel te mostrará los registros DNS necesarios. Usualmente:
   - Un registro **CNAME** para `www` apuntando a `cname.vercel-dns.com`.
   - Un registro **A** para el dominio principal apuntando a la IP de Vercel.
5. Copia esos valores y agrégalos en el panel de control de tu proveedor de dominio.
6. Una vez que las DNS se propaguen (usualmente toma de 15 minutos a unas pocas horas), tu web estará activa de forma segura y con alta disponibilidad global bajo `www.conila2026.pe`.
