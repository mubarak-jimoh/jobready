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

const analyseTopBtn =
document.getElementById("analyseTopBtn")

const companyInput =
document.getElementById("companyInput")

const jobTitleInput =
document.getElementById("jobTitleInput")

const jobLinkInput =
document.getElementById("jobLinkInput")

const locationInput =
document.getElementById("locationInput")

const salaryInput =
document.getElementById("salaryInput")

const statusInput =
document.getElementById("statusInput")

const jobDescriptionInput =
document.getElementById("jobDescriptionInput")

const cvNotesInput =
document.getElementById("cvNotesInput")

const analyseAndSaveBtn =
document.getElementById("analyseAndSaveBtn")

const jobFeedbackOutput =
document.getElementById("jobFeedbackOutput")

const jobList =
document.getElementById("jobList")

const totalJobs =
document.getElementById("totalJobs")

const interviewJobs =
document.getElementById("interviewJobs")

const bestMatch =
document.getElementById("bestMatch")

const savedJobs =
document.getElementById("savedJobs")

const appliedJobs =
document.getElementById("appliedJobs")

const offerJobs =
document.getElementById("offerJobs")

const nextBestAction =
document.getElementById("nextBestAction")

const pipelineStrength =
document.getElementById("pipelineStrength")

const pipelineStrengthBar =
document.getElementById("pipelineStrengthBar")

let currentUser = null

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function extractScore(text){

  const scoreLine =
  String(text || "").match(/score[^0-9]*(\d{1,3})\s?%/i)

  if(scoreLine){
    return Math.min(Number(scoreLine[1]), 100)
  }

  const match =
  String(text || "").match(/(\d{1,3})\s?%/)

  if(!match){
    return 0
  }

  const score =
  Number(match[1])

  if(score > 100){
    return 100
  }

  return score

}

function calculatePipelineStrength(jobs){

  if(jobs.length === 0){
    return 0
  }

  const averageMatch =
  Math.round(
    jobs.reduce((sum, job)=> sum + (job.match_score || 0), 0) / jobs.length
  )

  const interviews =
  jobs.filter(job => job.status === "Interview").length

  const offers =
  jobs.filter(job => job.status === "Offer").length

  let score =
  Math.min(jobs.length * 6, 30) +
  Math.min(averageMatch * 0.45, 45) +
  Math.min(interviews * 8, 16) +
  Math.min(offers * 9, 9)

  return Math.min(
    Math.round(score),
    100
  )

}

function clearForm(){

  companyInput.value = ""
  jobTitleInput.value = ""
  jobLinkInput.value = ""
  locationInput.value = ""
  salaryInput.value = ""
  statusInput.value = "Saved"
  jobDescriptionInput.value = ""
  cvNotesInput.value = ""

}

function statusClass(status){

  const clean =
  String(status || "Saved").toLowerCase()

  if(clean === "interview"){
    return "status-interview"
  }

  if(clean === "offer"){
    return "status-offer"
  }

  if(clean === "rejected"){
    return "status-rejected"
  }

  if(clean === "applied"){
    return "status-applied"
  }

  return "status-saved"

}

function updateNextBestAction(jobs){

  if(jobs.length === 0){
    nextBestAction.textContent =
    "Add Job"
    return
  }

  const saved =
  jobs.filter(job => job.status === "Saved").length

  const applied =
  jobs.filter(job => job.status === "Applied").length

  const interviews =
  jobs.filter(job => job.status === "Interview").length

  if(saved > 0){
    nextBestAction.textContent =
    "Apply"
    return
  }

  if(interviews > 0){
    nextBestAction.textContent =
    "Practise"
    return
  }

  if(applied > 0){
    nextBestAction.textContent =
    "Follow Up"
    return
  }

  nextBestAction.textContent =
  "Add Job"

}

