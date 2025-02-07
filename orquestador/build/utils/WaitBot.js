"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForBot = void 0;
const waitForBot = (port_1, ...args_1) => __awaiter(void 0, [port_1, ...args_1], void 0, function* (port, retries = 10, delay = 8000) {
    for (let i = 0; i < retries; i++) {
        yield new Promise((resolve) => setTimeout(resolve, delay));
        try {
            // Intentar conectarse al bot
            const response = yield fetch(`http://localhost:${port}/v1/codigo`);
            const respuesta = yield response.json();
            if (response.ok) {
                return respuesta; // Si la respuesta es exitosa, retornamos el JSON
            }
        }
        catch (error) {
            // Si falla, esperar antes del próximo intento
            console.log(`Esperando a que el bot en el puerto ${port} esté listo... (${i + 1}/${retries})`);
        }
    }
    throw new Error(`El bot en el puerto ${port} no está disponible después de ${retries} intentos.`);
});
exports.waitForBot = waitForBot;
