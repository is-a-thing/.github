import app from "./main.ts"
Deno.serve({
    cert: Deno.readTextFileSync('./cert.pem'),
    key: Deno.readTextFileSync('./key.pem')
}, app.fetch)