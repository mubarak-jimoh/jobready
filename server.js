import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"
import Stripe from "stripe"
import multer from "multer"
import mammoth from "mammoth"
import { createClient } from "@supabase/supabase-js"
import { PDFParse } from "pdf-parse"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createRequireUser } from "./lib/auth.js"
import { cleanJson, getCurrentMonth, missingEnv } from "./lib/util.js"

dotenv.config()

const missing = missingEnv()

if(missing.length){
  console.error(`Missing environment variables: ${missing.join(", ")}`)
  console.error("Copy .env.example to .env and fill it in.")
  process.exit(1)
}

const app = express()

// The pages load their libraries from jsDelivr, fonts from Google and talk
// to Supabase from the browser. Everything else is blocked.
app.use(helmet({
  contentSecurityPolicy:{
    directives:{
      defaultSrc:["'self'"],
      scriptSrc:["'self'", "https://cdn.jsdelivr.net"],
      styleSrc:["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:["'self'", "https://fonts.gstatic.com"],
      imgSrc:["'self'", "data:", "blob:", "https:"],
      connectSrc:["'self'", "https://cdn.jsdelivr.net", process.env.SUPABASE_URL],
      frameAncestors:["'none'"]
    }
  }
}))
app.use(compression())

const apiLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 100,
standardHeaders: true,
legacyHeaders: false
})

app.use("/api", apiLimiter)


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
})
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const client = new OpenAI({
  apiKey:process.env.OPENAI_API_KEY
})

const FREE_LIMITS = {
  rewrite_cv:2,
  humanise_cv:2,
  cover_letter:1,
  advanced_cv_score:1,
  interview_prep:1,
  interview_feedback:2,
  salary_path:1,
  career_coach:2,
  career_assistant:3,
  linkedin_optimiser:1,
  bullet_generator:2,
  resume_tailor:1,
  import_cv:1
}

function buildCareerAssistantPrompt(message){
  return `
You are JobReady, an elite UK career strategist, recruiter, skills coach and qualification adviser.

Help the user with:
- CV strategy
- interview preparation
- salary growth
- career switching
- learning plans
- qualifications
- certifications
- apprenticeships
- university routes
- portfolio projects
- LinkedIn improvement
- job search strategy
- industry expectations
- skills roadmaps

Rules:
- Use UK English.
- Be practical and honest.
- Do not make fake guarantees.
- Recommend realistic qualifications, certifications, projects and skills.
- Explain what to learn, why it matters, and what order to learn it in.
- Include a clear action plan.
- If the user mentions an industry, explain what employers usually look for.
- Keep the answer structured and useful.

Important:
If the user message includes "Career profile memory", use it as trusted personal context.
Do not repeat the memory back unless useful.
Personalise the advice around the user's target role, level, skills, experience, salary goal, industry and learning goal.

User question and optional career memory:
${message || ""}

Format the response using markdown.

Structure responses professionally with sections like:

# Career Direction
# Skills To Learn
# Qualifications
# Projects To Build
# Salary Potential
# 30 Day Action Plan
# Recruiter Advice

Use:
- headings
- bullet points
- numbered lists
- bold important advice

Keep advice realistic, practical and UK-focused.

Return only markdown.
`
}

async function isPremiumUser(userId){
  if(!userId) return false

  const { data } = await supabaseAdmin
  .from("subscriptions")
  .select("*")
  .eq("user_id", userId)
  .eq("plan", "premium")
  .in("status", ["active", "trialing"])
  .maybeSingle()

  return !!data
}

async function getSubscription(userId){
  const { data } = await supabaseAdmin
  .from("subscriptions")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle()

  return data
}

