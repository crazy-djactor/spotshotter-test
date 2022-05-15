import jose from 'node-jose';

// const jwt = require('jsonwebtoken');

const {JWE, JWK, JWS} = jose;

const _privKey = `-----BEGIN PRIVATE KEY-----
  MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0EW1+TE/xD/GAjVS
  UW79b0uzB0IS6NbYziaxHWbOJsqhRANCAAQCS16t6OeaTLhGBJOLcQi28bHgD6nF
  FZs26ml1mCJwujRCeXqCQMXrhMtb0fanf3UvJcuj4nBOBbkgGm7952MV
  -----END PRIVATE KEY-----`;


const _verifyKey = `-----BEGIN PUBLIC KEY-----
  MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEG7jnk1jcVekyBpcI1UvlDrB3R6qWkMd7
  fJ7snYp3lDoXqFNDLYdovbIOt3riWtBSt2huVTMO37N829DFS1/8xBzOpgCtSYGQ
  v1yjqVwpQYaT6xLL9c0gJ1bYR60DYobd
  -----END PUBLIC KEY-----`


export default async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)


  try {
    const jwKeys = await Promise.all([
      JWK.asKey(_privKey, "pem"),
      JWK.asKey(_verifyKey, "pem")
    ]);
    const privKey = jwKeys[0]
    const verifyKey = jwKeys[1];

    const decrypted = await JWE.createDecrypt(privKey).decrypt(token)
    console.log('decrypted', decrypted.payload.toString());

    const result = await JWS.createVerify(verifyKey).verify(decrypted.payload.toString());
    req.user = JSON.parse(result.payload.toString());
    next();
  } catch(e) {
    console.log(e)
    res.sendStatus(401)
  }

}