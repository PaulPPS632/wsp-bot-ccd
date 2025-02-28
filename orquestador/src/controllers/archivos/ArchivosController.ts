import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME } from "../../config/s3Config";
export class ArchivosController{
    upload = async (req: any, res: any) => {
        try{
            const file = req.file;
            const fileBuffer = file.buffer;
                    const fileType = file.mimetype.includes("image") ? "Masivos/Imagenes": file.mimetype.includes("video") ? "Masivos/Videos" : "Masivos/Documentos";

                    const uploadKey = `${fileType}/${file.originalname}`;
        
                    const uploadParams = {
                        Bucket: BUCKET_NAME,
                        Key: uploadKey,
                        Body: fileBuffer,
                        ContentType: file.mimetype, 
                    };
                    const objeto = new PutObjectCommand(uploadParams);
                    await s3.send(objeto);
                    const fileUrl = `https://pub-9d2abfa175714e64aed33b90722a9fd5.r2.dev/${fileType.replace(/\s+/g, "%20")}/${file.originalname.replace(/\s+/g, "%20")}`;
                    return res.status(200).json({fileUrl});
        }catch(error: any){
            console.error("Error al subir archivos:", error);
            return res.status(500).json({ message: "Error al subir archivos" });
        }
    }
}