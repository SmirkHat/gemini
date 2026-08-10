import server from "../dist/server/server.js"

export default async function handler(req) {
  const url = new URL(req.url, `https://${req.headers.host || "localhost"}`)
  return server.fetch(new Request(url, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
  }))
}
