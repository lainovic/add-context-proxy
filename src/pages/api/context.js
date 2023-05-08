// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import Cors from 'cors'
import { createClient } from '@supabase/supabase-js'
import { parse } from 'url'

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
  console.log(`---> using supabase ${dbUrl}`);
  console.log(`---> received ${req.method}`);
  if (req.method === "GET") {
    const { query } = parse(req.url, true);
    const id = query['id'];
    let { data, error } = await db
      .from('Context')
      .select('*')
      .eq("id", id)
      .limit(1);
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ data: data[0] });
  } else if (req.method === "POST") {
    const { imageUrl, text } = JSON.parse(req.body);
    const { data, error } = await db
      .from("Context")
      .insert({ imageUrl, text })
      .select()
    if (error) {
      res.status(500).json({ error });
      return;
    }
    res.json({ data: data[0] });
  } else {
    res.status(400).json({ error: `${req.method} not supported` });
  }
};

export default handler;

