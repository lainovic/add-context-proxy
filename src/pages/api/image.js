// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from "fs";
import { v4 as uuid } from "uuid";
import formidable from 'formidable'
import Cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const dbUrl = process.env.SUPABASE_URL
const dbKey = process.env.SUPABASE_KEY
const db = createClient(dbUrl, dbKey)

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.startsWith("multipart/form-data")) {
    res.statusCode = 400;
    res.end("Bad request: Invalid Content-Type header");
    return;
  }

  const form = new formidable.IncomingForm();
  const formPromise = await new Promise((resolve, reject) => {
    form.parse(req, async (err, _, files) => {
      if (err) {
        reject(`Internal server error: ${err}`);
      }
      const imageFile = files["image-data"];
      const buffer = fs.readFileSync(imageFile.filepath);
      const imageType = imageFile.mimetype;
      const { data, error } = await db.storage
        .from('images')
        .upload(uuid(), buffer, { contentType: imageType })
      if (error) {
        reject({ error });
      } else {
        resolve({
          url: `${db.storage.
            from("images").
            getPublicUrl(data.path).
            data.publicUrl
            }`
        });
      }
    });
  });
  res.json(formPromise);
};

export default handler;

