import {
  apiFetch,
  supabase,
  protectPage
}
from "/js/premium.js"

import { marked }
from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

const logoutBtn = document.getElementById("logoutBtn")
const analyseOpportunityTopBtn = document.getElementById("analyseOpportunityTopBtn")
const analyseOpportunityBtn = document.getElementById("analyseOpportunityBtn")

const typeInput = document.getElementById("typeInput")
const companyInput = document.getElementById("companyInput")
const roleInput = document.getElementById("roleInput")
const locationInput = document.getElementById("locationInput")
const deadlineInput = document.getElementById("deadlineInput")
const applyLinkInput = document.getElementById("applyLinkInput")
const requirementsInput = document.getElementById("requirementsInput")
const descriptionInput = document.getElementById("descriptionInput")
const backgroundInput = document.getElementById("backgroundInput")

const savedCount = document.getElementById("savedCount")
const deadlineCount = document.getElementById("deadlineCount")
const bestMatch = document.getElementById("bestMatch")
const opportunityStrength = document.getElementById("opportunityStrength")
const opportunityStrengthBar = document.getElementById("opportunityStrengthBar")
const requirementMatch = document.getElementById("requirementMatch")
const priorityStatus = document.getElementById("priorityStatus")
const strategyOutput = document.getElementById("strategyOutput")
const standoutOutput = document.getElementById("standoutOutput")
const opportunityList = document.getElementById("opportunityList")

let currentUser = null

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function extractScore(text){
  const scoreLine = String(text || "").match(/match[^0-9]*(\d{1,3})\s?%/i)

  if(scoreLine){
    return Math.min(Number(scoreLine[1]), 100)
  }

  const anyPercent = String(text || "").match(/(\d{1,3})\s?%/)

  if(!anyPercent){
    return 0
  }

  return Math.min(Number(anyPercent[1]), 100)
}

function calculateInputStrength(){
  let score = 0

  if(typeInput.value) score += 10
  if(companyInput.value.trim().length > 2) score += 10
  if(roleInput.value.trim().length > 2) score += 15
  if(locationInput.value.trim().length > 2) score += 5
  if(deadlineInput.value) score += 10
  if(applyLinkInput.value.trim().length > 8) score += 10
  if(requirementsInput.value.trim().length > 20) score += 20
  if(descriptionInput.value.trim().length > 40) score += 20

  return Math.min(score, 100)
}

function updateInputMeta(){
  const strength = calculateInputStrength()

  opportunityStrength.textContent = `${strength}%`
  opportunityStrengthBar.style.width = `${strength}%`

  if(strength >= 80){
    priorityStatus.textContent = "Apply strong"
  }else if(strength >= 55){
    priorityStatus.textContent = "Add evidence"
  }else if(strength >= 30){
    priorityStatus.textContent = "Add advert"
  }else{
    priorityStatus.textContent = "Find role"
  }
}

function setAnalyseState(active){
  if(active){
    analyseOpportunityBtn.textContent = "Analysing..."
    analyseOpportunityTopBtn.textContent = "Analysing..."
    analyseOpportunityBtn.classList.add("loading-state")
    analyseOpportunityTopBtn.classList.add("loading-state")
  }else{
    analyseOpportunityBtn.textContent = "Analyse & Save"
    analyseOpportunityTopBtn.textContent = "Analyse Opportunity"
    analyseOpportunityBtn.classList.remove("loading-state")
    analyseOpportunityTopBtn.classList.remove("loading-state")
  }
}

function clearForm(){
  companyInput.value = ""
  roleInput.value = ""
  locationInput.value = ""
  deadlineInput.value = ""
  applyLinkInput.value = ""
  requirementsInput.value = ""
  descriptionInput.value = ""
  backgroundInput.value = ""
  updateInputMeta()
}

function daysUntil(dateString){
  if(!dateString){
    return null
  }

  const today = new Date()
  const deadline = new Date(dateString)
  const difference = deadline - today

  return Math.ceil(difference / (1000 * 60 * 60 * 24))
}

async function askAI(message){
  const response = await apiFetch("/api/career-assistant", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      userId:currentUser.id,
      message
    })
  })

  const data = await response.json()

  if(data.error){
    throw new Error(data.error)
  }

  return data.reply || ""
}

