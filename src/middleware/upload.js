
//! Use of Multer
import multer from "multer";
import path from "path";
import {fileURLToPath} from "url";


const __dirname = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const uploadPath = path.join(path.dirname(__dirname), 'uploads');

export const upload = multer({
  dest: uploadPath
});