async function checkAndTrackUsage(userId, action, freeLimit){
  if(!userId){
    return {
      allowed:false,
      error:"User ID missing. Please log in again."
    }
  }

  const premium = await isPremiumUser(userId)

  if(premium){
    return {
      allowed:true,
      premium:true,
      remaining:"unlimited"
    }
  }

  const usageMonth = getCurrentMonth()

  const { data:existing, error:fetchError } = await supabaseAdmin
  .from("usage_limits")
  .select("*")
  .eq("user_id", userId)
  .eq("action", action)
  .eq("usage_month", usageMonth)
  .maybeSingle()

  if(fetchError){
    console.error("Usage fetch error:", fetchError)

    return {
      allowed:false,
      error:"Usage check failed."
    }
  }

  if(existing && existing.usage_count >= freeLimit){
    return {
      allowed:false,
      premium:false,
      limitReached:true,
      error:"Free limit reached. Upgrade to Premium for unlimited access."
    }
  }

  if(existing){
    await supabaseAdmin
    .from("usage_limits")
    .update({
      usage_count:existing.usage_count + 1,
      updated_at:new Date().toISOString()
    })
    .eq("id", existing.id)

    return {
      allowed:true,
      premium:false,
      remaining:freeLimit - (existing.usage_count + 1)
    }
  }

  await supabaseAdmin
  .from("usage_limits")
  .insert([{
    user_id:userId,
    action:action,
    usage_count:1,
    usage_month:usageMonth
  }])

  return {
    allowed:true,
    premium:false,
    remaining:freeLimit - 1
  }
}

app.post("/api/stripe-webhook", express.raw({ type:"application/json" }), async (req, res)=>{
  let event

  try{
    const signature = req.headers["stripe-signature"]

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  }catch(error){
    console.error("Webhook error:", error.message)
    return res.status(400).send("Webhook signature check failed.")
  }

  try{
    if(event.type === "checkout.session.completed"){
      const session = event.data.object
      const userId = session.metadata?.user_id

      const email =
      session.customer_details?.email ||
      session.customer_email ||
      ""

      const subscriptionId = session.subscription
      const customerId = session.customer

      if(!userId){
        return res.json({ received:true })
      }

      const { data:existing } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()

      if(existing){
        await supabaseAdmin
        .from("subscriptions")
        .update({
          email,
          stripe_customer_id:customerId,
          stripe_subscription_id:subscriptionId,
          status:"active",
          plan:"premium",
          updated_at:new Date().toISOString()
        })
        .eq("user_id", userId)
      }else{
        await supabaseAdmin
        .from("subscriptions")
        .insert([{
          user_id:userId,
          email,
          stripe_customer_id:customerId,
          stripe_subscription_id:subscriptionId,
          status:"active",
          plan:"premium"
        }])
      }
    }

    if(
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ){
      const subscription = event.data.object
      const status = subscription.status

      const plan =
      status === "active" || status === "trialing"
      ? "premium"
      : "free"

      await supabaseAdmin
      .from("subscriptions")
      .update({
        status,
        plan,
        updated_at:new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscription.id)
    }

    res.json({ received:true })

  }catch(error){
    console.error("Webhook processing error:", error)
    res.status(500).json({ error:"Webhook processing failed." })
  }
})

// The site and the API are served from the same address, so only that
// address is allowed to call the API from a browser.
app.use(cors({ origin:process.env.CLIENT_URL }))
app.use(express.json({ limit:"1mb" }))

// The browser needs the Supabase address and publishable key to sign users
// in. They come from the environment, so no project details live in the code.
app.get("/js/config.js", (req, res)=>{
  res.type("application/javascript").send(
    `export const supabaseUrl = ${JSON.stringify(process.env.SUPABASE_URL)}\n` +
    `export const supabaseKey = ${JSON.stringify(process.env.SUPABASE_PUBLISHABLE_KEY)}\n`
  )
})

// Only the public folder is served. server.js and .env are never reachable.
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "public")
app.use(express.static(publicDir))

