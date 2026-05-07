const axios = require('axios');
const crypto = require('crypto');

// Configuración de credenciales de Sandbox [1]
const API_KEY = 'TU_API_KEY_DESDE_MIS_DATOS';
const SECRET_KEY = 'TU_SECRET_KEY_DESDE_MIS_DATOS';
const BASE_URL = 'https://sandbox.flow.cl/api'; // Endpoint de pruebas [2]

/**
 * Función para firmar parámetros según el estándar de Flow [1, 3]
 */
function signParams(params, secret) {
    // 1. Ordenar parámetros alfabéticamente por nombre [1]
    const sortedKeys = Object.keys(params).sort();
    
    // 2. Concatenar nombre y valor en un string continuo [1]
    let toSign = "";
    sortedKeys.forEach(key => {
        toSign += key + params[key];
    });

    // 3. Generar hash HMAC SHA256 [3]
    return crypto.createHmac('sha256', secret).update(toSign).digest('hex');
}

/**
 * Crea la orden de pago y devuelve la URL para el cliente [4, 5]
 */
async function createOrder() {
    const params = {
        apiKey: API_KEY,
        commerceOrder: "ORD-" + Math.floor(Math.random() * 10000), // ID único
        subject: "Pago de prueba E-commerce",
        amount: 5000,
        email: "comprador@ejemplo.com",
        urlConfirmation: "https://tu-dominio.com/api/confirmacion", // Donde Flow notifica [5]
        urlReturn: "https://tu-dominio.com/gracias", // Donde vuelve el cliente [6]
        currency: "CLP"
    };

    // Agregar el parámetro de firma 's' [7]
    params.s = signParams(params, SECRET_KEY);

    try {
        // Enviar vía POST con content-type: application/x-www-form-urlencoded [5]
        const response = await axios.post(`${BASE_URL}/payment/create`, 
            new URLSearchParams(params).toString()
        );
        
        const { url, token } = response.data;
        // La URL final de redirección se forma concatenando token [8]
        console.log("Redirige al cliente a:", `${url}?token=${token}`);
        return `${url}?token=${token}`;
    } catch (error) {
        console.error("Error al crear pago:", error.response ? error.response.data : error.message);
    }
}
