import test from "node:test"
import assert from "node:assert/strict"

import { createRequireUser, getBearerToken } from "../lib/auth.js"

/* A stand-in for Supabase that knows one valid token. */
function fakeSupabase({ fail = false } = {}){
  return {
    auth:{
      async getUser(token){
        if(fail) throw new Error("network down")
        if(token === "good-token"){
          return { data:{ user:{ id:"user-1", email:"sam@example.com" } }, error:null }
        }
        return { data:{ user:null }, error:{ message:"invalid JWT" } }
      }
    }
  }
}

/* Runs the middleware and reports what it did. */
async function run(headers, supabase = fakeSupabase(), body = {}){
  const req = { headers, body }
  const result = { status:200, json:null, nextCalled:false }
  const res = {
    status(code){ result.status = code; return this },
    json(payload){ result.json = payload; return this }
  }
  await createRequireUser(supabase)(req, res, ()=>{ result.nextCalled = true })
  return { req, ...result }
}

test("getBearerToken reads the token from the header", ()=>{
  assert.equal(getBearerToken("Bearer abc.def"), "abc.def")
  assert.equal(getBearerToken("bearer abc"), "abc")
  assert.equal(getBearerToken("Basic abc"), null)
  assert.equal(getBearerToken("Bearer"), null)
  assert.equal(getBearerToken(undefined), null)
})

test("a request with no token is rejected", async ()=>{
  const result = await run({})
  assert.equal(result.status, 401)
  assert.equal(result.nextCalled, false)
})

test("a request with a bad token is rejected", async ()=>{
  const result = await run({ authorization:"Bearer forged" })
  assert.equal(result.status, 401)
  assert.equal(result.nextCalled, false)
})

test("a valid token lets the request through as that user", async ()=>{
  const result = await run({ authorization:"Bearer good-token" })
  assert.equal(result.nextCalled, true)
  assert.equal(result.req.user.id, "user-1")
})

test("a user ID in the body cannot be used to act as someone else", async ()=>{
  const body = { userId:"victim-99" }
  const noToken = await run({}, fakeSupabase(), body)
  assert.equal(noToken.status, 401)

  const ownToken = await run({ authorization:"Bearer good-token" }, fakeSupabase(), body)
  assert.equal(ownToken.req.user.id, "user-1")
})

test("if the login service is down, the request fails closed", async ()=>{
  const result = await run({ authorization:"Bearer good-token" }, fakeSupabase({ fail:true }))
  assert.equal(result.status, 503)
  assert.equal(result.nextCalled, false)
})
