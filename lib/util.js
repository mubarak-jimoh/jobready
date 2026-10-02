/* The month a usage count belongs to, e.g. "2026-06". */
export function getCurrentMonth(date = new Date()){
  return date.toISOString().slice(0, 7)
}

/* AI models often wrap JSON in a markdown code block. Strip it before parsing. */
export function cleanJson(text){
  return String(text || "")
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim()
}

/* Environment variables the server cannot run without. */
export const REQUIRED_ENV = [
  "OPENAI_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLIENT_URL"
]

export function missingEnv(env = process.env){
  return REQUIRED_ENV.filter((name)=> !env[name])
}
