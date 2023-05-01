// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { v4 as uuid } from "uuid";
import { decode } from 'base64-arraybuffer'
import Cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

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

async function handler(req, res) {
  await runMiddleware(req, res, cors);
  const { b64Image, imageType } = req.body
  const { data, error } = await supabase
    .storage
    .from('images')
    .upload(`${uuid()}`, decode(b64Image),
      { contentType: imageType })
  if (error) {
    res.status(400).json({ error });
  } else {
    const savedImageUrl = data.path;
    console.log({ savedImageUrl });
    res.status(200).json({ savedImageUrl });
  }
};

export default handler;

