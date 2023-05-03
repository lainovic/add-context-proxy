// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { v4 as uuid } from "uuid";
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

async function handler(req, res) {
  await runMiddleware(req, res, cors);
  const { imageUrl, text } = JSON.parse(req.body);
  const { data, error } = await db
    .from("Context")
    .insert({ imageUrl, text })
    .select()
  if (error) {
    res.status(500).json({ error });
  }
  res.json({ data: data[0] });
};

export default handler;

