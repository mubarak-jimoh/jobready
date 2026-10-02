import test from "node:test"
import assert from "node:assert/strict"

import { cleanJson, getCurrentMonth, missingEnv, REQUIRED_ENV } from "../lib/util.js"

test("cleanJson strips the markdown code block AI models add", ()=>{
  const wrapped = '```json\n{"summary":"Hello"}\n```'
  assert.deepEqual(JSON.parse(cleanJson(wrapped)), { summary:"Hello" })
})

test("cleanJson leaves plain JSON alone and copes with nothing", ()=>{
  assert.equal(cleanJson(' {"a":1} '), '{"a":1}')
  assert.equal(cleanJson(undefined), "")
})

test("getCurrentMonth gives the year and month", ()=>{
  assert.equal(getCurrentMonth(new Date("2026-06-29T10:00:00Z")), "2026-06")
  assert.equal(getCurrentMonth(new Date("2026-12-31T23:59:59Z")), "2026-12")
})

test("missingEnv lists what has not been set", ()=>{
  assert.deepEqual(missingEnv({}), REQUIRED_ENV)

  const full = Object.fromEntries(REQUIRED_ENV.map((name)=> [name, "x"]))
  assert.deepEqual(missingEnv(full), [])
  assert.deepEqual(missingEnv({ ...full, OPENAI_API_KEY:"" }), ["OPENAI_API_KEY"])
})
