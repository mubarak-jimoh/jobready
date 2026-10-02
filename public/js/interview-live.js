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

const startCameraBtn =
document.getElementById("startCameraBtn")

const generateQuestionBtn =
document.getElementById("generateQuestionBtn")

const generateQuestionSideBtn =
document.getElementById("generateQuestionSideBtn")

const startRecordingBtn =
document.getElementById("startRecordingBtn")

const stopRecordingBtn =
document.getElementById("stopRecordingBtn")

const analyseAnswerBtn =
document.getElementById("analyseAnswerBtn")

const cameraPreview =
document.getElementById("cameraPreview")

const cameraStatus =
document.getElementById("cameraStatus")

const jobTitleInput =
document.getElementById("jobTitleInput")

const interviewTypeInput =
document.getElementById("interviewTypeInput")

const difficultyInput =
document.getElementById("difficultyInput")

const timerInput =
document.getElementById("timerInput")

const contextInput =
document.getElementById("contextInput")

const questionOutput =
document.getElementById("questionOutput")

const transcriptOutput =
document.getElementById("transcriptOutput")

const manualTranscriptInput =
document.getElementById("manualTranscriptInput")

const feedbackOutput =
document.getElementById("feedbackOutput")

const historyList =
document.getElementById("historyList")

const timerDisplay =
document.getElementById("timerDisplay")

const fillerCount =
document.getElementById("fillerCount")

const confidenceScore =
document.getElementById("confidenceScore")

const liveScore =
document.getElementById("liveScore")

const liveScoreBar =
document.getElementById("liveScoreBar")

