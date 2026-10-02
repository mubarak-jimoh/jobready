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

const tailorTopBtn =
document.getElementById("tailorTopBtn")

const tailorStripBtn =
document.getElementById("tailorStripBtn")

const tailorBtn =
document.getElementById("tailorBtn")

const targetRoleInput =
document.getElementById("targetRoleInput")

const companyInput =
document.getElementById("companyInput")

const jobDescriptionInput =
document.getElementById("jobDescriptionInput")

const summaryInput =
document.getElementById("summaryInput")

const skillsInput =
document.getElementById("skillsInput")

const experienceInput =
document.getElementById("experienceInput")

const educationInput =
document.getElementById("educationInput")

const atsScore =
document.getElementById("atsScore")

const recruiterScore =
document.getElementById("recruiterScore")

const interviewChance =
document.getElementById("interviewChance")

const heroMatchScore =
document.getElementById("heroMatchScore")

const matchScoreBar =
document.getElementById("matchScoreBar")

const keywordDensityScore =
document.getElementById("keywordDensityScore")

const keywordDensityBar =
document.getElementById("keywordDensityBar")

const evidenceStrengthScore =
document.getElementById("evidenceStrengthScore")

const evidenceStrengthBar =
document.getElementById("evidenceStrengthBar")

const roleAlignmentScore =
document.getElementById("roleAlignmentScore")

const roleAlignmentBar =
document.getElementById("roleAlignmentBar")

const atsRiskStatus =
document.getElementById("atsRiskStatus")

const keywordCount =
document.getElementById("keywordCount")

const priorityStatus =
document.getElementById("priorityStatus")

const feedbackOutput =
document.getElementById("feedbackOutput")

const keywordsOutput =
document.getElementById("keywordsOutput")

const matchedKeywordsOutput =
document.getElementById("matchedKeywordsOutput")

const matchedKeywordCount =
document.getElementById("matchedKeywordCount")

const missingKeywordCount =
document.getElementById("missingKeywordCount")

const keywordCoverageOutput =
document.getElementById("keywordCoverageOutput")

const atsRiskOutput =
document.getElementById("atsRiskOutput")

const summaryOutput =
document.getElementById("summaryOutput")

const skillsOutput =
document.getElementById("skillsOutput")

const experienceOutput =
document.getElementById("experienceOutput")

const copySummaryBtn =
document.getElementById("copySummaryBtn")

const copySkillsBtn =
document.getElementById("copySkillsBtn")

const copyExperienceBtn =
document.getElementById("copyExperienceBtn")

const saveReportBtn =
document.getElementById("saveReportBtn")

const sendToBuilderBtn =
document.getElementById("sendToBuilderBtn")

const savedReportsList =
document.getElementById("savedReportsList")

let currentUser = null
let latestSummary = ""
let latestSkills = ""
let latestExperience = ""
let latestReportData = null
let latestMatchedKeywords = []
let latestMissingKeywords = []

const keywordBank = [
  "communication",
  "teamwork",
  "customer service",
  "problem solving",
  "organisation",
  "leadership",
  "time management",
  "sales",
  "cash handling",
  "microsoft office",
  "data entry",
  "attention to detail",
  "adaptability",
  "reliability",
  "targets",
  "stock",
  "inventory",
  "administration",
  "support",
  "training",
  "reporting",
  "excel",
  "sql",
  "python",
  "power bi",
  "analysis",
  "stakeholder",
  "project",
  "crm",
  "kpi",
  "dashboard",
  "data cleaning",
  "visualisation",
  "analytics",
  "presentation",
  "documentation",
  "quality assurance",
  "risk",
  "compliance",
  "budgeting",
  "forecasting",
  "reconciliation",
  "javascript",
  "html",
  "css",
  "react",
  "node",
  "api",
  "git",
  "cybersecurity",
  "networking",
  "linux",
  "troubleshooting",
  "safeguarding",
  "confidentiality",
  "patient",
  "care",
  "marketing",
  "campaign",
  "content",
  "social media"
]

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function splitKeywords(text){
  return String(text || "")
  .split(/,|\n/)
  .map(item => item.trim())
  .filter(Boolean)
}

function getCvText(){
  return `
    ${targetRoleInput.value}
    ${summaryInput.value}
    ${skillsInput.value}
    ${experienceInput.value}
    ${educationInput?.value || ""}
  `.toLowerCase()
}

