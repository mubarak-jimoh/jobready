import {
  apiFetch,
  supabase,
  protectPage
}
from "/js/premium.js"

import { marked }
from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

const logoutBtn =
document.getElementById("logoutBtn")

const generateTopBtn =
document.getElementById("generateTopBtn")

const generateBtn =
document.getElementById("generateBtn")

const applicationTypeInput =
document.getElementById("applicationTypeInput")

const companyInput =
document.getElementById("companyInput")

const targetRoleInput =
document.getElementById("targetRoleInput")

const jobDescriptionInput =
document.getElementById("jobDescriptionInput")

const backgroundInput =
document.getElementById("backgroundInput")

const applicationStrength =
document.getElementById("applicationStrength")

const applicationStrengthBar =
document.getElementById("applicationStrengthBar")

const matchScore =
document.getElementById("matchScore")

const savedCount =
document.getElementById("savedCount")

const applicationTypeStat =
document.getElementById("applicationTypeStat")

const priorityStatus =
document.getElementById("priorityStatus")

const applicationOutput =
document.getElementById("applicationOutput")

const copyOutputBtn =
document.getElementById("copyOutputBtn")

const savedReportsList =
document.getElementById("savedReportsList")

let currentUser = null
let latestOutput = ""

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function extractScore(text){

  const match =
  String(text || "").match(/match[^0-9]*(\d{1,3})\s?%/i) ||
  String(text || "").match(/score[^0-9]*(\d{1,3})\s?%/i) ||
  String(text || "").match(/(\d{1,3})\s?%/)

  if(!match){
    return 0
  }

  return Math.min(
    Number(match[1]),
    100
  )

}

function calculateStrength(){

  let score = 0

  if(applicationTypeInput.value) score += 10
  if(companyInput.value.trim().length > 2) score += 10
  if(targetRoleInput.value.trim().length > 2) score += 20
  if(jobDescriptionInput.value.trim().length > 50) score += 30
  if(backgroundInput.value.trim().length > 40) score += 30

  return Math.min(score, 100)

}

function updateMeta(){

  const strength =
  calculateStrength()

  applicationStrength.textContent =
  `${strength}%`

  applicationStrengthBar.style.width =
  `${strength}%`

  applicationTypeStat.textContent =
  applicationTypeInput.value
  .replace("Degree ", "")
  .replace("Job ", "Job")

  if(strength >= 80){
    priorityStatus.textContent =
    "Ready"
  }else if(strength >= 55){
    priorityStatus.textContent =
    "Add proof"
  }else if(strength >= 30){
    priorityStatus.textContent =
    "Add advert"
  }else{
    priorityStatus.textContent =
    "Start"
  }

}

function setGenerateState(active){

  if(active){

    generateBtn.textContent =
    "Generating..."

    generateTopBtn.textContent =
    "Generating..."

    generateBtn.classList.add(
      "loading-state"
    )

    generateTopBtn.classList.add(
      "loading-state"
    )

  }else{

    generateBtn.textContent =
    "Generate Application Pack"

    generateTopBtn.textContent =
    "Generate Application Pack"

    generateBtn.classList.remove(
      "loading-state"
    )

    generateTopBtn.classList.remove(
      "loading-state"
    )

  }

}

async function askAI(message){

  const response =
  await apiFetch("/api/career-assistant", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      userId:currentUser.id,
      message
    })
  })

  const data =
  await response.json()

  if(data.error){
    throw new Error(data.error)
  }

  return data.reply || ""

}

