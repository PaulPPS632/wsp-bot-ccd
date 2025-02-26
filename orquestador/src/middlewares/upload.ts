import multer from "multer";
import path from "path";
import fs from "fs";
const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
        const uploadPath = path.join(__dirname, "./public");
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const upload = multer({ storage });