function extractAdvertKeywords(){
  const advert =
  jobDescriptionInput.value.toLowerCase()

  const bankMatches =
  keywordBank.filter(keyword =>
    advert.includes(keyword)
  )

  const roleWords =
  targetRoleInput.value
  .toLowerCase()
  .split(/\s+/)
  .filter(word => word.length > 3)

  return [
    ...new Set([
      ...bankMatches,
      ...roleWords
    ])
  ]
}

function calculateLocalScan(){
  const cvText =
  getCvText()

  const advertKeywords =
  extractAdvertKeywords()

  const matched =
  advertKeywords.filter(keyword =>
    cvText.includes(keyword)
  )

  const missing =
  advertKeywords.filter(keyword =>
    !cvText.includes(keyword)
  )

  const coverage =
  advertKeywords.length
  ? Math.round((matched.length / advertKeywords.length) * 100)
  : 0

  const evidence =
  Math.min(
    100,
    25 +
    (/\d/.test(cvText) ? 25 : 0) +
    (experienceInput.value.length > 120 ? 20 : 0) +
    (["achieved","improved","delivered","managed","created","analysed","supported"].some(word => cvText.includes(word)) ? 20 : 0) +
    (educationInput?.value.length > 20 ? 10 : 0)
  )

  const role =
  targetRoleInput.value.toLowerCase()

  const roleAlignment =
  Math.min(
    100,
    30 +
    (summaryInput.value.toLowerCase().includes(role) && role.length > 2 ? 25 : 0) +
    (skillsInput.value.length > 40 ? 20 : 0) +
    (experienceInput.value.length > 80 ? 15 : 0) +
    (companyInput?.value ? 10 : 0)
  )

  return {
    matched,
    missing,
    coverage,
    evidence,
    roleAlignment
  }
}

function updatePriority(score){
  if(!priorityStatus){
    return
  }

  if(score >= 80){
    priorityStatus.textContent =
    "Strong match"
  }else if(score >= 60){
    priorityStatus.textContent =
    "Improve keywords"
  }else if(score >= 40){
    priorityStatus.textContent =
    "Rewrite sections"
  }else{
    priorityStatus.textContent =
    "High risk"
  }
}

function renderKeywordChips(container, keywords, emptyText, chipClass){
  if(!container){
    return
  }

  if(!keywords || keywords.length === 0){
    container.innerHTML =
    `<p>${safeText(emptyText)}</p>`
    return
  }

  container.innerHTML =
  keywords
  .map(keyword => `<span class="keyword-chip ${chipClass || ""}">${safeText(keyword)}</span>`)
  .join("")
}

function renderRisks(scan, ats){
  const risks = []

  if(jobDescriptionInput.value.trim().length < 80){
    risks.push("Job advert is too short for accurate tailoring.")
  }

  if(summaryInput.value.trim().length < 50){
    risks.push("Summary is too thin and may not show role fit quickly.")
  }

  if(skillsInput.value.trim().length < 30){
    risks.push("Skills section may not contain enough role-specific keywords.")
  }

  if(experienceInput.value.trim().length < 80){
    risks.push("Experience section needs stronger proof and examples.")
  }

  if(!/\d/.test(getCvText())){
    risks.push("No measurable achievements or numbers detected.")
  }

  if(scan.missing.length > scan.matched.length){
    risks.push("More job advert keywords are missing than matched.")
  }

  if(ats < 55){
    risks.push("ATS match is currently weak for this role.")
  }

  if(atsRiskStatus){
    atsRiskStatus.textContent =
    risks.length === 0
    ? "Low"
    : risks.length <= 2
    ? "Medium"
    : "High"
  }

  if(!atsRiskOutput){
    return
  }

  atsRiskOutput.innerHTML =
  risks.length === 0
  ? `<p><strong>Low risk.</strong> Your CV is reasonably aligned. Keep tailoring truthful and specific.</p>`
  : `
    <ul>
      ${risks.slice(0, 6).map(risk => `<li>${safeText(risk)}</li>`).join("")}
    </ul>
  `
}

function renderKeywords(text){
  const apiMissing =
  splitKeywords(text)

  const localScan =
  calculateLocalScan()

  latestMatchedKeywords =
  localScan.matched

  latestMissingKeywords =
  apiMissing.length
  ? apiMissing
  : localScan.missing

  if(keywordCount){
    keywordCount.textContent =
    latestMissingKeywords.length
  }

  if(matchedKeywordCount){
    matchedKeywordCount.textContent =
    latestMatchedKeywords.length
  }

  if(missingKeywordCount){
    missingKeywordCount.textContent =
    latestMissingKeywords.length
  }

  if(keywordCoverageOutput){
    keywordCoverageOutput.textContent =
    `${localScan.coverage}%`
  }

  renderKeywordChips(
    matchedKeywordsOutput,
    latestMatchedKeywords,
    "No matched keywords yet.",
    "matched-keyword"
  )

  renderKeywordChips(
    keywordsOutput,
    latestMissingKeywords,
    "No missing keywords found.",
    "missing-keyword"
  )
}