async function analyseOpportunity(){
  currentUser = await protectPage()

  if(roleInput.value.trim().length < 2){
    alert("Enter the role title first.")
    return
  }

  if(descriptionInput.value.trim().length < 40 && requirementsInput.value.trim().length < 20){
    alert("Paste the advert or requirements first.")
    return
  }

  try{
    setAnalyseState(true)

    const feedback = await askAI(`
Act as a UK apprenticeship, graduate scheme and early-career application coach.

Analyse this opportunity and the candidate's background.

Opportunity type:
${typeInput.value}

Company / provider:
${companyInput.value || "Not provided"}

Role title:
${roleInput.value}

Location:
${locationInput.value || "Not provided"}

Deadline:
${deadlineInput.value || "Not provided"}

Requirements:
${requirementsInput.value || "Not provided"}

Advert / description:
${descriptionInput.value || "Not provided"}

Candidate background:
${backgroundInput.value || "Not provided"}

Return markdown with this exact structure:

# Match Score
Give a requirement match percentage from 0% to 100%.

# Requirements Explained
Explain the requirements in simple language.

# Candidate Match
What already fits.

# Gaps To Fix
What the candidate needs to improve before applying.

# How To Stand Out
Give practical standout ideas: projects, evidence, employer research, volunteering, portfolio, achievements.

# CV Angle
How the candidate should position their CV.

# Cover Letter Angle
What story they should tell.

# Interview Prep
Likely questions and how to prepare.

# Application Checklist
Step-by-step actions before applying.

Rules:
- Use UK English.
- Be realistic and honest.
- Do not invent experience.
- Focus on apprenticeships, degree apprenticeships, graduate schemes and early careers.
- Make advice specific to the opportunity.
`)

    const score = extractScore(feedback)

    requirementMatch.textContent = `${score}%`
    bestMatch.textContent = `${score}%`

    strategyOutput.innerHTML = marked.parse(feedback)

    standoutOutput.innerHTML = marked.parse(`
**Standout focus for this application:**

${feedback.split("# How To Stand Out")[1]?.split("# CV Angle")[0] || "Use the full strategy report to strengthen your application."}
`)

    const { error } = await supabase
    .from("apprenticeship_opportunities")
    .insert([{
      user_id:currentUser.id,
      opportunity_type:typeInput.value,
      company:companyInput.value,
      role_title:roleInput.value,
      location:locationInput.value,
      deadline:deadlineInput.value || null,
      apply_link:applyLinkInput.value,
      requirements:requirementsInput.value,
      description:descriptionInput.value,
      background:backgroundInput.value,
      match_score:score,
      ai_strategy:feedback
    }])

    if(error){
      console.error(error)
      alert("Strategy generated, but could not save.")
      return
    }

    clearForm()
    await loadOpportunities()

  }catch(error){
    console.error(error)
    alert(error.message || "Opportunity analysis failed. Make sure backend is running.")
  }finally{
    setAnalyseState(false)
  }
}

async function loadOpportunities(){
  const { data, error } = await supabase
  .from("apprenticeship_opportunities")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    opportunityList.innerHTML = "<p>Could not load opportunities.</p>"
    return
  }

  const rows = data || []

  savedCount.textContent = rows.length

  const upcoming = rows.filter((item)=>{
    const days = daysUntil(item.deadline)
    return days !== null && days >= 0 && days <= 30
  }).length

  deadlineCount.textContent = upcoming

  const topScore = rows.reduce((max, item)=>{
    return Math.max(max, item.match_score || 0)
  }, 0)

  bestMatch.textContent = `${topScore}%`

  if(rows.length === 0){
    opportunityList.innerHTML = "<p>No saved opportunities yet.</p>"
    return
  }

  opportunityList.innerHTML = ""

  rows.slice(0, 10).forEach((item)=>{
    const card = document.createElement("div")
    card.className = "question-card dashboard-recent-card"

    const days = daysUntil(item.deadline)

    const deadlineText =
    item.deadline
    ? `${safeText(item.deadline)}${days !== null ? ` (${days} days)` : ""}`
    : "Not set"

    const applyLink =
    item.apply_link
    ? `<a class="small-btn view-btn" href="${safeText(item.apply_link)}" target="_blank" rel="noopener noreferrer">Apply</a>`
    : ""

    card.innerHTML =
    `
      <h4>${safeText(item.role_title || "Opportunity")}</h4>
      <p><strong>Type:</strong> ${safeText(item.opportunity_type || "-")}</p>
      <p><strong>Company:</strong> ${safeText(item.company || "-")}</p>
      <p><strong>Deadline:</strong> ${deadlineText}</p>
      <p><strong>Match:</strong> ${item.match_score || 0}%</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-opportunity-btn">View Strategy</button>
        ${applyLink}
        <button class="small-btn danger-btn delete-opportunity-btn">Delete</button>
      </div>
    `

    card.querySelector(".view-opportunity-btn").addEventListener("click", ()=>{
      requirementMatch.textContent = `${item.match_score || 0}%`
      strategyOutput.innerHTML = marked.parse(item.ai_strategy || "No strategy saved.")
      standoutOutput.innerHTML = marked.parse(`
**Standout focus:**

${item.ai_strategy?.split("# How To Stand Out")[1]?.split("# CV Angle")[0] || "Use the saved strategy to improve your application."}
      `)

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card.querySelector(".delete-opportunity-btn").addEventListener("click", async ()=>{
      const confirmDelete = confirm("Delete this opportunity?")

      if(!confirmDelete){
        return
      }

      const { error } = await supabase
      .from("apprenticeship_opportunities")
      .delete()
      .eq("id", item.id)

      if(error){
        console.error(error)
        alert("Could not delete opportunity.")
        return
      }

      await loadOpportunities()
    })

    opportunityList.appendChild(card)
  })
}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

analyseOpportunityBtn.addEventListener("click", analyseOpportunity)
analyseOpportunityTopBtn.addEventListener("click", analyseOpportunity)

;[
  typeInput,
  companyInput,
  roleInput,
  locationInput,
  deadlineInput,
  applyLinkInput,
  requirementsInput,
  descriptionInput,
  backgroundInput
].forEach((input)=>{
  input.addEventListener("input", updateInputMeta)
  input.addEventListener("change", updateInputMeta)
})

currentUser = await protectPage()

updateInputMeta()

await loadOpportunities()