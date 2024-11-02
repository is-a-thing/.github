import { Hono } from 'hono'

const hono = new Hono()

export default hono
export type API = typeof hono
