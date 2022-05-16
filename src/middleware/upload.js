//! Use of Multer
import multer from "multer";
import path from "path";
import {getRootPath} from "../util/util.js";

export const upload = multer({
  dest: path.join(getRootPath(), 'uploads')
});