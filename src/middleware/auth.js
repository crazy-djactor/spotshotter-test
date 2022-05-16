import jose from 'node-jose';
import {getRootPath} from "../util/util.js";
import path from "path";
import * as fs from "fs";

const {JWE, JWK, JWS} = jose;

const keystore = JWK.createKeyStore();
export async function installKeystore() {
  const rootPath = getRootPath();
  const privKeyPath = path.join(rootPath, 'private.pem');
  const signKeyPath = path.join(rootPath, 'sign.pem');
  const privKey = fs.readFileSync(privKeyPath);
  const signKey = fs.readFileSync(signKeyPath);
  const jwKeys = await Promise.all([
    JWK.asKey(privKey, "pem"),
    JWK.asKey(signKey, "pem")
  ]);
  await keystore.add(jwKeys[0]);
  await keystore.add(jwKeys[1]);
}


export default async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  try {
    const decrypted = await JWE.createDecrypt(keystore).decrypt(token)
    console.log('decrypted', decrypted.payload.toString());

    const result = await JWS.createVerify(keystore, {}).verify(decrypted.payload.toString());
    req.user = JSON.parse(result.payload.toString());
    next();
  } catch(e) {
    console.log(e)
    res.sendStatus(401)
  }

}