import '@std/dotenv/load'
const { ID_GITHUB, SECRET_GITHUB, DESEC_TOKEN, DEV } = Deno.env.toObject()
export { DESEC_TOKEN, DEV, ID_GITHUB, SECRET_GITHUB }