let currentUser = null
let mediaStream = null
let mediaRecorder = null
let audioChunks = []
let recognition = null
let currentQuestion = ""
let currentTranscript = ""
let timerInterval = null
let timeRemaining = 90

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function setButtonState(buttons, active){

  buttons.forEach((button)=>{

    if(!button){
      return
    }

    if(active){
      button.classList.add("loading-state")
    }else{
      button.classList.remove("loading-state")
    }

  })

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

function countFillers(text){

  const fillers = [
    "um",
    "uh",
    "like",
    "basically",
    "literally",
    "you know",
    "sort of",
    "kind of"
  ]

  const lower =
  String(text || "").toLowerCase()

  let count = 0

  fillers.forEach((word)=>{

    const regex =
    new RegExp(`\\b${word}\\b`, "g")

    const matches =
    lower.match(regex)

    count +=
    matches ? matches.length : 0

  })

  return count

}

function calculateConfidence(text){

  const words =
  String(text || "")
  .trim()
  .split(/\s+/)
  .filter(Boolean)

  if(words.length === 0){
    return 0
  }

  let score = 50

  if(words.length >= 60) score += 15
  if(words.length >= 100) score += 10

  const filler =
  countFillers(text)

  score -=
  Math.min(filler * 4, 25)

  const actionWords = [
    "achieved",
    "improved",
    "managed",
    "delivered",
    "created",
    "supported",
    "led",
    "analysed",
    "resolved",
    "increased",
    "reduced"
  ]

  const lower =
  String(text || "").toLowerCase()

  if(actionWords.some(word => lower.includes(word))){
    score += 10
  }

  if(/\d/.test(text)){
    score += 10
  }

  return Math.max(
    0,
    Math.min(score, 100)
  )

}

function updateLiveMetrics(text){

  const fillers =
  countFillers(text)

  const confidence =
  calculateConfidence(text)

  fillerCount.textContent =
  fillers

  confidenceScore.textContent =
  `${confidence}%`

}

function resetTimer(){

  timeRemaining =
  Number(timerInput.value || 90)

  timerDisplay.textContent =
  `${timeRemaining}s`

  timerDisplay.classList.remove(
    "timer-danger"
  )

}

function startTimer(){

  resetTimer()

  clearInterval(
    timerInterval
  )

  timerInterval =
  setInterval(()=>{

    timeRemaining -= 1

    timerDisplay.textContent =
    `${timeRemaining}s`

    if(timeRemaining <= 15){
      timerDisplay.classList.add(
        "timer-danger"
      )
    }

    if(timeRemaining <= 0){
      stopRecording()
    }

  }, 1000)

}

function stopTimer(){

  clearInterval(
    timerInterval
  )

  timerInterval =
  null

}

async function startCamera(){

  try{

    mediaStream =
    await navigator.mediaDevices.getUserMedia({
      video:true,
      audio:true
    })

    cameraPreview.srcObject =
    mediaStream

    cameraStatus.textContent =
    "Camera on"

    startRecordingBtn.disabled =
    false

    startCameraBtn.textContent =
    "Camera Ready"

  }catch(error){

    console.error(error)

    alert(
      "Could not access camera or microphone. Check browser permissions."
    )

  }

}

function setupSpeechRecognition(){

  const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition

  if(!SpeechRecognition){
    return null
  }

  const recogniser =
  new SpeechRecognition()

  recogniser.continuous =
  true

  recogniser.interimResults =
  true

  recogniser.lang =
  "en-GB"

  recogniser.onresult =
  (event)=>{

    let transcript = ""

    for(let i = 0; i < event.results.length; i++){
      transcript +=
      event.results[i][0].transcript
    }

    currentTranscript =
    transcript

    transcriptOutput.innerHTML =
    `<p>${safeText(currentTranscript)}</p>`

    manualTranscriptInput.value =
    currentTranscript

    updateLiveMetrics(
      currentTranscript
    )

  }

  return recogniser

}

function startRecording(){

  if(!mediaStream){
    alert("Start your camera and microphone first.")
    return
  }

  if(!currentQuestion){
    alert("Generate an interview question first.")
    return
  }

  audioChunks =
  []

  currentTranscript =
  ""

  manualTranscriptInput.value =
  ""

  transcriptOutput.innerHTML =
  "<p>Listening...</p>"

  mediaRecorder =
  new MediaRecorder(
    mediaStream
  )

  mediaRecorder.ondataavailable =
  (event)=>{

    if(event.data.size > 0){
      audioChunks.push(event.data)
    }

  }

  mediaRecorder.onstop =
  ()=>{

    stopTimer()

    startRecordingBtn.disabled =
    false

    stopRecordingBtn.disabled =
    true

    transcriptOutput.innerHTML =
    currentTranscript
    ? `<p>${safeText(currentTranscript)}</p>`
    : "<p>No speech transcript captured. Type or paste your answer below before analysing.</p>"

  }

  recognition =
  setupSpeechRecognition()

  if(recognition){
    recognition.start()
  }

  mediaRecorder.start()

  startRecordingBtn.disabled =
  true

  stopRecordingBtn.disabled =
  false

  startTimer()

}

function stopRecording(){

  if(mediaRecorder && mediaRecorder.state !== "inactive"){
    mediaRecorder.stop()
  }

  if(recognition){
    recognition.stop()
  }

  stopTimer()

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

async function generateQuestion(){

  currentUser =
  await protectPage()

  if(jobTitleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  try{

    generateQuestionBtn.textContent =
    "Generating..."

    generateQuestionSideBtn.textContent =
    "Generating..."

    setButtonState(
      [generateQuestionBtn, generateQuestionSideBtn],
      true
    )

    const question =
    await askAI(`
Act as a realistic UK interviewer.

Generate ONE live interview question only.

Target role:
${jobTitleInput.value}

Interview type:
${interviewTypeInput.value}

Difficulty:
${difficultyInput.value}

Context:
${contextInput.value || "Not provided"}

Rules:
- Ask only one question.
- Make it realistic and role-specific.
- If Pressure Mode, make it challenging but fair.
- Do not include advice.
- Do not include an answer.
- Return only the question.
`)

    currentQuestion =
    question.trim()

    questionOutput.innerHTML =
    `
      <h4>Question</h4>
      <p>${safeText(currentQuestion)}</p>
    `

    feedbackOutput.innerHTML =
    "<p>Record your answer, then analyse it for recruiter-style feedback.</p>"

    resetTimer()

  }catch(error){

    console.error(error)

    alert(
      error.message || "Could not generate question."
    )

  }finally{

    generateQuestionBtn.textContent =
    "Generate Question"

    generateQuestionSideBtn.textContent =
    "Generate Interview Question"

    setButtonState(
      [generateQuestionBtn, generateQuestionSideBtn],
      false
    )

  }

}

async function analyseAnswer(){

  const finalTranscript =
  manualTranscriptInput.value.trim() ||
  currentTranscript.trim()

  if(!currentQuestion){
    alert("Generate a question first.")
    return
  }

  if(finalTranscript.length < 15){
    alert("Record or type a fuller answer first.")
    return
  }

  try{

    analyseAnswerBtn.textContent =
    "Analysing..."

    analyseAnswerBtn.classList.add(
      "loading-state"
    )

    const deliveryConfidence =
    calculateConfidence(
      finalTranscript
    )

    const fillers =
    countFillers(
      finalTranscript
    )

    const feedback =
    await askAI(`
Act as a strict but fair UK recruiter, interview coach and communication assessor.

Assess this live interview answer.

Target role:
${jobTitleInput.value}

Interview type:
${interviewTypeInput.value}

Difficulty:
${difficultyInput.value}

Question:
${currentQuestion}

Spoken answer transcript:
${finalTranscript}

Detected delivery data:
- Filler words: ${fillers}
- Delivery confidence estimate: ${deliveryConfidence}%

Return markdown with this exact structure:

# Live Interview Score
Give a percentage score from 0% to 100%.

# Hiring Signal
Choose one: Strong Hire, Hire, Maybe, Reject.

# Delivery Feedback
Comment on clarity, confidence, filler words and structure.

# Answer Strength
# What Was Missing
# STAR Method Feedback
# Improved Answer
# Recruiter Verdict
# Next Question To Practise

Rules:
- Be honest and specific.
- Use UK English.
- Do not invent experience.
- Improved answer must stay truthful to the transcript.
- Focus on whether this would progress in a real interview.
`)

    const score =
    extractScore(
      feedback
    )

    liveScore.textContent =
    `${score}%`

    liveScoreBar.style.width =
    `${score}%`

    feedbackOutput.innerHTML =
    marked.parse(feedback)

    const { error } =
    await supabase
    .from("live_interviews")
    .insert([{
      user_id:currentUser.id,
      job_title:jobTitleInput.value,
      interview_type:interviewTypeInput.value,
      difficulty:difficultyInput.value,
      question:currentQuestion,
      transcript:finalTranscript,
      feedback:feedback,
      score:score,
      filler_words:fillers,
      confidence_score:deliveryConfidence
    }])

    if(error){
      console.error(error)
      alert("Feedback generated, but could not save.")
      return
    }

    await loadHistory()

  }catch(error){

    console.error(error)

    alert(
      error.message || "Could not analyse answer."
    )

  }finally{

    analyseAnswerBtn.textContent =
    "Analyse Live Answer"

    analyseAnswerBtn.classList.remove(
      "loading-state"
    )

  }

}

async function loadHistory(){

  const { data, error } =
  await supabase
  .from("live_interviews")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    historyList.innerHTML =
    "<p>Could not load live interview history.</p>"
    return
  }

  const rows =
  data || []

  if(rows.length === 0){
    historyList.innerHTML =
    "<p>No live interviews saved yet.</p>"
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
      <h4>${safeText(item.job_title || "Live Interview")}</h4>

      <p><strong>Score:</strong> ${item.score || 0}%</p>
      <p><strong>Confidence:</strong> ${item.confidence_score || 0}%</p>
      <p><strong>Filler Words:</strong> ${item.filler_words || 0}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-live-btn">View</button>
        <button class="small-btn danger-btn delete-live-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-live-btn")
    .addEventListener("click", ()=>{

      currentQuestion =
      item.question || ""

      questionOutput.innerHTML =
      `
        <h4>Question</h4>
        <p>${safeText(currentQuestion)}</p>
      `

      manualTranscriptInput.value =
      item.transcript || ""

      transcriptOutput.innerHTML =
      `<p>${safeText(item.transcript || "")}</p>`

      feedbackOutput.innerHTML =
      marked.parse(item.feedback || "")

      liveScore.textContent =
      `${item.score || 0}%`

      liveScoreBar.style.width =
      `${item.score || 0}%`

      fillerCount.textContent =
      item.filler_words || 0

      confidenceScore.textContent =
      `${item.confidence_score || 0}%`

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card
    .querySelector(".delete-live-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this live interview?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("live_interviews")
      .delete()
      .eq("id", item.id)

      if(error){
        console.error(error)
        alert("Could not delete live interview.")
        return
      }

      await loadHistory()

    })

    historyList.appendChild(card)

  })

}

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

startCameraBtn.addEventListener(
  "click",
  startCamera
)

generateQuestionBtn.addEventListener(
  "click",
  generateQuestion
)

generateQuestionSideBtn.addEventListener(
  "click",
  generateQuestion
)

startRecordingBtn.addEventListener(
  "click",
  startRecording
)

stopRecordingBtn.addEventListener(
  "click",
  stopRecording
)

analyseAnswerBtn.addEventListener(
  "click",
  analyseAnswer
)

timerInput.addEventListener(
  "change",
  resetTimer
)

currentUser =
await protectPage()

resetTimer()

await loadHistory()