// Every API route below needs a signed-in user.
app.use("/api", createRequireUser(supabaseAdmin))
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "JobReady",
    timestamp: new Date().toISOString()
  })
})
app.post("/api/import-cv", upload.single("cv"), async (req, res)=>{
  try{
    const userId = req.user.id

    const usage = await checkAndTrackUsage(
      userId,
      "import_cv",
      FREE_LIMITS.import_cv
    )

    if(!usage.allowed){
      return res.status(403).json({
        error:usage.error
      })
    }

    if(!req.file){
      return res.status(400).json({
        error:"No CV file uploaded."
      })
    }

    const fileName =
req.file.originalname.toLowerCase()

let extractedText = ""

if(fileName.endsWith(".pdf")){

  const parser =
  new PDFParse({
    data:req.file.buffer
  })

  const parsed =
  await parser.getText()

  extractedText =
  parsed.text || ""

  await parser.destroy()

}else if(
  fileName.endsWith(".docx") ||
  fileName.endsWith(".doc")
){

  const parsed =
  await mammoth.extractRawText({
    buffer:req.file.buffer
  })

  extractedText =
  parsed.value || ""

}else if(fileName.endsWith(".txt")){

  extractedText =
  req.file.buffer.toString("utf8")

}else{

  return res.status(400).json({
    error:"Unsupported file type"
  })

}

    if(extractedText.trim().length < 40){
      return res.status(400).json({
        error:"Could not read enough text from this CV. Try another file."
      })
    }

    const prompt = `
You are JobReady, an elite UK CV parser and recruiter.

Extract and clean this CV into structured builder fields.

Rules:
- Use UK English.
- Do not invent fake experience.
- Do not invent employers, grades, education, projects or qualifications.
- Keep information truthful.
- Clean messy formatting.
- Convert skills into comma-separated keywords.
- Make the summary professional but based only on the CV.
- If a field is missing, return an empty string.
- Return ONLY valid JSON.

CV text:
${extractedText.slice(0, 12000)}

Return JSON:
{
  "fullName": "",
  "jobTitle": "",
  "summary": "",
  "skills": "",
  "experience": "",
  "education": ""
}
`

    const response =
    await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error("CV import error:", error)

    res.status(500).json({
      error:"CV import failed."
    })
  }
})

app.post("/api/my-usage", async (req, res)=>{
  try{
    const userId = req.user.id

    if(!userId){
      return res.status(400).json({ error:"User ID missing." })
    }

    const premium = await isPremiumUser(userId)
    const subscription = await getSubscription(userId)
    const usageMonth = getCurrentMonth()

    const { data:usageRows, error } = await supabaseAdmin
    .from("usage_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("usage_month", usageMonth)

    if(error){
      return res.status(500).json({ error:"Failed to load usage." })
    }

    const usage = {}

    Object.keys(FREE_LIMITS).forEach((action)=>{
      const row = usageRows?.find(item => item.action === action)
      const used = row?.usage_count || 0

      usage[action] = {
        used,
        limit:premium ? "unlimited" : FREE_LIMITS[action],
        remaining:premium ? "unlimited" : Math.max(FREE_LIMITS[action] - used, 0)
      }
    })

    res.json({
      premium,
      plan:premium ? "premium" : "free",
      subscription,
      usageMonth,
      usage
    })

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Usage endpoint failed." })
  }
})

app.post("/api/create-billing-portal-session", async (req, res)=>{
  try{
    const userId = req.user.id

    if(!userId){
      return res.status(400).json({ error:"User ID missing." })
    }

    const subscription = await getSubscription(userId)

    if(!subscription || !subscription.stripe_customer_id){
      return res.status(400).json({
        error:"No Stripe customer found for this account."
      })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer:subscription.stripe_customer_id,
      return_url:`${process.env.CLIENT_URL}/pages/account.html`
    })

    res.json({ url:portalSession.url })

  }catch(error){
    console.error("Billing portal error:", error.message)
    res.status(500).json({ error:"Billing portal failed." })
  }
})