function updateBreakdownScores(data){
  const scan =
  calculateLocalScan()

  const ats =
  data.atsScore || scan.coverage || 0

  const recruiter =
  data.recruiterScore || Math.round((scan.evidence + scan.roleAlignment) / 2)

  const interview =
  data.interviewChance || Math.round((ats + recruiter + scan.evidence) / 3)

  atsScore.textContent =
  `${ats}%`

  recruiterScore.textContent =
  `${recruiter}%`

  interviewChance.textContent =
  `${interview}%`

  if(heroMatchScore){
    heroMatchScore.textContent =
    `${ats}%`
  }

  if(matchScoreBar){
    matchScoreBar.style.width =
    `${ats}%`
  }

  if(keywordDensityScore){
    keywordDensityScore.textContent =
    `${scan.coverage}%`
  }

  if(keywordDensityBar){
    keywordDensityBar.style.width =
    `${scan.coverage}%`
  }

  if(evidenceStrengthScore){
    evidenceStrengthScore.textContent =
    `${scan.evidence}%`
  }

  if(evidenceStrengthBar){
    evidenceStrengthBar.style.width =
    `${scan.evidence}%`
  }

  if(roleAlignmentScore){
    roleAlignmentScore.textContent =
    `${scan.roleAlignment}%`
  }

  if(roleAlignmentBar){
    roleAlignmentBar.style.width =
    `${scan.roleAlignment}%`
  }

  updatePriority(ats)
  renderRisks(scan, ats)
}

function renderReport(data){
  latestReportData =
  data

  updateBreakdownScores(data)

  feedbackOutput.innerHTML =
  data.aiFeedback
  ? marked.parse(data.aiFeedback)
  : `
    <p><strong>Tailoring report generated.</strong></p>
    <p>Review the improved sections, missing keywords and ATS risks before applying.</p>
  `

  renderKeywords(
    data.missingKeywords || ""
  )

  latestSummary =
  data.improvedSummary || ""

  latestSkills =
  data.improvedSkills || ""

  latestExperience =
  data.improvedExperience || ""

  summaryOutput.innerHTML =
  latestSummary
  ? `<p>${safeText(latestSummary).replace(/\n/g, "<br>")}</p>`
  : `<p>No improved summary returned.</p>`

  skillsOutput.innerHTML =
  latestSkills
  ? `<p>${safeText(latestSkills).replace(/\n/g, "<br>")}</p>`
  : `<p>No improved skills returned.</p>`

  experienceOutput.innerHTML =
  latestExperience
  ? marked.parse(latestExperience)
  : `<p>No improved experience returned.</p>`
}

async function saveCurrentReport(){
  if(!latestReportData){
    alert("Run the tailor first before saving a report.")
    return
  }

  const { error } =
  await supabase
  .from("resume_tailor_reports")
  .insert([{
    user_id:currentUser.id,
    target_role:targetRoleInput.value,
    job_description:jobDescriptionInput.value,
    original_summary:summaryInput.value,
    original_skills:skillsInput.value,
    original_experience:experienceInput.value,
    ats_score:latestReportData.atsScore || 0,
    recruiter_score:latestReportData.recruiterScore || 0,
    interview_chance:latestReportData.interviewChance || 0,
    missing_keywords:latestReportData.missingKeywords || latestMissingKeywords.join(", "),
    improved_summary:latestSummary,
    improved_skills:latestSkills,
    improved_experience:latestExperience,
    priority_fixes:latestReportData.priorityFixes || "",
    ai_feedback:latestReportData.aiFeedback || ""
  }])

  if(error){
    console.error(error)
    alert("Could not save report.")
    return
  }

  alert("Tailoring report saved.")
  await loadSavedReports()
}