async function loadJobs(){

  const { data, error } =
  await supabase
  .from("job_applications")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    jobList.innerHTML =
    "<p>Could not load jobs.</p>"
    return
  }

  const jobs =
  data || []

  const saved =
  jobs.filter(job => job.status === "Saved").length

  const applied =
  jobs.filter(job => job.status === "Applied").length

  const interviews =
  jobs.filter(job => job.status === "Interview").length

  const offers =
  jobs.filter(job => job.status === "Offer").length

  totalJobs.textContent =
  jobs.length

  savedJobs.textContent =
  saved

  appliedJobs.textContent =
  applied

  interviewJobs.textContent =
  interviews

  offerJobs.textContent =
  offers

  const topScore =
  jobs.reduce((max, job)=>{
    return Math.max(max, job.match_score || 0)
  }, 0)

  bestMatch.textContent =
  `${topScore}%`

  const pipeline =
  calculatePipelineStrength(
    jobs
  )

  pipelineStrength.textContent =
  `${pipeline}%`

  if(pipelineStrengthBar){
    pipelineStrengthBar.style.width =
    `${pipeline}%`
  }

  updateNextBestAction(
    jobs
  )

  if(jobs.length === 0){
    jobList.innerHTML =
    "<p>No saved jobs yet. Add your first job advert to start building your application pipeline.</p>"
    return
  }

  jobList.innerHTML =
  ""

  jobs.forEach((job)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card job-tracker-card"

    const jobLink =
    job.job_link
    ? `<a href="${safeText(job.job_link)}" target="_blank" rel="noopener noreferrer" class="small-btn view-btn">Open Job</a>`
    : ""

    card.innerHTML =
    `
      <div class="job-card-top-row">
        <div>
          <h4>${safeText(job.job_title || "Untitled Role")}</h4>
          <p><strong>Company:</strong> ${safeText(job.company || "-")}</p>
        </div>

        <span class="job-status-pill ${statusClass(job.status)}">
          ${safeText(job.status || "Saved")}
        </span>
      </div>

      <p><strong>Location:</strong> ${safeText(job.location || "-")}</p>
      <p><strong>Salary:</strong> ${safeText(job.salary || "-")}</p>
      <p><strong>Match:</strong> ${job.match_score || 0}%</p>

      <div class="job-match-mini-bar">
        <div style="width:${job.match_score || 0}%"></div>
      </div>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-job-btn">View Feedback</button>
        ${jobLink}
        <button class="small-btn danger-btn delete-job-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-job-btn")
    .addEventListener("click", ()=>{

      jobFeedbackOutput.innerHTML =
      marked.parse(job.ai_feedback || "No feedback saved.")

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card
    .querySelector(".delete-job-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this job application?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("job_applications")
      .delete()
      .eq("id", job.id)

      if(error){
        console.error(error)
        alert("Could not delete job.")
        return
      }

      await loadJobs()

    })

    jobList.appendChild(card)

  })

}

function setAnalyseState(active){

  if(active){

    analyseAndSaveBtn.textContent =
    "Analysing..."

    analyseTopBtn.textContent =
    "Analysing..."

    analyseAndSaveBtn.classList.add(
      "loading-state"
    )

    analyseTopBtn.classList.add(
      "loading-state"
    )

  }else{

    analyseAndSaveBtn.textContent =
    "Analyse & Save Job"

    analyseTopBtn.textContent =
    "Analyse & Save Job"

    analyseAndSaveBtn.classList.remove(
      "loading-state"
    )

    analyseTopBtn.classList.remove(
      "loading-state"
    )

  }

}

async function analyseAndSaveJob(){

  currentUser =
  await protectPage()

  if(jobTitleInput.value.trim().length < 2){
    alert("Enter a job title first.")
    return
  }

  if(jobDescriptionInput.value.trim().length < 40){
    alert("Paste a fuller job description first.")
    return
  }

  try{

    setAnalyseState(
      true
    )

    const response =
    await apiFetch("/api/career-assistant", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id,
        message:`
Analyse this job application match like a strict UK recruiter and job search strategist.

Job title:
${jobTitleInput.value}

Company:
${companyInput.value || "Not provided"}

Location:
${locationInput.value || "Not provided"}

Salary:
${salaryInput.value || "Not provided"}

Job description:
${jobDescriptionInput.value}

Candidate CV notes:
${cvNotesInput.value || "Not provided"}

Return markdown with this exact structure:

# Match Score
Give a percentage score from 0% to 100%.

# Strong Matches
# Missing Keywords
# CV Fixes Before Applying
# Cover Letter Angle
# Interview Risk Areas
# Application Strategy
# Next Best Action

Rules:
- Be realistic.
- Use UK English.
- Do not invent experience.
- Focus on what improves the application before applying.
- Make feedback specific to this job advert.
`
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    const feedback =
    data.reply || ""

    const score =
    extractScore(
      feedback
    )

    jobFeedbackOutput.innerHTML =
    marked.parse(feedback)

    const { error } =
    await supabase
    .from("job_applications")
    .insert([{
      user_id:currentUser.id,
      company:companyInput.value,
      job_title:jobTitleInput.value,
      job_link:jobLinkInput.value,
      location:locationInput.value,
      salary:salaryInput.value,
      status:statusInput.value,
      job_description:jobDescriptionInput.value,
      cv_notes:cvNotesInput.value,
      match_score:score,
      ai_feedback:feedback
    }])

    if(error){
      console.error(error)
      alert("Analysis completed, but job could not be saved.")
      return
    }

    clearForm()

    await loadJobs()

  }catch(error){

    console.error(error)

    alert(
      "Job analysis failed. Make sure backend is running."
    )

  }finally{

    setAnalyseState(
      false
    )

  }

}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

analyseAndSaveBtn.addEventListener(
  "click",
  analyseAndSaveJob
)

analyseTopBtn.addEventListener(
  "click",
  analyseAndSaveJob
)

currentUser =
await protectPage()

await loadJobs()