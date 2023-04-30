// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { v4 as uuid } from "uuid";
import { decode } from 'base64-arraybuffer'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function handler(req, res) {
  const { imgUrl, context } = req.body
  console.log({ imgUrl });
  console.log({ context });

  const imgRes = await fetch(imgUrl)
  const buffer = await imgRes.arrayBuffer();
  const b64 = Buffer.from(buffer).toString("base64");

  const { data, error } = await supabase
    .storage
    .from('images')
    .upload(`${uuid()}`, decode(b64),
      { contentType: imgRes.headers.get("content-type") })
  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ data });
  }
};

export default handler;

