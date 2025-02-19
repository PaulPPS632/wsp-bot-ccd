
const ruta_local_orquestador = process.env.RUTA_LOCAL_ORQUESTADOR ?? '172.18.0.1';
const updateCursobyPhone = async (phone: string, curso: string): Promise<boolean> => {
    const respuesta = await fetch(`http://${ruta_local_orquestador}:8000/api/leads`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          curso
        }),
    });
    if (!respuesta.ok) {
        console.error("Error en la solicitud:", respuesta.status, await respuesta.text());
        return false;
    }else {
        return true;
    }
}
export const consultayselectedCurso = async (phone: string, option: number):Promise<{ flag: boolean, curso: string }> => {
    const respuesta = await fetch(`http://${ruta_local_orquestador}:8000/api/leads?number=${phone}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });
    if (!respuesta.ok) {
        console.error("Error en la solicitud:", respuesta.status, await respuesta.text());
    }else {
        const data = await respuesta.json();
        const curso = data.lead.flow.cursos[option-1] ?? "NO SE ENCONTRO";
        const flag = await updateCursobyPhone(phone, curso);
        return {flag,curso};
    }
    
}