/**
 * CONILA 2026 - Conector Google Apps Script
 * 
 * Versión con soporte para registros de Independientes y Empresas.
 * Incluye cabecera con el logotipo dinámico del congreso.
 */

const FOLDER_NAME = "CONILA 2026 Fotos";
const SPREADSHEET_NAME = "CONILA 2026 Registro";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return buildResponse("error", "No se recibieron datos.");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    if (!data.tipoRegistro || !data.email || !data.telefono) {
      return buildResponse("error", "Faltan campos obligatorios comunes (tipo de registro, email, teléfono).");
    }
    
    if (data.tipoRegistro === "independiente") {
      if (!data.nombreCompleto || !data.tipoDocumento || !data.nroDocumento || !data.cargoProfesion || !data.metodoPago || !data.foto) {
        return buildResponse("error", "Faltan campos obligatorios para registro independiente.");
      }
    } else if (data.tipoRegistro === "empresa") {
      if (!data.ruc || !data.nombreEmpresa || !data.direccion) {
        return buildResponse("error", "Faltan campos obligatorios para registro de empresa.");
      }
      var rucRegex = /^\d{11}$/;
      if (!rucRegex.test(data.ruc.toString().trim())) {
        return buildResponse("error", "El RUC de la empresa debe tener exactamente 11 dígitos.");
      }
    } else {
      return buildResponse("error", "Tipo de registro no válido.");
    }
    
    var voucherUrl = "N/A";
    var fileId = "N/A";
    
    // 1. Guardar voucher en Google Drive (solo si se envió foto/voucher)
    if (data.foto && data.fotoNombre) {
      var folder = getOrCreateFolder(FOLDER_NAME);
      var contentType = getMimeType(data.fotoNombre);
      var imageBytes = Utilities.base64Decode(data.foto);
      var blob = Utilities.newBlob(imageBytes, contentType, data.fotoNombre);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      voucherUrl = file.getUrl();
      fileId = file.getId();
    }
    
    // 2. Conectar a Google Sheets
    var sheet = getOrCreateSheet(SPREADSHEET_NAME);
    
    // Inicializar cabeceras
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Marca Temporal", 
        "Tipo de Registro", 
        "Nombre / Razón Social", 
        "Tipo Documento",
        "Nro Documento / RUC", 
        "Teléfono", 
        "Correo Electrónico", 
        "Cargo / Profesión", 
        "Dirección Empresa", 
        "Método de Pago", 
        "Enlace Voucher (Drive)", 
        "ID Archivo"
      ]);
      
      sheet.getRange(1, 1, 1, 12)
           .setFontWeight("bold")
           .setBackground("#003923")
           .setFontColor("#ffffff")
           .setHorizontalAlignment("center");
    }
    
    // 3. Organizar datos según el tipo de registro
    var timestamp = new Date();
    var tipo = data.tipoRegistro; // "independiente" o "empresa"
    
    var nombreMostrar = "";
    var tipoDoc = "";
    var numDoc = "";
    var cargoProf = "";
    var direccion = "";
    var metodoPago = "N/A";
    
    if (tipo === "independiente") {
      nombreMostrar = data.nombreCompleto;
      tipoDoc = data.tipoDocumento;
      numDoc = data.nroDocumento;
      cargoProf = data.cargoProfesion;
      metodoPago = data.metodoPago || "N/A";
    } else {
      nombreMostrar = data.nombreEmpresa;
      tipoDoc = "RUC";
      numDoc = data.ruc;
      direccion = data.direccion;
    }
    
    // Guardar fila
    sheet.appendRow([
      timestamp,
      tipo.toUpperCase(),
      nombreMostrar,
      tipoDoc,
      numDoc,
      data.telefono,
      data.email,
      cargoProf,
      direccion,
      metodoPago,
      voucherUrl,
      fileId
    ]);
    
    // 4. Enviar correo de confirmación
    var logoUrl = data.logoUrl || "https://www.conila2026.pe/img/logo.png";
    sendConfirmationEmail(tipo, nombreMostrar, data.email, voucherUrl, metodoPago, logoUrl);
    
    return buildResponse("success", "Registro exitoso", { imageUrl: voucherUrl });
    
  } catch (error) {
    Logger.log("Error en doPost: " + error.toString());
    return buildResponse("error", "Error interno: " + error.toString());
  }
}

