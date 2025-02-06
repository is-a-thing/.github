/**
 * Github OAuth mock API
 */

// @deno-types="@types/luxon"
import { DateTime } from "luxon"

import { Wooter, c } from "@bronti/wooter"
import { redirectResponse, jsonResponse } from "@bronti/wooter/util"

const wooter = new Wooter().useMethods()

const kv = await Deno.openKv()

const CODE = "code"
const TOKEN = "token"
const REDIRECT = new URL(`https://api.marinadev.xyz:8000/auth/callback?state=${CODE}`)
const CREATED_AT = DateTime.fromJSDate(new Date(0)).toISO()

wooter.namespace(c.chemin('login', 'oauth'), wooter => wooter.useMethods(), wooter => {
  wooter.GET(c.chemin('authorize'), async ({ url, resp }) => {
    const state = url.searchParams.get('state')
    const redir = new URL(REDIRECT)
    redir.searchParams.set('state', state)
    redir.searchParams.set('code', CODE)
    resp(redirectResponse(redir))
  })
  wooter.POST(c.chemin('access_token'), async ({ resp }) => {
    resp(jsonResponse({ access_token: TOKEN }))
  })
})

wooter.GET(c.chemin('user'), async ({ resp }) => {
  resp(jsonResponse({ id: 0, login: 'example', name: "Example", created_at: CREATED_AT }))
})

export default { fetch: wooter.fetch }