async function generateApplicationPack(){

  currentUser =
  await protectPage()

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter the target role first.")
    return
  }

  if(jobDescriptionInput.value.trim().length < 30){
    alert("Paste the job advert or application question first.")
    return
  }

  try{

    setGenerateState(
      true
    )

    const reply =
    await askAI(`
Act as an elite UK job application coach, recruiter and early-careers adviser.

Create a full application pack.

Application type:
${applicationTypeInput.value}

Company:
${companyInput.value || "Not provided"}

Target role:
${targetRoleInput.value}

Job advert or application question:
${jobDescriptionInput.value}

Candidate background:
${backgroundInput.value || "Not provided"}

Return markdown with this exact structure:

# Match Score
Give a percentage match score from 0% to 100%.

# Requirements Breakdown
Explain what the employer is really asking for.

# Best Application Angle
Explain the strongest story the candidate should use.

# Application Answer
Write a strong answer for a typical application question such as:
"Why are you interested in this role/company?"
Make it truthful and adaptable.

# STAR Example
Create a STAR-format example based only on the candidate background.

# CV Positioning
Explain how the CV should be positioned for this role.

# Cover Letter Angle
Give a focused cover letter strategy.

# Recruiter Email
Write a short professional recruiter email.

# LinkedIn Message
Write a concise LinkedIn connection message.

# Interview Prep
List likely interview questions and preparation advice.

# Final Checklist
Give practical steps before applying.

Rules:
- Use UK English.
- Be honest and realistic.
- Do not invent fake experience.
- If details are missing, say what the user should add.
- Keep outputs professional and usable.
`)

    latestOutput =
    reply

    const score =
    extractScore(reply)

    matchScore.textContent =
    `${score}%`

    applicationOutput.innerHTML =
    marked.parse(reply)

    const { error } =
    await supabase
    .from("application_assistant_reports")
    .insert([{
      user_id:currentUser.id,
      target_role:targetRoleInput.value,
      company:companyInput.value,
      application_type:applicationTypeInput.value,
      job_description:jobDescriptionInput.value,
      user_background:backgroundInput.value,
      match_score:score,
      ai_output:reply
    }])

    if(error){
      console.error(error)
      alert("Pack generated, but could not save.")
      return
    }

    await loadSavedReports()

  }catch(error){

    console.error(error)

    alert(
      error.message ||
      "Application pack failed. Make sure backend is running."
    )

  }finally{

    setGenerateState(
      false
    )

  }

}

async function loadSavedReports(){

  const { data, error } =
  await supabase
  .from("application_assistant_reports")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    savedReportsList.innerHTML =
    "<p>Could not load saved packs.</p>"
    return
  }

  const reports =
  data || []

  savedCount.textContent =
  reports.length

  if(reports.length === 0){
    savedReportsList.innerHTML =
    "<p>No saved application packs yet.</p>"
    return
  }

  savedReportsList.innerHTML =
  ""

  reports.slice(0, 8).forEach((report)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    card.innerHTML =
    `
      <h4>${safeText(report.target_role || "Application Pack")}</h4>

      <p><strong>Company:</strong> ${safeText(report.company || "-")}</p>
      <p><strong>Type:</strong> ${safeText(report.application_type || "-")}</p>
      <p><strong>Match:</strong> ${report.match_score || 0}%</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-pack-btn">View</button>
        <button class="small-btn danger-btn delete-pack-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-pack-btn")
    .addEventListener("click", ()=>{

      latestOutput =
      report.ai_output || ""

      applicationOutput.innerHTML =
      marked.parse(latestOutput)

      matchScore.textContent =
      `${report.match_score || 0}%`

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card
    .querySelector(".delete-pack-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this application pack?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("application_assistant_reports")
      .delete()
      .eq("id", report.id)

      if(error){
        console.error(error)
        alert("Could not delete pack.")
        return
      }

      await loadSavedReports()

    })

    savedReportsList.appendChild(card)

  })

}

copyOutputBtn.addEventListener("click", async ()=>{

  await navigator.clipboard.writeText(
    latestOutput || applicationOutput.innerText
  )

  copyOutputBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyOutputBtn.textContent =
    "Copy Full Pack"
  }, 1500)

})

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

generateBtn.addEventListener(
  "click",
  generateApplicationPack
)

generateTopBtn.addEventListener(
  "click",
  generateApplicationPack
)

;[
  applicationTypeInput,
  companyInput,
  targetRoleInput,
  jobDescriptionInput,
  backgroundInput
].forEach((input)=>{

  input.addEventListener(
    "input",
    updateMeta
  )

  input.addEventListener(
    "change",
    updateMeta
  )

})

currentUser =
await protectPage()

updateMeta()

await loadSavedReports()