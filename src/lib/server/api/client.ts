import type { API } from "./server"
import { hc } from "hono/client"
export default hc<API>("/api")