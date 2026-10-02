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

const generateQuestionBtn =
document.getElementById("generateQuestionBtn")

const generateQuestionBtnSide =
document.getElementById("generateQuestionBtnSide")

const resetSessionBtn =
document.getElementById("resetSessionBtn")

const submitAnswerBtn =
document.getElementById("submitAnswerBtn")

const jobTitleInput =
document.getElementById("jobTitleInput")

const interviewTypeInput =
document.getElementById("interviewTypeInput")

const difficultyInput =
document.getElementById("difficultyInput")

const contextInput =
document.getElementById("contextInput")

const questionOutput =
document.getElementById("questionOutput")

const answerInput =
document.getElementById("answerInput")

const feedbackOutput =
document.getElementById("feedbackOutput")

const historyList =
document.getElementById("historyList")

const sessionCount =
document.getElementById("sessionCount")

const averageScore =
document.getElementById("averageScore")

const bestInterviewScore =
document.getElementById("bestInterviewScore")

const latestSignal =
document.getElementById("latestSignal")

const difficultyBadge =
document.getElementById("difficultyBadge")

const interviewReadinessBar =
document.getElementById("interviewReadinessBar")

const starScore =
document.getElementById("starScore")

const confidenceScore =
document.getElementById("confidenceScore")

const clarityScore =
document.getElementById("clarityScore")

const roleMatchScore =
document.getElementById("roleMatchScore")

const starScoreBar =
document.getElementById("starScoreBar")

const confidenceScoreBar =
document.getElementById("confidenceScoreBar")

const clarityScoreBar =
document.getElementById("clarityScoreBar")

const roleMatchScoreBar =
document.getElementById("roleMatchScoreBar")

const checkDeviceBtn =
document.getElementById("checkDeviceBtn")

const stopDeviceBtn =
document.getElementById("stopDeviceBtn")

const cameraStatus =
document.getElementById("cameraStatus")

const microphoneStatus =
document.getElementById("microphoneStatus")

const cameraPreview =
document.getElementById("cameraPreview")

const insertStarBtn =
document.getElementById("insertStarBtn")

const copyQuestionBtn =
document.getElementById("copyQuestionBtn")

let currentUser = null
let currentQuestion = ""
let mediaStream = null

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

function extractScore(text){
  const scoreLine =
  String(text || "").match(/score[^0-9]*(\d{1,3})\s?%/i)

  if(scoreLine){
    return Math.min(Number(scoreLine[1]), 100)
  }

  const anyPercent =
  String(text || "").match(/(\d{1,3})\s?%/)

  if(!anyPercent){
    return 0
  }

  return Math.min(
    Number(anyPercent[1]),
    100
  )
}

function extractNamedScore(text, label){
  const regex =
  new RegExp(`${label}[^0-9]*(\\d{1,3})\\s?%`, "i")

  const match =
  String(text || "").match(regex)

  if(match){
    return clamp(Number(match[1]))
  }

  return 0
}

function extractHiringSignal(text){
  const lower =
  String(text || "").toLowerCase()

  if(lower.includes("strong hire")){
    return "Strong Hire"
  }

  if(lower.includes("hire")){
    return "Hire"
  }

  if(lower.includes("maybe")){
    return "Maybe"
  }

  if(lower.includes("reject")){
    return "Reject"
  }

  return "Review Needed"
}

function localAnswerScores(answer){
  const text =
  String(answer || "").toLowerCase()

  const wordCount =
  text.split(/\s+/).filter(Boolean).length

  const hasSituation =
  text.includes("situation") ||
  text.includes("when") ||
  text.includes("during")

  const hasTask =
  text.includes("task") ||
  text.includes("responsible") ||
  text.includes("needed")

  const hasAction =
  text.includes("action") ||
  text.includes("i did") ||
  text.includes("i worked") ||
  text.includes("i created") ||
  text.includes("i helped")

  const hasResult =
  text.includes("result") ||
  text.includes("outcome") ||
  text.includes("improved") ||
  text.includes("achieved") ||
  /\d/.test(text)

  const star =
  clamp(
    (hasSituation ? 25 : 0) +
    (hasTask ? 25 : 0) +
    (hasAction ? 25 : 0) +
    (hasResult ? 25 : 0)
  )

  const confidence =
  clamp(
    (wordCount >= 70 ? 30 : wordCount >= 35 ? 18 : 8) +
    (/\d/.test(text) ? 20 : 0) +
    (["improved","achieved","delivered","created","managed","supported","analysed"].some(word => text.includes(word)) ? 25 : 0) +
    (text.includes("i ") ? 15 : 0) +
    (wordCount <= 260 ? 10 : 0)
  )

  const clarity =
  clamp(
    (wordCount >= 40 ? 25 : 10) +
    (wordCount <= 220 ? 25 : 10) +
    (text.includes(".") ? 15 : 0) +
    (hasAction ? 20 : 0) +
    (hasResult ? 15 : 0)
  )

  const role =
  jobTitleInput.value.toLowerCase()

  const roleWords =
  role.split(/\s+/).filter(word => word.length > 3)

  const roleHits =
  roleWords.filter(word => text.includes(word)).length

  const roleMatch =
  clamp(
    (roleHits > 0 ? 35 : 0) +
    (contextInput.value && contextInput.value.toLowerCase().split(/\s+/).some(word => word.length > 5 && text.includes(word)) ? 25 : 0) +
    (interviewTypeInput.value && text.includes(interviewTypeInput.value.toLowerCase()) ? 10 : 0) +
    (confidence * 0.30)
  )

  return {
    star,
    confidence,
    clarity,
    roleMatch
  }
}