app.post("/api/create-checkout-session", async (req, res)=>{
  try{
    const userId = req.user.id
    const email = req.user.email

    if(!userId){
      return res.status(400).json({
        error:"User ID missing. Please log in again."
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode:"subscription",
      payment_method_types:["card"],
      customer_email:email || undefined,
      metadata:{ user_id:userId },
      subscription_data:{
        metadata:{ user_id:userId }
      },
      line_items:[
        {
          price_data:{
            currency:"gbp",
            recurring:{ interval:"month" },
            product_data:{
              name:"JobReady Premium",
              description:"Unlimited AI CV tools, interview prep, salary insights, job tracking and career coaching."
            },
            unit_amount:999
          },
          quantity:1
        }
      ],
      success_url:`${process.env.CLIENT_URL}/pages/pricing.html?success=true`,
      cancel_url:`${process.env.CLIENT_URL}/pages/pricing.html?cancel=true`
    })

    res.json({ url:session.url })

  }catch(error){
    console.error("STRIPE CHECKOUT ERROR:", error.message)
    res.status(500).json({ error:"Stripe checkout failed." })
  }
})

app.post("/api/linkedin-optimiser", async (req, res)=>{
  try{
    const userId = req.user.id
    const {
      fullName,
      targetRole,
      headline,
      aboutSection,
      experience,
      skills
    } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "linkedin_optimiser",
      FREE_LIMITS.linkedin_optimiser
    )

    if(!usage.allowed){
      return res.status(403).json({
        error:usage.error
      })
    }

    const prompt = `
You are JobReady, an elite UK LinkedIn profile strategist, recruiter and personal branding expert.

Analyse this LinkedIn profile for employability and recruiter visibility.

Candidate:
${fullName || "Not provided"}

Target role:
${targetRole || "Not provided"}

Current headline:
${headline || "Not provided"}

Current About section:
${aboutSection || "Not provided"}

Experience:
${experience || "Not provided"}

Skills:
${skills || "Not provided"}

Return ONLY valid JSON with this exact structure:

{
  "profileScore": 0,
  "recruiterScore": 0,
  "keywordStrength": 0,
  "aiFeedback": "...",
  "improvedHeadline": "...",
  "improvedAbout": "...",
  "recruiterKeywords": "keyword one, keyword two, keyword three"
}

Rules:
- Use UK English.
- Be specific and practical.
- Do not invent fake experience.
- Make the profile sound employable but truthful.
- Improved headline should be clear, searchable and recruiter-friendly.
- Improved About section should be professional, natural and not cringe.
- recruiterKeywords should be comma-separated.
- Scores must be integers from 0 to 100.
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error("LinkedIn optimiser error:", error)

    res.status(500).json({
      error:"LinkedIn optimiser failed."
    })
  }
})

app.post("/api/resume-tailor", async (req, res)=>{
  try{
    const userId = req.user.id
    const {
      targetRole,
      jobDescription,
      summary,
      skills,
      experience
    } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "resume_tailor",
      FREE_LIMITS.resume_tailor
    )

    if(!usage.allowed){
      return res.status(403).json({
        error:usage.error
      })
    }

    const prompt = `
You are JobReady, an elite UK CV tailoring expert, ATS specialist and recruiter.

Compare this CV content against the target job advert and produce a realistic tailoring report.

Target role:
${targetRole || "Not provided"}

Job advert:
${jobDescription || "Not provided"}

Current CV summary:
${summary || "Not provided"}

Current CV skills:
${skills || "Not provided"}

Current CV experience:
${experience || "Not provided"}

Return ONLY valid JSON with this exact structure:

{
  "atsScore": 0,
  "recruiterScore": 0,
  "interviewChance": 0,
  "missingKeywords": "keyword one, keyword two, keyword three",
  "improvedSummary": "...",
  "improvedSkills": "...",
  "improvedExperience": "...",
  "priorityFixes": "...",
  "aiFeedback": "..."
}

Rules:
- Use UK English.
- Scores must be integers from 0 to 100.
- Do not invent fake experience, employers, education, or qualifications.
- Keep improvements truthful and based on the user's provided content.
- Improve keyword alignment naturally.
- improvedSkills should be concise and comma-separated or grouped clearly.
- improvedExperience should use strong CV bullet points where possible.
- priorityFixes should be practical and specific.
- aiFeedback should explain what is missing, what is strong, and what to improve first.
- Focus on getting interviews, not just ATS.
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error("Resume tailor error:", error)

    res.status(500).json({
      error:"Resume tailor failed."
    })
  }
})

app.post("/api/career-assistant", async (req, res)=>{
  try{
    const userId = req.user.id
    const { message } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "career_assistant",
      FREE_LIMITS.career_assistant
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:buildCareerAssistantPrompt(message)
    })

    res.json({ reply:response.output_text })

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Career assistant failed." })
  }
})