function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateSheet(sheetName) {
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    var files = DriveApp.getFilesByName(sheetName);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(sheetName);
    }
  }
  return ss.getActiveSheet();
}

function getMimeType(filename) {
  var extension = filename.split('.').pop().toLowerCase();
  switch(extension) {
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'jpeg':
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

function sendConfirmationEmail(tipo, nombre, email, voucherUrl, metodoPago, logoUrl) {
  var subject = "Confirmación de Registro | CONILA 2026";
  var tituloSaludo = tipo === "empresa" ? "Estimados representantes de " + nombre : "¡Hola " + nombre + "!";
  var comprobanteInfoHtml = "";
  
  if (tipo === "independiente") {
    comprobanteInfoHtml = `
      <p style="font-size: 16px; line-height: 1.6; color: #445950;">
        El comprobante de pago fue recibido exitosamente en nuestra base de datos. Nuestro equipo procederá con la validación de la inscripción.
      </p>
    `;
  } else {
    comprobanteInfoHtml = `
      <p style="font-size: 16px; line-height: 1.6; color: #445950;">
        Hemos registrado los datos de su empresa correctamente en nuestra base de datos para el proceso de facturación y coordinación de participantes.
      </p>
    `;
  }
  
  var htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #d1dfd7; border-radius: 12px; overflow: hidden; background-color: #ffffff; color: #0d2119;">
      <!-- Header with Logo -->
      <div style="background-color: #003923; padding: 25px; text-align: center; color: #ffffff;">
        <img src="${logoUrl}" alt="CONILA 2026 Logo" style="height: 55px; width: auto; margin-bottom: 10px; display: inline-block; vertical-align: middle;" />
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">CONILA 2026</h1>
        <p style="margin: 3px 0 0 0; opacity: 0.9; font-size: 13px;">XVIII Congreso Internacional de Lingüística Aplicada</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="margin-top: 0; color: #003923; font-size: 20px;">${tituloSaludo},</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #445950;">
          Hemos recibido los datos de su registro para el <strong>CONILA 2026</strong>. 
        </p>
        ${comprobanteInfoHtml}
        
        <!-- Info Card -->
        <div style="background-color: #f1f6f3; border: 1px solid #d1dfd7; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="margin-top: 0; margin-bottom: 15px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #07894A; text-align: center;">Resumen de Inscripción</h3>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Tipo de Registro:</strong> ${tipo.toUpperCase()}</p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Nombre/Razón Social:</strong> ${nombre}</p>
          <p style="margin: 5px 0; font-size: 15px;"><strong>Contacto:</strong> ${email}</p>
          ${tipo === "independiente" ? `<p style="margin: 5px 0; font-size: 15px;"><strong>Método de Pago:</strong> ${metodoPago.toUpperCase()}</p>` : ''}
          ${tipo === "independiente" && voucherUrl !== "N/A" ? `
          <div style="margin-top: 15px; text-align: center;">
            <a href="${voucherUrl}" target="_blank" style="background-color: #07894A; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">Ver Comprobante Adjunto</a>
          </div>` : ''}
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #62A84F; text-align: center; margin-top: 30px;">
          Este es un correo automático generado por el sistema de registro de CORLAD Tacna.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #003923; padding: 20px; text-align: center; color: #ffffff; font-size: 12px;">
        <p style="margin: 0;">&copy; 2026 CORLAD Tacna. Todos los derechos reservados.</p>
        <p style="margin: 5px 0 0 0; color: #E1B21E; font-weight: 600;">www.conila2026.pe</p>
      </div>
    </div>
  `;
  
  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody
  });
}

function buildResponse(status, message, data) {
  var output = { status: status, message: message };
  if (data) output.data = data;
  
  return ContentService.createTextOutput(JSON.stringify(output))
                       .setMimeType(ContentService.MimeType.JSON);
}
