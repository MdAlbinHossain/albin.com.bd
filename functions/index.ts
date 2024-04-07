import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()


app.get("/api/:id", async (c) => {
  const userId= c.req.param("id")
  return c.json({ userId})
})

export default app