app.post("/api/career-assistant-stream", async (req, res)=>{
  try{
    const userId = req.user.id
    const { message } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "career_assistant",
      FREE_LIMITS.career_assistant
    )

    if(!usage.allowed){
      res.status(403).write(usage.error)
      return res.end()
    }

    res.setHeader("Content-Type", "text/plain; charset=utf-8")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")
    res.flushHeaders?.()

    const stream = await client.responses.create({
      model:"gpt-4.1-mini",
      input:buildCareerAssistantPrompt(message),
      stream:true
    })

    for await (const event of stream){
      if(event.type === "response.output_text.delta"){
        res.write(event.delta)
      }
    }

    res.end()

  }catch(error){
    console.error(error)

    if(!res.headersSent){
      res.status(500)
    }

    res.end("Career assistant streaming failed.")
  }
})

app.post("/api/advanced-cv-score", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobTitle, summary, skills, experience, education, jobDescription } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "advanced_cv_score",
      FREE_LIMITS.advanced_cv_score
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
You are JobReady, a senior UK recruiter, ATS specialist and hiring manager.

Analyse this CV like a premium recruiter intelligence tool.

Rules:
- Be realistic.
- Do not exaggerate.
- Use UK English.
- Score honestly from 0 to 100.
- Give specific improvement advice.
- Focus on getting interviews, not just ATS.
- Return ONLY valid JSON.

Target role:
${jobTitle || "Not provided"}

Job advert:
${jobDescription || "Not provided"}

CV:
Summary:
${summary || ""}

Skills:
${skills || ""}

Experience:
${experience || ""}

Education:
${education || ""}

Return JSON:
{
  "atsScore": 0,
  "recruiterReadability": 0,
  "keywordStrength": 0,
  "experienceImpact": 0,
  "interviewPotential": 0,
  "seniorityLevel": "...",
  "overallVerdict": "...",
  "topStrengths": ["...", "...", "..."],
  "biggestWeaknesses": ["...", "...", "..."],
  "priorityFixes": ["...", "...", "..."],
  "recruiterInsight": "..."
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Advanced CV score failed." })
  }
})

app.post("/api/bullet-generator", async (req, res)=>{
  try{
    const userId = req.user.id
    const { targetRole, duty, industry, tone } = req.body

    if(!duty || !String(duty).trim()){
      return res.status(400).json({ error:"Describe the duty or task first." })
    }

    const usage = await checkAndTrackUsage(
      userId,
      "bullet_generator",
      FREE_LIMITS.bullet_generator
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
You are JobReady, a senior UK recruiter and CV strategist.

Turn this duty into strong CV bullet points. Stay truthful: do not invent
numbers, employers or results that the user did not give.

Target role:
${targetRole || "Not provided"}

Industry:
${industry || "Not provided"}

Tone:
${tone || "Professional"}

Duty or task:
${duty}

Return ONLY valid JSON:
{
  "bullets": "3 to 5 CV bullet points as a markdown list",
  "achievementVersion": "one bullet rewritten to lead with the result",
  "keywords": "comma separated keywords an applicant tracking system would look for",
  "strengthScore": 0
}

strengthScore is a number from 0 to 100 for how strong the bullets are.
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Bullet generator failed." })
  }
})

app.post("/api/rewrite-cv", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobTitle, summary, skills, experience, education, jobDescription } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "rewrite_cv",
      FREE_LIMITS.rewrite_cv
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
You are JobReady, a senior UK recruiter and CV strategist.

Improve this CV truthfully and professionally.

Target job:
${jobTitle || "Not provided"}

Job advert:
${jobDescription || "Not provided"}

Summary:
${summary || ""}

Skills:
${skills || ""}

Experience:
${experience || ""}

Education:
${education || ""}

Return ONLY valid JSON:
{
  "summary": "...",
  "skills": "...",
  "experience": "...",
  "education": "..."
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"AI rewrite failed." })
  }
})

