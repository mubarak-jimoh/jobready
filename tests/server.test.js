import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"

/* Starts the real server with made-up keys and checks what an outsider can
   reach. No request here gets far enough to call OpenAI, Stripe or Supabase
   with those keys. */

const PORT = 3975
const BASE = `http://127.0.0.1:${PORT}`
let server

before(async ()=>{
  server = spawn(process.execPath, ["server.js"], {
    env:{
      ...process.env,
      PORT:String(PORT),
      OPENAI_API_KEY:"test-key",
      STRIPE_SECRET_KEY:"sk_test_placeholder",
      STRIPE_WEBHOOK_SECRET:"whsec_placeholder",
      SUPABASE_URL:"http://127.0.0.1:9",
      SUPABASE_PUBLISHABLE_KEY:"sb_publishable_placeholder",
      SUPABASE_SERVICE_ROLE_KEY:"service-role-placeholder",
      CLIENT_URL:BASE
    },
    stdio:"ignore"
  })

  for(let attempt = 0; attempt < 200; attempt++){
    try{
      const response = await fetch(`${BASE}/health`)
      if(response.ok) return
    }catch{
      // not listening yet
    }
    await new Promise((resolve)=> setTimeout(resolve, 100))
  }
  throw new Error("Server did not start")
})

after(()=> server.kill())

test("the health check responds", async ()=>{
  const response = await fetch(`${BASE}/health`)
  assert.equal((await response.json()).status, "ok")
})

test("the home page and a script are served", async ()=>{
  const home = await fetch(`${BASE}/`)
  assert.equal(home.status, 200)
  assert.match(await home.text(), /JobReady/)

  const script = await fetch(`${BASE}/js/premium.js`)
  assert.equal(script.status, 200)
})

test("the browser config has the publishable key and never the service key", async ()=>{
  const response = await fetch(`${BASE}/js/config.js`)
  const config = await response.text()
  assert.match(response.headers.get("content-type"), /javascript/)
  assert.match(config, /sb_publishable_placeholder/)
  assert.doesNotMatch(config, /service-role-placeholder/)
})

test("server code and secrets are not served", async ()=>{
  for(const path of ["/server.js", "/.env", "/.env.example", "/package.json", "/lib/auth.js"]){
    const response = await fetch(`${BASE}${path}`)
    assert.equal(response.status, 404, path)
  }
})

test("every API route refuses a request with no login", async ()=>{
  const routes = [
    "my-usage", "import-cv", "career-assistant", "career-assistant-stream",
    "rewrite-cv", "humanise-cv", "generate-cover-letter", "advanced-cv-score",
    "bullet-generator", "interview-prep", "interview-feedback", "salary-path",
    "career-coach", "linkedin-optimiser", "resume-tailor",
    "create-checkout-session", "create-billing-portal-session"
  ]

  for(const route of routes){
    const response = await fetch(`${BASE}/api/${route}`, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ userId:"someone-elses-id", message:"hi" })
    })
    assert.equal(response.status, 401, route)
  }
})

test("the Stripe webhook rejects a request that Stripe did not sign", async ()=>{
  const response = await fetch(`${BASE}/api/stripe-webhook`, {
    method:"POST",
    headers:{ "Content-Type":"application/json", "stripe-signature":"forged" },
    body:JSON.stringify({ type:"checkout.session.completed" })
  })
  assert.equal(response.status, 400)
})

test("security headers are set", async ()=>{
  const response = await fetch(`${BASE}/`)
  const policy = response.headers.get("content-security-policy")
  assert.match(policy, /script-src 'self' https:\/\/cdn\.jsdelivr\.net/)
  assert.doesNotMatch(policy, /script-src[^;]*unsafe-inline/)
  assert.equal(response.headers.get("x-content-type-options"), "nosniff")
})

test("the server refuses to start without its settings", async ()=>{
  const child = spawn(process.execPath, ["server.js"], {
    env:{ PATH:process.env.PATH, DOTENV_CONFIG_PATH:"/nonexistent" },
    stdio:"ignore"
  })
  const code = await new Promise((resolve)=> child.on("exit", resolve))
  assert.equal(code, 1)
})
