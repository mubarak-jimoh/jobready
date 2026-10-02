import {
  supabase,
  protectPage
}
from "/js/premium.js"

const logoutBtn = document.getElementById("logoutBtn")

const cvCount = document.getElementById("cvCount")
const bestScore = document.getElementById("bestScore")
const avgMatch = document.getElementById("avgMatch")
const recentCvList = document.getElementById("recentCvList")

const applicationsSent = document.getElementById("applicationsSent")
const interviewRate = document.getElementById("interviewRate")
const offerRate = document.getElementById("offerRate")
const careerStreak = document.getElementById("careerStreak")

const careerScore = document.getElementById("careerScore")
const careerScoreBar = document.getElementById("careerScoreBar")
const careerScoreLabel = document.getElementById("careerScoreLabel")
const careerScoreAdvice = document.getElementById("careerScoreAdvice")

const cvStrengthScore = document.getElementById("cvStrengthScore")
const momentumScore = document.getElementById("momentumScore")
const interviewReadinessScore = document.getElementById("interviewReadinessScore")
const profilePowerScore = document.getElementById("profilePowerScore")

const cvStrengthBar = document.getElementById("cvStrengthBar")
const momentumBar = document.getElementById("momentumBar")
const interviewReadinessBar = document.getElementById("interviewReadinessBar")
const profilePowerBar = document.getElementById("profilePowerBar")

const nextBestActionTitle = document.getElementById("nextBestActionTitle")
const nextBestActionText = document.getElementById("nextBestActionText")
const workflowAdvice = document.getElementById("workflowAdvice")
const nextActionsList = document.getElementById("nextActionsList")

const savedJobsCount = document.getElementById("savedJobsCount")
const appliedJobsCount = document.getElementById("appliedJobsCount")
const interviewJobsCount = document.getElementById("interviewJobsCount")
const offerJobsCount = document.getElementById("offerJobsCount")

const publicProfileCount = document.getElementById("publicProfileCount")
const linkedinReviewCount = document.getElementById("linkedinReviewCount")
const profileVisibilityAdvice = document.getElementById("profileVisibilityAdvice")

const weeklyProgress = document.getElementById("weeklyProgress")
const weeklyGoalText = document.getElementById("weeklyGoalText")

const downloadCount = document.getElementById("downloadCount")
const tailorReportCount = document.getElementById("tailorReportCount")
const interviewSessionCount = document.getElementById("interviewSessionCount")

let currentUser = null

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function clamp(value){
  return Math.min(Math.max(Math.round(value || 0), 0), 100)
}

function setBar(element, value){
  if(element){
    element.style.width =
    `${clamp(value)}%`
  }
}

function getScoreLabel(score){
  if(score >= 85) return "Elite application-ready"
  if(score >= 70) return "Strong progress"
  if(score >= 50) return "Building momentum"
  if(score >= 30) return "Foundation started"
  return "Getting started"
}

function getScoreAdvice(score){
  if(score >= 85){
    return "You are in a strong position. Keep tailoring applications and preparing for interviews."
  }

  if(score >= 70){
    return "Strong progress. Improve interview readiness and keep tracking applications."
  }

  if(score >= 50){
    return "Good foundation. Tailor your CV to live jobs and improve weak sections."
  }

  if(score >= 30){
    return "You have started. Build a stronger CV, add a profile and begin tracking applications."
  }

  return "Create your first CV, set your career profile and start building application momentum."
}

function calculateScores({
  cvTotal,
  highestAts,
  averageMatch,
  applications,
  interviews,
  offers,
  streakDays,
  hasCareerProfile,
  linkedinReviews,
  interviewSessions,
  bulletSets,
  tailorReports,
  publicProfiles
}){

  const cvStrength =
  clamp(
    (cvTotal > 0 ? 25 : 0) +
    Math.min(highestAts * 0.45, 45) +
    Math.min(averageMatch * 0.20, 20) +
    Math.min(tailorReports * 5, 10)
  )

  const momentum =
  clamp(
    Math.min(applications * 8, 50) +
    Math.min(streakDays * 8, 20) +
    Math.min(tailorReports * 5, 15) +
    Math.min(offers * 15, 15)
  )

  const interviewReadiness =
  clamp(
    Math.min(interviews * 16, 40) +
    Math.min(interviewSessions * 14, 45) +
    (interviews > 0 || interviewSessions > 0 ? 15 : 0)
  )

  const profilePower =
  clamp(
    (hasCareerProfile ? 35 : 0) +
    Math.min(linkedinReviews * 20, 30) +
    Math.min(bulletSets * 5, 15) +
    Math.min(publicProfiles * 20, 20)
  )

  const overall =
  clamp(
    cvStrength * 0.35 +
    momentum * 0.25 +
    interviewReadiness * 0.20 +
    profilePower * 0.20
  )

  return {
    cvStrength,
    momentum,
    interviewReadiness,
    profilePower,
    overall
  }
}