app.post("/api/humanise-cv", async (req, res)=>{
  try{
    const userId = req.user.id
    const { summary, skills, experience, education } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "humanise_cv",
      FREE_LIMITS.humanise_cv
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
Humanise this CV content. Keep it truthful, natural, professional, and UK English.

Summary:
${summary || ""}

Skills:
${skills || ""}

Experience:
${experience || ""}

Education:
${education || ""}

Return ONLY valid JSON:
{
  "summary": "...",
  "skills": "...",
  "experience": "...",
  "education": "..."
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"AI humanise failed." })
  }
})

app.post("/api/generate-cover-letter", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobTitle, fullName, summary, skills, experience, education, jobDescription } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "cover_letter",
      FREE_LIMITS.cover_letter
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
Write a natural UK cover letter.

Candidate:
${fullName || "Candidate"}

Target role:
${jobTitle || "Not provided"}

Summary:
${summary || ""}

Skills:
${skills || ""}

Experience:
${experience || ""}

Education:
${education || ""}

Job advert:
${jobDescription || ""}

Return only the cover letter text.
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json({ coverLetter:response.output_text })

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Cover letter generation failed." })
  }
})

app.post("/api/interview-prep", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobTitle, jobDescription, cvSummary, skills, experience } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "interview_prep",
      FREE_LIMITS.interview_prep
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
Create a realistic UK interview preparation pack.

Target job:
${jobTitle || "Not provided"}

Job advert:
${jobDescription || "Not provided"}

CV summary:
${cvSummary || ""}

Skills:
${skills || ""}

Experience:
${experience || ""}

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": "...",
      "whyTheyAsk": "...",
      "answerStrategy": "...",
      "strongExample": "..."
    }
  ],
  "overallAdvice": "...",
  "likelyFocusAreas": ["...", "...", "..."]
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Interview prep generation failed." })
  }
})

app.post("/api/interview-feedback", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobTitle, question, answer } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "interview_feedback",
      FREE_LIMITS.interview_feedback
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
Assess this UK interview answer realistically.

Job title:
${jobTitle || "Not provided"}

Question:
${question || ""}

Answer:
${answer || ""}

Return ONLY valid JSON:
{
  "score": 0,
  "hiringSignal": "...",
  "strengths": "...",
  "weaknesses": "...",
  "improvedAnswer": "...",
  "wouldProgress": "Yes / Maybe / No"
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Interview feedback failed." })
  }
})

app.post("/api/salary-path", async (req, res)=>{
  try{
    const userId = req.user.id
    const { jobRole, location, experienceLevel, skills } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "salary_path",
      FREE_LIMITS.salary_path
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
Create a realistic UK salary progression report.

Role:
${jobRole || "Not provided"}

Location:
${location || "United Kingdom"}

Experience:
${experienceLevel || "Not provided"}

Skills:
${skills || ""}

Return JSON:
{
  "role": "...",
  "location": "...",
  "juniorSalary": "...",
  "midSalary": "...",
  "seniorSalary": "...",
  "salarySummary": "...",
  "progressionPath": ["...", "...", "..."],
  "skillsToIncreaseSalary": ["...", "...", "..."],
  "nextBestMove": "...",
  "accuracyNote": "..."
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Salary path generation failed." })
  }
})

app.post("/api/career-coach", async (req, res)=>{
  try{
    const userId = req.user.id
    const { message, careerGoal, currentSkills, experience } = req.body

    const usage = await checkAndTrackUsage(
      userId,
      "career_coach",
      FREE_LIMITS.career_coach
    )

    if(!usage.allowed){
      return res.status(403).json({ error:usage.error })
    }

    const prompt = `
You are JobReady, a practical UK AI career coach.

User message:
${message || ""}

Career goal:
${careerGoal || "Not provided"}

Current skills:
${currentSkills || ""}

Experience:
${experience || ""}

Return ONLY valid JSON:
{
  "reply": "...",
  "nextSteps": ["...", "...", "..."],
  "skillsToBuild": ["...", "...", "..."],
  "jobSuggestions": ["...", "...", "..."]
}
`

    const response = await client.responses.create({
      model:"gpt-4.1-mini",
      input:prompt
    })

    res.json(
      JSON.parse(
        cleanJson(response.output_text)
      )
    )

  }catch(error){
    console.error(error)
    res.status(500).json({ error:"Career coach failed." })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log(`JobReady running on http://localhost:${PORT}`)
})