async function loadSavedReports(){
  const { data, error } =
  await supabase
  .from("resume_tailor_reports")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    savedReportsList.innerHTML =
    "<p>Could not load saved reports.</p>"

    return
  }

  const reports =
  data || []

  if(reports.length === 0){
    savedReportsList.innerHTML =
    "<p>No saved tailoring reports yet.</p>"
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
      <h4>${safeText(report.target_role || "Resume Tailor Report")}</h4>

      <p><strong>ATS Match:</strong> ${report.ats_score || 0}%</p>
      <p><strong>Recruiter Match:</strong> ${report.recruiter_score || 0}%</p>
      <p><strong>Interview Chance:</strong> ${report.interview_chance || 0}%</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-report-btn">View</button>
        <button class="small-btn danger-btn delete-report-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-report-btn")
    .addEventListener("click", ()=>{
      renderReport({
        atsScore:report.ats_score,
        recruiterScore:report.recruiter_score,
        interviewChance:report.interview_chance,
        missingKeywords:report.missing_keywords,
        improvedSummary:report.improved_summary,
        improvedSkills:report.improved_skills,
        improvedExperience:report.improved_experience,
        aiFeedback:report.ai_feedback
      })

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card
    .querySelector(".delete-report-btn")
    .addEventListener("click", async ()=>{
      const confirmDelete =
      confirm("Delete this tailoring report?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("resume_tailor_reports")
      .delete()
      .eq("id", report.id)

      if(error){
        console.error(error)
        alert("Could not delete report.")
        return
      }

      await loadSavedReports()
    })

    savedReportsList.appendChild(card)
  })
}

function setTailoringState(active){
  const buttons =
  [
    tailorBtn,
    tailorTopBtn,
    tailorStripBtn
  ].filter(Boolean)

  buttons.forEach((button)=>{
    if(active){
      button.textContent =
      "Tailoring..."

      button.classList.add(
        "loading-state"
      )
    }else{
      button.classList.remove(
        "loading-state"
      )
    }
  })

  if(!active){
    tailorBtn.textContent =
    "Tailor My CV"

    if(tailorTopBtn){
      tailorTopBtn.textContent =
      "Tailor CV"
    }

    if(tailorStripBtn){
      tailorStripBtn.textContent =
      "Run Tailor"
    }
  }
}

async function tailorResume(){
  currentUser =
  await protectPage()

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  if(jobDescriptionInput.value.trim().length < 40){
    alert("Paste a fuller job description first.")
    return
  }

  if(
    summaryInput.value.trim().length < 10 &&
    skillsInput.value.trim().length < 10 &&
    experienceInput.value.trim().length < 10
  ){
    alert("Paste at least one CV section before tailoring.")
    return
  }

  try{
    setTailoringState(true)

    const response =
    await apiFetch("/api/resume-tailor", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id,
        targetRole:targetRoleInput.value,
        company:companyInput?.value || "",
        jobDescription:jobDescriptionInput.value,
        summary:summaryInput.value,
        skills:skillsInput.value,
        experience:experienceInput.value,
        education:educationInput?.value || ""
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    renderReport(data)
    await saveCurrentReport()

  }catch(error){
    console.error(error)

    alert(
      "Resume tailoring failed. Make sure backend is running."
    )
  }finally{
    setTailoringState(false)
  }
}

function copyText(button, text, fallback){
  navigator.clipboard.writeText(
    text || fallback || ""
  )

  const original =
  button.textContent

  button.textContent =
  "Copied!"

  setTimeout(()=>{
    button.textContent =
    original
  }, 1500)
}

function sendToBuilder(){
  if(!latestSummary && !latestSkills && !latestExperience){
    alert("Run the tailor first before sending improvements to Builder.")
    return
  }

  localStorage.setItem(
    "jobready_imported_cv",
    JSON.stringify({
      fullName:"",
      jobTitle:targetRoleInput.value,
      summary:latestSummary || summaryInput.value,
      skills:latestSkills || skillsInput.value,
      experience:latestExperience || experienceInput.value,
      education:educationInput?.value || ""
    })
  )

  window.location.href =
  "builder.html"
}

copySummaryBtn.addEventListener("click", ()=>{
  copyText(copySummaryBtn, latestSummary, summaryOutput.innerText)
})

copySkillsBtn.addEventListener("click", ()=>{
  copyText(copySkillsBtn, latestSkills, skillsOutput.innerText)
})

copyExperienceBtn.addEventListener("click", ()=>{
  copyText(copyExperienceBtn, latestExperience, experienceOutput.innerText)
})

if(saveReportBtn){
  saveReportBtn.addEventListener("click", saveCurrentReport)
}

if(sendToBuilderBtn){
  sendToBuilderBtn.addEventListener("click", sendToBuilder)
}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()

  window.location.href =
  "login.html"
})

tailorBtn.addEventListener(
  "click",
  tailorResume
)

if(tailorTopBtn){
  tailorTopBtn.addEventListener(
    "click",
    tailorResume
  )
}

if(tailorStripBtn){
  tailorStripBtn.addEventListener(
    "click",
    tailorResume
  )
}

currentUser =
await protectPage()

await loadSavedReports()