function renderNextActions({
  cvTotal,
  highestAts,
  averageMatch,
  applications,
  interviews,
  hasCareerProfile,
  linkedinReviews,
  interviewSessions,
  bulletSets,
  tailorReports,
  publicProfiles
}){

  const actions = []

  if(cvTotal === 0){
    actions.push({
      title:"Build your first CV",
      text:"Create a recruiter-ready CV so JobReady can start tracking your progress.",
      href:"builder.html",
      button:"Open Builder"
    })
  }

  if(cvTotal > 0 && highestAts < 75){
    actions.push({
      title:"Improve your CV strength",
      text:"Use AI rewriting and the bullet generator to strengthen weak sections.",
      href:"bullet-generator.html",
      button:"Improve Bullets"
    })
  }

  if(tailorReports === 0 || averageMatch < 65){
    actions.push({
      title:"Tailor your CV to a live job",
      text:"Paste a job advert and get missing keywords, match score and recruiter advice.",
      href:"resume-tailor.html",
      button:"Tailor CV"
    })
  }

  if(!hasCareerProfile){
    actions.push({
      title:"Set your career profile",
      text:"Add your target role, salary goal, strengths and skills to personalise JobReady.",
      href:"career-profile.html",
      button:"Set Profile"
    })
  }

  if(linkedinReviews === 0){
    actions.push({
      title:"Optimise your LinkedIn",
      text:"Improve your headline, About section and recruiter keywords.",
      href:"linkedin-optimiser.html",
      button:"Optimise LinkedIn"
    })
  }

  if(publicProfiles === 0){
    actions.push({
      title:"Create your public profile",
      text:"Build a recruiter-ready shareable profile with projects, skills and links.",
      href:"public-profile.html",
      button:"Create Profile"
    })
  }

  if(interviewSessions === 0 && interviews === 0){
    actions.push({
      title:"Practise one interview",
      text:"Generate realistic questions and get recruiter-style feedback before interviews.",
      href:"interview-simulator.html",
      button:"Start Practice"
    })
  }

  if(applications === 0){
    actions.push({
      title:"Track your first application",
      text:"Add an application so you can monitor momentum and conversion rate.",
      href:"job-tracker.html",
      button:"Track Job"
    })
  }

  if(actions.length === 0){
    actions.push({
      title:"Keep applying strategically",
      text:"Your setup is strong. Keep tailoring each application and tracking responses.",
      href:"job-tracker.html",
      button:"Open Tracker"
    })
  }

  const primary =
  actions[0]

  nextBestActionTitle.textContent =
  primary.title.replace("your ", "").replace("one ", "")

  nextBestActionText.textContent =
  primary.text

  workflowAdvice.textContent =
  primary.text

  nextActionsList.innerHTML =
  actions.slice(0, 4).map((action, index)=>`
    <div class="next-action-card">
      <span>${index + 1}</span>
      <div>
        <h4>${safeText(action.title)}</h4>
        <p>${safeText(action.text)}</p>
      </div>
      <a href="${action.href}" class="dashboard-btn">${safeText(action.button)}</a>
    </div>
  `).join("")
}

async function addCareerActivity(type){
  const { error } =
  await supabase
  .from("career_activity")
  .insert([{
    user_id:currentUser.id,
    activity_type:type
  }])

  if(error){
    console.error(error)
    alert("Could not update career activity.")
    return
  }

  await loadDashboard()
}

function renderActionButtons(){
  if(document.querySelector(".career-action-row")){
    return
  }

  const wrapper =
  document.createElement("div")

  wrapper.className =
  "career-action-row"

  wrapper.innerHTML =
  `
    <button class="dashboard-btn" id="addApplicationBtn">
      + Add Application
    </button>

    <button class="secondary-action-btn" id="addInterviewBtn">
      + Add Interview
    </button>

    <button class="secondary-action-btn" id="addOfferBtn">
      + Add Offer
    </button>
  `

  const section =
  document.querySelector(".career-command-grid")

  if(!section){
    return
  }

  section.after(wrapper)

  document
  .getElementById("addApplicationBtn")
  .addEventListener("click", async ()=>{
    await addCareerActivity("application")
  })

  document
  .getElementById("addInterviewBtn")
  .addEventListener("click", async ()=>{
    await addCareerActivity("interview")
  })

  document
  .getElementById("addOfferBtn")
  .addEventListener("click", async ()=>{
    await addCareerActivity("offer")
  })
}

