import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import csv from 'fast-csv';
import * as fs from "fs";
import path from 'path';
import axios from 'axios';
import pug from 'pug'

import {upload} from "./middleware/upload.js";
import {getRootPath, makeSpiral} from "./util/util.js";
import authenticateToken, {installKeystore} from "./middleware/auth.js";

const app = express();
const port = 3000;


app.options('*', cors());
app.use(cors());
app.use(cookieParser());
app.use(express.text());

app.set("view engine", "pug");
app.set('views', path.join(getRootPath(), 'src', 'views'));



// TASK 3: implement authentication middleware
//
// The authentication will use nested signed and encrypted JWT tokens,
// therefore the middleware needs to decrypt the JWE to get the JWT,
// then verify the JWT to get the user data.
//
// You are given the following valid token (expires on 2022-05-16):
// eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImN0eSI6IkpXVCIsImVwayI6eyJ4IjoiN0JsdFJsR3ZYeXZuSXl6UmVMdEc4MWgtbFBKNjdpR0YzYWZRX25xUGJNNCIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5IjoicE5qRm1Nc1UwQXVVa0picW5Kb1VrNXpXaENfV3ZlTDlZR0RkZ2JKVUpubyJ9fQ..tJ0uB75Gt1DdmvW8.2_uHWNintOHaoF8SNy2p04yqOeuDuA6gzeJaeKjfsj2kyaUm7W-Y2ZaOFkx6KOI5DTXlhQelLnQw5o_VIYW5yogCN5kDWXYO3e0G8Ha_9xpF1byZxHFIfhLPpCm4IMpNxHJriwiFWi9enfdJAuhnWcinmnR2ulAXzH56-yueH8jq9x76Fcc2LfQsxndhA3qgAizxsgaoACkoFj8uVS33Coa7S8K_sC-4j9gBvoupDPRhvcweSl8OkwX_VWwsMvfBw0si4zfVcmw38K70IHEdaRT0uYvT6qwdwtyJTmJSnK70GuhnnsM4wXPwzmThh_Z3dpwy5_i2_fD_pnK0JnuwbFYgdZBw-D2tEZxJsaNeyNE.E6S2uOOy58KCQlWiL5JRUg
//
// and the following keys:
//
// private key for decryption:
//
// -----BEGIN PRIVATE KEY-----
// MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0EW1+TE/xD/GAjVS
// UW79b0uzB0IS6NbYziaxHWbOJsqhRANCAAQCS16t6OeaTLhGBJOLcQi28bHgD6nF
// FZs26ml1mCJwujRCeXqCQMXrhMtb0fanf3UvJcuj4nBOBbkgGm7952MV
// -----END PRIVATE KEY-----
//
// public key for signature verification:
//
// -----BEGIN PUBLIC KEY-----
// MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAEG7jnk1jcVekyBpcI1UvlDrB3R6qWkMd7
// fJ7snYp3lDoXqFNDLYdovbIOt3riWtBSt2huVTMO37N829DFS1/8xBzOpgCtSYGQ
// v1yjqVwpQYaT6xLL9c0gJ1bYR60DYobd
// -----END PUBLIC KEY-----
//
// Hint: the token above contains additional information you need to use to solve this problem.
//
// The middleware should return 401 if the token is invalid or expired.
// The token should be passed in Authorization header using Bearer scheme.



app.get('/', authenticateToken, (req, res) => {
  // TASK 3+: instead of "Hello World!", return the name of the authenticated user.
  console.log(req.user)
  res.send(req.user.name);
});


app.post('/spiral-matrix', upload.single("uploadfile"), (req, res) => {
  // TASK 1: given an (M x N) matrix of numbers POSTed as CSV,
  // return an array of size M * N (as CSV) that holds the
  // matrix elements in the order of a spiral starting in
  // the top-left corner of the matrix, rotating clockwise
  //
  // Example input:
  // 1,2,3,4
  // 10,11,12,5
  // 9,8,7,6
  //
  // Produce the following output:
  // 1,2,3,4,5,6,7,8,9,10,11,12

  const filePath = path.join(path.dirname(__dirname), 'uploads', req.file.filename);
  console.log('mid filepath', filePath)
  let stream = fs.createReadStream(filePath);
  let csvData = [];
  let csvStream = csv
    .parse()
    .on("data", function (data) {
      csvData.push(data);
    })
    .on("end", function () {
      const spiralMatrix = makeSpiral(csvData);
      fs.unlinkSync(filePath)
      res.send(spiralMatrix)
    });
  stream.pipe(csvStream);
});

app.get('/random-duck', (req, res) => {
  // TASK 2: going to /random-duck should show a page
  // with an image of a duck, retrieved using the API
  // described at https://random-d.uk/api
  axios.get('https://random-d.uk/api/random').then(response => {
    console.log(response.data);
    res.render('random-duck', response.data);
  })
});

installKeystore().then(() => {
  app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
  });
})
console.log('init');

