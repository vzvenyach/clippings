import { Remarkable, ItemResponse } from 'remarkable-typescript';
const fs = require('fs');

const sync2Remarkable = async (filetitle, file2sync) => {

  // Get API client
  const TOKEN = process.env.REMARKABLE_TOKEN);
  if !TOKEN {console.log("Please get your remarkable token. Run config"); process.exit(1);}
  const client = new Remarkable(process.env.REMARKABLE_TOKEN);

  const readfile = fs.readFileSync(file2sync);
  const uploadedId = await client.uploadPDF(filetitle, readfile);

  return uploadedId;

}
