// CONILA 2026 - Frontend Logic & Form Integration

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Config: Reemplazar este enlace con la URL del Google Apps Script Web App cuando se despliegue.
    const DEFAULT_GAS_URL = "https://script.google.com/macros/s/AKfycbyWGcyONiGAnOVaHgf1TT0In77jec114donehzv4GAk5riGJNqeKHjOrqOsmcnVg28/exec";
    let scriptURL = localStorage.getItem('conila_gas_url') || DEFAULT_GAS_URL;

    // DOM Elements for form
    const form = document.getElementById('registerForm');
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const uploadContent = document.getElementById('uploadContent');
    const previewContent = document.getElementById('previewContent');
    const imgPreview = document.getElementById('imgPreview');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    
    // Switch elements (Participante vs Empresa)
    const radioIndependiente = document.querySelector('input[value="independiente"]');
    const radioEmpresa = document.querySelector('input[value="empresa"]');
    const independienteFields = document.getElementById('independienteFields');
    const empresaFields = document.getElementById('empresaFields');
    
    // Overlay elements
    const formOverlay = document.getElementById('formOverlay');
    const overlayLoader = document.getElementById('overlayLoader');
    const overlaySuccess = document.getElementById('overlaySuccess');
    const overlayError = document.getElementById('overlayError');
    const errorMessage = document.getElementById('errorMessage');
    
    // Buttons in overlay
    const btnReset = document.getElementById('btnReset');
    const btnRetry = document.getElementById('btnRetry');

    let base64Image = "";
    let base64ImageName = "";

    // 1. Program Agenda Tab Switching Logic (SIM Reference)
    const tabButtons = document.querySelectorAll('#agendaTabs .program-tab');
    const dayPanels = {
        'day1': document.getElementById('day1Panel'),
        'day2': document.getElementById('day2Panel'),
        'day3': document.getElementById('day3Panel')
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            Object.values(dayPanels).forEach(panel => {
                if (panel) panel.classList.add('hidden');
            });

            btn.classList.add('active');
            const targetDay = btn.getAttribute('data-day');
            if (dayPanels[targetDay]) {
                dayPanels[targetDay].classList.remove('hidden');
            }
        });
    });

    // 2. Switch Form Type (Independiente vs Empresa)
    function toggleFormType() {
        if (radioIndependiente.checked) {
            independienteFields.classList.remove('hidden');
            empresaFields.classList.add('hidden');
        } else if (radioEmpresa.checked) {
            empresaFields.classList.remove('hidden');
            independienteFields.classList.add('hidden');
        }
        // Limpiar errores visuales al cambiar
        document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));
    }

    [radioIndependiente, radioEmpresa].forEach(radio => {
        radio.addEventListener('change', toggleFormType);
    });

    // 3. File Upload & Drag-and-Drop Implementation
    dropArea.addEventListener('click', (e) => {
        if (e.target.closest('#btnRemoveImage')) return;
        fileInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropArea.classList.remove('dragover');
        }, false);
    });

    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleImageFile(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (fileInput.files.length > 0) {
            handleImageFile(fileInput.files[0]);
        }
    });

    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor selecciona únicamente archivos de imagen (comprobantes de pago).');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. El tamaño máximo permitido es de 5MB.');
            return;
        }

        base64ImageName = file.name;

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            imgPreview.src = dataUrl;
            base64Image = dataUrl.split(',')[1];
            
            uploadContent.classList.add('hidden');
            previewContent.classList.remove('hidden');
            document.getElementById('fileError').style.display = 'none';
            dropArea.style.borderColor = 'var(--green-light)';
        };
        reader.readAsDataURL(file);
    }

    btnRemoveImage.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = "";
        base64Image = "";
        base64ImageName = "";
        imgPreview.src = "";
        previewContent.classList.add('hidden');
        uploadContent.classList.remove('hidden');
        dropArea.style.borderColor = 'var(--border-dark-card)';
    });

    // 4. Validation & Form Submission

    function validateForm() {
        let isValid = true;
        const tipoRegistro = radioIndependiente.checked ? 'independiente' : 'empresa';

        if (tipoRegistro === 'independiente') {
            // Validar Nro Documento
            const docNumber = document.getElementById('docNumber');
            const docNumberError = document.getElementById('docNumberError');
            if (docNumber.value.trim().length < 5) {
                docNumber.closest('.form-group').classList.add('invalid');
                docNumberError.style.display = 'block';
                isValid = false;
            } else {
                docNumber.closest('.form-group').classList.remove('invalid');
                docNumberError.style.display = 'none';
            }

            // Validar Apellidos y Nombres
            const fullName = document.getElementById('fullName');
            const nameError = document.getElementById('nameError');
            if (fullName.value.trim().length < 4) {
                fullName.closest('.form-group').classList.add('invalid');
                nameError.style.display = 'block';
                isValid = false;
            } else {
                fullName.closest('.form-group').classList.remove('invalid');
                nameError.style.display = 'none';
            }

            // Validar Cargo/Profesión
            const cargo = document.getElementById('cargo');
            const cargoError = document.getElementById('cargoError');
            if (cargo.value.trim().length < 2) {
                cargo.closest('.form-group').classList.add('invalid');
                cargoError.style.display = 'block';
                isValid = false;
            } else {
                cargo.closest('.form-group').classList.remove('invalid');
                cargoError.style.display = 'none';
            }

            // Validar Voucher de Pago (Solo para Independientes)
            const fileError = document.getElementById('fileError');
            if (!base64Image) {
                dropArea.closest('.form-group').classList.add('invalid');
                fileError.style.display = 'block';
                isValid = false;
            } else {
                dropArea.closest('.form-group').classList.remove('invalid');
                fileError.style.display = 'none';
            }
        } else {
            // Validar RUC (debe tener 11 dígitos numéricos en Perú)
            const ruc = document.getElementById('ruc');
            const rucError = document.getElementById('rucError');
            const rucRegex = /^\d{11}$/;
            if (!rucRegex.test(ruc.value.trim())) {
                ruc.closest('.form-group').classList.add('invalid');
                rucError.style.display = 'block';
                isValid = false;
            } else {
                ruc.closest('.form-group').classList.remove('invalid');
                rucError.style.display = 'none';
            }

            // Validar Nombre Empresa
            const companyName = document.getElementById('companyName');
            const companyNameError = document.getElementById('companyNameError');
            if (companyName.value.trim().length < 3) {
                companyName.closest('.form-group').classList.add('invalid');
                companyNameError.style.display = 'block';
                isValid = false;
            } else {
                companyName.closest('.form-group').classList.remove('invalid');
                companyNameError.style.display = 'none';
            }

            // Validar Dirección
            const address = document.getElementById('address');
            const addressError = document.getElementById('addressError');
            if (address.value.trim().length < 5) {
                address.closest('.form-group').classList.add('invalid');
                addressError.style.display = 'block';
                isValid = false;
            } else {
                address.closest('.form-group').classList.remove('invalid');
                addressError.style.display = 'none';
            }
        }

        // Validar Teléfono (Común)
        const phone = document.getElementById('phone');
        const phoneError = document.getElementById('phoneError');
        if (phone.value.trim().length < 6) {
            phone.closest('.form-group').classList.add('invalid');
            phoneError.style.display = 'block';
            isValid = false;
        } else {
            phone.closest('.form-group').classList.remove('invalid');
            phoneError.style.display = 'none';
        }

        // Validar Correo Electrónico (Común)
        const email = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
            email.closest('.form-group').classList.add('invalid');
            emailError.style.display = 'block';
            isValid = false;
        } else {
            email.closest('.form-group').classList.remove('invalid');
            emailError.style.display = 'none';
        }

        return isValid;
    }

    // Limpiar errores visuales al escribir
    const inputsToClear = ['docNumber', 'fullName', 'cargo', 'ruc', 'companyName', 'address', 'phone', 'email'];
    inputsToClear.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', (e) => {
                e.target.closest('.form-group').classList.remove('invalid');
                const errorSpan = e.target.closest('.form-group').querySelector('.error-msg');
                if (errorSpan) errorSpan.style.display = 'none';
            });
        }
    });

    // Handle Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        // Show loading overlay
        formOverlay.classList.remove('hidden');
        overlayLoader.classList.remove('hidden');
        overlaySuccess.classList.add('hidden');
        overlayError.classList.add('hidden');

        const tipoRegistro = radioIndependiente.checked ? 'independiente' : 'empresa';

        // Genera la URL dinámica del logo según donde esté corriendo la web
        const dynamicLogoUrl = window.location.origin + "/img/logo.png";

        const formData = {
            tipoRegistro: tipoRegistro,
            email: document.getElementById('email').value.trim(),
            telefono: document.getElementById('phone').value.trim(),
            logoUrl: dynamicLogoUrl
        };

        // Asignar campos específicos
        if (tipoRegistro === 'independiente') {
            formData.tipoDocumento = document.getElementById('docType').value;
            formData.nroDocumento = document.getElementById('docNumber').value.trim();
            formData.nombreCompleto = document.getElementById('fullName').value.trim();
            formData.cargoProfesion = document.getElementById('cargo').value.trim();
            formData.metodoPago = document.getElementById('paymentMethod').value;
            formData.foto = base64Image;
            formData.fotoNombre = base64ImageName;
        } else {
            formData.ruc = document.getElementById('ruc').value.trim();
            formData.nombreEmpresa = document.getElementById('companyName').value.trim();
            formData.direccion = document.getElementById('address').value.trim();
            // Para empresas, enviamos foto vacía
            formData.foto = "";
            formData.fotoNombre = "";
        }

        if (scriptURL.includes('AKfycbx_CAMBIAR_ESTO_POR_TU_URL')) {
            console.log("Simulando envío. Datos del registro:", formData);
            setTimeout(() => {
                showSuccess();
            }, 2000);
            return;
        }

        try {
            const response = await fetch(scriptURL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.status === 'success') {
                showSuccess();
            } else {
                showError(result.message || "No se pudo procesar la inscripción.");
            }
        } catch (error) {
            console.error("Error al enviar registro:", error);
            showError("Hubo un problema de conexión al guardar los datos. Inténtalo más tarde.");
        }
    });

    function showSuccess() {
        overlayLoader.classList.add('hidden');
        overlaySuccess.classList.remove('hidden');
    }

    function showError(msg) {
        overlayLoader.classList.add('hidden');
        overlayError.classList.remove('hidden');
        errorMessage.textContent = msg;
    }

    function resetForm() {
        form.reset();
        btnRemoveImage.click();
        radioIndependiente.checked = true;
        toggleFormType();
        formOverlay.classList.add('hidden');
    }

    btnReset.addEventListener('click', resetForm);
    btnRetry.addEventListener('click', () => {
        formOverlay.classList.add('hidden');
    });

    window.setScriptURL = (url) => {
        localStorage.setItem('conila_gas_url', url);
        scriptURL = url;
        console.log(`URL de Google Apps Script actualizada a: ${url}`);
    };
});
