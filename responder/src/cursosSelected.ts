
const ruta_local_orquestador = process.env.RUTA_LOCAL_ORQUESTADOR ?? '172.18.0.1'; //'172.18.0.1'
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

export const consultar = async (phone: string):Promise<{ flag: boolean, cursos: string }> => {
    const respuesta = await fetch(`http://${ruta_local_orquestador}:8000/api/leads?number=${phone}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    if (!respuesta.ok) {
        console.error("Error en la solicitud:", respuesta.status, await respuesta.text());
    }else {
        const data = await respuesta.json();
        const registradocurso = data.lead.curso;
        
        console.log("cursos registrados:",data.masivo.flowResponder.cursos);
        
        return {flag: registradocurso !== null , cursos: data.masivo.flowResponder.cursos};
    }
}

export const consultayselectedCurso = async (phone: string, option: number):Promise<{ flag: boolean, curso: string }> => {
    const{flag,cursos} = await consultar(phone);
    console.log("resultado de consulta backend:",{flag, cursos})
    if(flag){
        return {flag: false,curso:''};
    }else{
        const curso = cursos[option-1] ?? "NO SE ENCONTRO";
        const estado = await updateCursobyPhone(phone, curso);
        return {flag:estado,curso};
    }
}