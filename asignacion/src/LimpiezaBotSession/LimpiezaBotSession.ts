//const fs = require('fs')
//const path = require('path')
import fs from "fs";
import path from "path";

const folderPath = './bot_sessions' // Cambia esto a la ruta de tu carpeta

const archivosAConservar = ['creds.json', 'baileys_store.json'] // Nombres de los archivos a conservar

function limpiarCarpeta() {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error al leer la carpeta:', err)
            return
        }

        files.forEach(file => {
            if (!archivosAConservar.includes(file)) {
                // Eliminar archivo que no está en la lista de conservación
                fs.unlink(path.join(folderPath, file), err => {
                    if (err) {
                        console.error(`Error al eliminar ${file}:`, err)
                    } else {
                        console.log(`Se eliminó ${file} correctamente.`)
                    }
                })
            }
        })
    })
}
export const LimpiezaSession = () => {
    setInterval(limpiarCarpeta, 1200000);
}