async function countRows(tableName){
  const { count, error } =
  await supabase
  .from(tableName)
  .select("*", {
    count:"exact",
    head:true
  })
  .eq("user_id", currentUser.id)

  if(error){
    console.warn(`Could not count ${tableName}`, error)
    return 0
  }

  return count || 0
}

async function countRowsSafe(tableName){
  try{
    return await countRows(tableName)
  }catch(error){
    console.warn(`Optional analytics table missing: ${tableName}`, error)
    return 0
  }
}

async function loadCVStats(){
  const { data, error } =
  await supabase
  .from("cvs")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    return {
      cvTotal:0,
      highestAts:0,
      averageMatch:0
    }
  }

  const cvs =
  data || []

  cvCount.textContent =
  cvs.length

  if(cvs.length === 0){
    bestScore.textContent =
    "0%"

    avgMatch.textContent =
    "0%"

    recentCvList.innerHTML =
    `<p>No CVs saved yet. Build your first CV to start tracking your progress.</p>`

    return {
      cvTotal:0,
      highestAts:0,
      averageMatch:0
    }
  }

  const highestAts =
  Math.max(...cvs.map(cv => cv.ats_score || 0))

  bestScore.textContent =
  `${highestAts}%`

  const averageMatch =
  Math.round(
    cvs.reduce((sum, cv)=>{
      return sum + (cv.match_score || 0)
    }, 0) / cvs.length
  )

  avgMatch.textContent =
  `${averageMatch}%`

  recentCvList.innerHTML =
  ""

  cvs.slice(0,5).forEach((cv)=>{
    const div =
    document.createElement("div")

    div.className =
    "question-card dashboard-recent-card"

    div.innerHTML =
    `
      <h4>${safeText(cv.job_title || "Untitled CV")}</h4>

      <p><strong>ATS Score:</strong> ${cv.ats_score || 0}%</p>
      <p><strong>Match Score:</strong> ${cv.match_score || 0}%</p>

      <p>${safeText((cv.summary || "No summary").slice(0,160))}</p>
    `

    recentCvList.appendChild(div)
  })

  return {
    cvTotal:cvs.length,
    highestAts,
    averageMatch
  }
}

async function loadCareerStats(){
  const { data:activity, error } =
  await supabase
  .from("career_activity")
  .select("*")
  .eq("user_id", currentUser.id)

  if(error){
    console.error(error)
  }

  const rows =
  activity || []

  const applications =
  rows.filter(item => item.activity_type === "application").length

  const interviews =
  rows.filter(item => item.activity_type === "interview").length

  const offers =
  rows.filter(item => item.activity_type === "offer").length

  applicationsSent.textContent =
  applications

  const rate =
  applications > 0
  ? Math.round((interviews / applications) * 100)
  : 0

  interviewRate.textContent =
  `${rate}%`

  const offersRateValue =
  applications > 0
  ? Math.round((offers / applications) * 100)
  : 0

  offerRate.textContent =
  `${offersRateValue}%`

  const { data:careerProfile } =
  await supabase
  .from("career_profiles")
  .select("*")
  .eq("user_id", currentUser.id)
  .maybeSingle()

  const hasCareerProfile =
  !!careerProfile

  const uniqueDays =
  [
    ...new Set(
      rows.map(item =>
        new Date(item.created_at)
        .toISOString()
        .slice(0,10)
      )
    )
  ]

  const streakDays =
  uniqueDays.length

  careerStreak.textContent =
  `${streakDays} Days`

  return {
    applications,
    interviews,
    offers,
    streakDays,
    hasCareerProfile
  }
}

async function loadJobPipeline(){
  const { data, error } =
  await supabase
  .from("job_applications")
  .select("*")
  .eq("user_id", currentUser.id)

  if(error){
    console.warn("Could not load job pipeline:", error)

    return {
      saved:0,
      applied:0,
      interviews:0,
      offers:0
    }
  }

  const rows =
  data || []

  const saved =
  rows.length

  const applied =
  rows.filter(job => job.status === "Applied").length

  const interviews =
  rows.filter(job => job.status === "Interview").length

  const offers =
  rows.filter(job => job.status === "Offer").length

  savedJobsCount.textContent =
  saved

  appliedJobsCount.textContent =
  applied

  interviewJobsCount.textContent =
  interviews

  offerJobsCount.textContent =
  offers

  return {
    saved,
    applied,
    interviews,
    offers
  }
}

