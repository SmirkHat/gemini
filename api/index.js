import mod from "../dist/server/server.js"

export default async function handler(req) {
  try {
    const url = new URL(req.url, `https://${req.headers.host || "localhost"}`)
    const response = await mod.fetch(new Request(url, {
      method: req.method,
      headers: req.headers,
      body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    }))
    return response
  } catch (err) {
    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
}