function updateBreakdown(scores){
  starScore.textContent =
  `${scores.star || 0}%`

  confidenceScore.textContent =
  `${scores.confidence || 0}%`

  clarityScore.textContent =
  `${scores.clarity || 0}%`

  roleMatchScore.textContent =
  `${scores.roleMatch || 0}%`

  setBar(starScoreBar, scores.star || 0)
  setBar(confidenceScoreBar, scores.confidence || 0)
  setBar(clarityScoreBar, scores.clarity || 0)
  setBar(roleMatchScoreBar, scores.roleMatch || 0)
}

function setLoading(buttons, active){
  buttons.forEach((button)=>{
    if(!button){
      return
    }

    if(active){
      button.classList.add("loading-state")
      button.disabled = true
    }else{
      button.classList.remove("loading-state")
      button.disabled = false
    }
  })
}

function updateDifficultyBadge(){
  difficultyBadge.textContent =
  difficultyInput.value
}

function renderQuestion(question){
  currentQuestion =
  question || ""

  questionOutput.innerHTML =
  `
    <h4>Interviewer</h4>
    <p>${safeText(currentQuestion).replace(/\n/g, "<br>")}</p>
  `
}

function renderFeedback(feedback){
  feedbackOutput.innerHTML =
  marked.parse(feedback || "")
}

function resetSession(){
  currentQuestion =
  ""

  questionOutput.innerHTML =
  `
    <h4>Interviewer</h4>
    <p>Generate a question to begin your mock interview.</p>
  `

  answerInput.value =
  ""

  feedbackOutput.innerHTML =
  "<p>No feedback yet.</p>"

  updateBreakdown({
    star:0,
    confidence:0,
    clarity:0,
    roleMatch:0
  })
}

async function askCareerAssistant(message){
  const response =
  await apiFetch("/api/career-assistant", {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      userId:currentUser.id,
      message:message
    })
  })

  const data =
  await response.json()

  if(data.error){
    throw new Error(data.error)
  }

  return data.reply || ""
}