function updateWeeklyGoal({
  applications,
  tailorReports,
  interviewSessions,
  bulletSets,
  linkedinReviews
}){
  const actions =
  Math.min(applications, 2) +
  Math.min(tailorReports, 1) +
  Math.min(interviewSessions, 1) +
  Math.min(bulletSets, 1) +
  Math.min(linkedinReviews, 1)

  const goal =
  5

  const percentage =
  clamp((actions / goal) * 100)

  weeklyProgress.textContent =
  `${percentage}%`

  weeklyGoalText.textContent =
  `${Math.min(actions, goal)} / ${goal} actions complete`
}

async function loadDashboard(){
  currentUser =
  await protectPage()

  const cvStats =
  await loadCVStats()

  const careerStats =
  await loadCareerStats()

  const pipeline =
  await loadJobPipeline()

  const linkedinReviews =
  await countRowsSafe("linkedin_reviews")

  const interviewSessions =
  await countRowsSafe("interview_simulations")

  const bulletSets =
  await countRowsSafe("bullet_sets")

  const tailorReports =
  await countRowsSafe("resume_tailor_reports")

  const publicProfiles =
  await countRowsSafe("public_profiles")

  const downloads =
  await countRowsSafe("cv_downloads")

  linkedinReviewCount.textContent =
  linkedinReviews

  publicProfileCount.textContent =
  publicProfiles

  downloadCount.textContent =
  downloads

  tailorReportCount.textContent =
  tailorReports

  interviewSessionCount.textContent =
  interviewSessions

  if(publicProfiles > 0 && linkedinReviews > 0){
    profileVisibilityAdvice.textContent =
    "Your visibility setup is strong. Keep sharing your public profile with recruiters."
  }else if(publicProfiles > 0){
    profileVisibilityAdvice.textContent =
    "Your public profile is ready. Optimise LinkedIn next to improve recruiter trust."
  }else{
    profileVisibilityAdvice.textContent =
    "Create a public profile and optimise LinkedIn to improve recruiter visibility."
  }

  updateWeeklyGoal({
    applications:careerStats.applications + pipeline.applied,
    tailorReports,
    interviewSessions,
    bulletSets,
    linkedinReviews
  })

  const scores =
  calculateScores({
    cvTotal:cvStats.cvTotal,
    highestAts:cvStats.highestAts,
    averageMatch:cvStats.averageMatch,
    applications:careerStats.applications + pipeline.applied,
    interviews:careerStats.interviews + pipeline.interviews,
    offers:careerStats.offers + pipeline.offers,
    streakDays:careerStats.streakDays,
    hasCareerProfile:careerStats.hasCareerProfile,
    linkedinReviews,
    interviewSessions,
    bulletSets,
    tailorReports,
    publicProfiles
  })

  careerScore.textContent =
  scores.overall

  careerScoreLabel.textContent =
  getScoreLabel(scores.overall)

  careerScoreAdvice.textContent =
  getScoreAdvice(scores.overall)

  setBar(careerScoreBar, scores.overall)

  cvStrengthScore.textContent =
  `${scores.cvStrength}%`

  momentumScore.textContent =
  `${scores.momentum}%`

  interviewReadinessScore.textContent =
  `${scores.interviewReadiness}%`

  profilePowerScore.textContent =
  `${scores.profilePower}%`

  setBar(cvStrengthBar, scores.cvStrength)
  setBar(momentumBar, scores.momentum)
  setBar(interviewReadinessBar, scores.interviewReadiness)
  setBar(profilePowerBar, scores.profilePower)

  renderNextActions({
    cvTotal:cvStats.cvTotal,
    highestAts:cvStats.highestAts,
    averageMatch:cvStats.averageMatch,
    applications:careerStats.applications + pipeline.applied,
    interviews:careerStats.interviews + pipeline.interviews,
    hasCareerProfile:careerStats.hasCareerProfile,
    linkedinReviews,
    interviewSessions,
    bulletSets,
    tailorReports,
    publicProfiles
  })
}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

await loadDashboard()
renderActionButtons()