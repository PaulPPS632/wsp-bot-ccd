const waitForBot = async (port, retries = 10, delay = 8000) => {
    for (let i = 0; i < retries; i++) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      try {
        // Intentar conectarse al bot
        const response = await fetch(`http://localhost:${port}/v1/codigo`);
        if (response.ok) {
          return await response.json(); // Si la respuesta es exitosa, retornamos el JSON
        }
      } catch (error) {
        // Si falla, esperar antes del próximo intento
        console.log(`Esperando a que el bot en el puerto ${port} esté listo... (${i + 1}/${retries})`);
      }
      
    }
    throw new Error(`El bot en el puerto ${port} no está disponible después de ${retries} intentos.`);
  };

  module.exports = waitForBot;