async function loadHistory(){
  const { data, error } =
  await supabase
  .from("interview_simulations")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    historyList.innerHTML =
    "<p>Could not load interview history.</p>"

    return
  }

  const rows =
  data || []

  sessionCount.textContent =
  rows.length

  const scores =
  rows.map(row => row.score || 0)

  const avg =
  scores.length > 0
  ? Math.round(scores.reduce((sum, score)=> sum + score, 0) / scores.length)
  : 0

  const best =
  scores.length > 0
  ? Math.max(...scores)
  : 0

  averageScore.textContent =
  `${avg}%`

  bestInterviewScore.textContent =
  `${best}%`

  latestSignal.textContent =
  rows[0]?.hiring_signal || "-"

  if(interviewReadinessBar){
    interviewReadinessBar.style.width =
    `${best}%`
  }

  if(rows[0]){
    updateBreakdown({
      star:rows[0].star_score || 0,
      confidence:rows[0].confidence_score || 0,
      clarity:rows[0].clarity_score || 0,
      roleMatch:rows[0].role_match_score || 0
    })
  }

  if(rows.length === 0){
    historyList.innerHTML =
    "<p>No interview simulations yet. Generate a question and submit your first answer.</p>"
    return
  }

  historyList.innerHTML =
  ""

  rows.slice(0, 8).forEach((item)=>{
    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    card.innerHTML =
    `
      <h4>${safeText(item.job_title || "Interview Simulation")}</h4>

      <p><strong>Type:</strong> ${safeText(item.interview_type || "-")}</p>
      <p><strong>Difficulty:</strong> ${safeText(item.difficulty || "-")}</p>
      <p><strong>Score:</strong> ${item.score || 0}%</p>
      <p><strong>STAR:</strong> ${item.star_score || 0}%</p>
      <p><strong>Hiring Signal:</strong> ${safeText(item.hiring_signal || "-")}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-feedback-btn">View Feedback</button>
        <button class="small-btn danger-btn delete-session-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-feedback-btn")
    .addEventListener("click", ()=>{
      renderQuestion(
        item.question || ""
      )

      answerInput.value =
      item.answer || ""

      jobTitleInput.value =
      item.job_title || jobTitleInput.value

      interviewTypeInput.value =
      item.interview_type || interviewTypeInput.value

      difficultyInput.value =
      item.difficulty || difficultyInput.value

      updateDifficultyBadge()

      updateBreakdown({
        star:item.star_score || 0,
        confidence:item.confidence_score || 0,
        clarity:item.clarity_score || 0,
        roleMatch:item.role_match_score || 0
      })

      renderFeedback(
        item.feedback || ""
      )

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card
    .querySelector(".delete-session-btn")
    .addEventListener("click", async ()=>{
      const confirmDelete =
      confirm("Delete this interview simulation?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("interview_simulations")
      .delete()
      .eq("id", item.id)

      if(error){
        console.error(error)
        alert("Could not delete simulation.")
        return
      }

      await loadHistory()
    })

    historyList.appendChild(card)
  })
}

async function generateQuestion(){
  currentUser =
  await protectPage()

  if(jobTitleInput.value.trim().length < 2){
    alert("Enter a job title first.")
    return
  }

  try{
    generateQuestionBtn.textContent =
    "Generating..."

    generateQuestionBtnSide.textContent =
    "Generating..."

    setLoading(
      [generateQuestionBtn, generateQuestionBtnSide],
      true
    )

    const question =
    await askCareerAssistant(`
Act as a realistic UK interviewer for a professional mock interview.

Generate ONE interview question only.

Job title:
${jobTitleInput.value}

Interview type:
${interviewTypeInput.value}

Difficulty:
${difficultyInput.value}

Context:
${contextInput.value || "Not provided"}

Rules:
- Ask only one question.
- Make it realistic for the role and difficulty.
- If Pressure Mode, make it challenging but fair.
- Do not give advice yet.
- Do not include an answer.
- Do not include markdown headings.
- Return only the interview question.
`)

    renderQuestion(
      question.trim()
    )

    answerInput.value =
    ""

    renderFeedback(
      "Answer the question, then submit for strict recruiter-style feedback."
    )

    updateBreakdown({
      star:0,
      confidence:0,
      clarity:0,
      roleMatch:0
    })
  }catch(error){
    console.error(error)

    alert(
      error.message || "Could not generate question."
    )
  }finally{
    generateQuestionBtn.textContent =
    "Generate Question"

    generateQuestionBtnSide.textContent =
    "Generate Interview Question"

    setLoading(
      [generateQuestionBtn, generateQuestionBtnSide],
      false
    )
  }
}

async function submitAnswer(){
  currentUser =
  await protectPage()

  if(!currentQuestion || currentQuestion.length < 5){
    alert("Generate a question first.")
    return
  }

  if(answerInput.value.trim().length < 20){
    alert("Write a fuller answer before submitting.")
    return
  }

  try{
    submitAnswerBtn.textContent =
    "Analysing..."

    submitAnswerBtn.classList.add(
      "loading-state"
    )

    submitAnswerBtn.disabled =
    true

    const localScores =
    localAnswerScores(answerInput.value)

    updateBreakdown(localScores)

    const feedback =
    await askCareerAssistant(`
Act as a strict but fair UK recruiter, hiring manager and interview coach.

Assess this interview answer realistically.

Job title:
${jobTitleInput.value}

Interview type:
${interviewTypeInput.value}

Difficulty:
${difficultyInput.value}

Question:
${currentQuestion}

Candidate answer:
${answerInput.value}

Return markdown with this exact structure:

# Interview Score
Give a percentage score from 0% to 100%.

# Hiring Signal
Choose one: Strong Hire, Hire, Maybe, Reject.

# STAR Score
Give a percentage from 0% to 100%.

# Confidence Score
Give a percentage from 0% to 100%.

# Clarity Score
Give a percentage from 0% to 100%.

# Role Match Score
Give a percentage from 0% to 100%.

# What Worked
# What Was Weak
# Missing Evidence
# STAR Method Feedback
# Improved Answer
# Recruiter Verdict
# Next Practice Question

Rules:
- Be honest.
- Be specific.
- Do not be overly nice.
- Use UK English.
- Focus on whether this answer would progress in a real UK interview.
- Explain what would make the answer stronger.
- Do not invent experience the candidate did not mention.
- Improved answer must stay truthful to the candidate's answer.
`)

    const score =
    extractScore(feedback)

    const hiringSignal =
    extractHiringSignal(feedback)

    const finalScores = {
      star:extractNamedScore(feedback, "STAR Score") || localScores.star,
      confidence:extractNamedScore(feedback, "Confidence Score") || localScores.confidence,
      clarity:extractNamedScore(feedback, "Clarity Score") || localScores.clarity,
      roleMatch:extractNamedScore(feedback, "Role Match Score") || localScores.roleMatch
    }

    updateBreakdown(finalScores)

    renderFeedback(
      feedback
    )

    const { error } =
    await supabase
    .from("interview_simulations")
    .insert([{
      user_id:currentUser.id,
      job_title:jobTitleInput.value,
      interview_type:interviewTypeInput.value,
      difficulty:difficultyInput.value,
      question:currentQuestion,
      answer:answerInput.value,
      feedback:feedback,
      score:score,
      hiring_signal:hiringSignal,
      star_score:finalScores.star,
      confidence_score:finalScores.confidence,
      clarity_score:finalScores.clarity,
      role_match_score:finalScores.roleMatch
    }])

    if(error){
      console.error(error)
      alert("Feedback generated, but could not save. You may need to add the new score columns.")
      return
    }

    await loadHistory()
  }catch(error){
    console.error(error)

    alert(
      error.message || "Could not analyse answer."
    )
  }finally{
    submitAnswerBtn.textContent =
    "Submit Answer For Feedback"

    submitAnswerBtn.classList.remove(
      "loading-state"
    )

    submitAnswerBtn.disabled =
    false
  }
}

async function checkDevices(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    alert("Camera and microphone checks are not supported in this browser.")
    return
  }

  try{
    checkDeviceBtn.textContent =
    "Checking..."

    mediaStream =
    await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    })

    const hasVideo =
    mediaStream.getVideoTracks().length > 0

    const hasAudio =
    mediaStream.getAudioTracks().length > 0

    cameraStatus.textContent =
    hasVideo ? "Ready" : "Not detected"

    microphoneStatus.textContent =
    hasAudio ? "Ready" : "Not detected"

    if(hasVideo){
      cameraPreview.srcObject =
      mediaStream

      cameraPreview.style.display =
      "block"

      stopDeviceBtn.style.display =
      "block"
    }
  }catch(error){
    console.error(error)

    cameraStatus.textContent =
    "Blocked or unavailable"

    microphoneStatus.textContent =
    "Blocked or unavailable"

    alert("Could not access camera or microphone. Check browser permissions.")
  }finally{
    checkDeviceBtn.textContent =
    "Check Camera & Mic"
  }
}

function stopDevices(){
  if(mediaStream){
    mediaStream.getTracks().forEach(track => track.stop())
  }

  mediaStream =
  null

  cameraPreview.srcObject =
  null

  cameraPreview.style.display =
  "none"

  stopDeviceBtn.style.display =
  "none"

  cameraStatus.textContent =
  "Stopped"

  microphoneStatus.textContent =
  "Stopped"
}

insertStarBtn.addEventListener("click", ()=>{
  const template =
`Situation:
Task:
Action:
Result:`

  answerInput.value =
  answerInput.value
  ? `${answerInput.value}\n\n${template}`
  : template

  answerInput.focus()
})

copyQuestionBtn.addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(
    currentQuestion || questionOutput.innerText
  )

  copyQuestionBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyQuestionBtn.textContent =
    "Copy Question"
  }, 1500)
})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href =
  "login.html"
})

generateQuestionBtn.addEventListener(
  "click",
  generateQuestion
)

generateQuestionBtnSide.addEventListener(
  "click",
  generateQuestion
)

submitAnswerBtn.addEventListener(
  "click",
  submitAnswer
)

resetSessionBtn.addEventListener(
  "click",
  resetSession
)

difficultyInput.addEventListener(
  "change",
  updateDifficultyBadge
)

checkDeviceBtn.addEventListener(
  "click",
  checkDevices
)

stopDeviceBtn.addEventListener(
  "click",
  stopDevices
)

currentUser =
await protectPage()

updateDifficultyBadge()

updateBreakdown({
  star:0,
  confidence:0,
  clarity:0,
  roleMatch:0
})

await loadHistory()