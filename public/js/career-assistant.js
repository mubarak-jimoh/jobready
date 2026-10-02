import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium
}
from "/js/premium.js"

import { marked }
from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

import html2pdf
from "https://cdn.jsdelivr.net/npm/html2pdf.js/+esm"

const logoutBtn =
document.getElementById("logoutBtn")

const assistantInput =
document.getElementById("assistantInput")

const sendAssistantBtn =
document.getElementById("sendAssistantBtn")

const stopAssistantBtn =
document.getElementById("stopAssistantBtn")

const clearChatBtn =
document.getElementById("clearChatBtn")

const exportAssistantPdfBtn =
document.getElementById("exportAssistantPdfBtn")

const chatBox =
document.getElementById("chatBox")

const promptButtons =
document.querySelectorAll(".prompt-btn")

const modeButtons =
document.querySelectorAll(".assistant-mode-btn")

const memoryTargetRole =
document.getElementById("memoryTargetRole")

const memoryCurrentLevel =
document.getElementById("memoryCurrentLevel")

const memorySkills =
document.getElementById("memorySkills")

const memoryExperience =
document.getElementById("memoryExperience")

const memorySalaryGoal =
document.getElementById("memorySalaryGoal")

const memoryIndustry =
document.getElementById("memoryIndustry")

const memoryLearningGoal =
document.getElementById("memoryLearningGoal")

const saveMemoryBtn =
document.getElementById("saveMemoryBtn")

const memoryScore =
document.getElementById("memoryScore")

const memoryScoreBar =
document.getElementById("memoryScoreBar")

const memorySummaryTitle =
document.getElementById("memorySummaryTitle")

const memorySummaryText =
document.getElementById("memorySummaryText")

let premiumActive =
await checkPremium()

let currentUser = null
let currentController = null
let isGenerating = false
let lastUserMessage = ""
let currentMemory = null
let currentMode = "career"

const modeInstructions = {
  career:"Act as an elite UK career strategist. Focus on direction, employability, positioning and practical next steps.",
  recruiter:"Act as a strict UK recruiter. Be honest about gaps, weak positioning and what would stop interviews.",
  learning:"Act as a skills coach. Create learning roadmaps, qualifications, projects and weekly milestones.",
  interview:"Act as an interview coach. Help the user prepare stronger answers with STAR evidence and recruiter expectations.",
  salary:"Act as a salary growth adviser. Focus on higher-value skills, role progression and realistic UK earning routes.",
  linkedin:"Act as a LinkedIn strategist. Improve profile positioning, recruiter keywords, content and networking strategy."
}

function updateButton(){

  sendAssistantBtn.textContent =
  premiumActive
  ? "Ask AI Career Assistant"
  : "Ask AI Career Assistant · Premium"

}

function setGeneratingState(active){

  isGenerating =
  active

  if(active){

    sendAssistantBtn.textContent =
    "Generating..."

    sendAssistantBtn.classList.add(
      "loading-state"
    )

    stopAssistantBtn.style.display =
    "block"

    exportAssistantPdfBtn.disabled =
    true

  }else{

    updateButton()

    sendAssistantBtn.classList.remove(
      "loading-state"
    )

    stopAssistantBtn.style.display =
    "none"

    exportAssistantPdfBtn.disabled =
    false

    currentController =
    null

  }

}

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function calculateMemoryScore(memory){

  if(!memory){
    return 0
  }

  const fields = [
    memory.target_role,
    memory.target_salary,
    memory.experience_level,
    memory.current_skills,
    memory.industries,
    memory.strengths,
    memory.learning_goal
  ]

  const completed =
  fields.filter(field =>
    String(field || "").trim().length > 2
  ).length

  return Math.round(
    (completed / fields.length) * 100
  )

}

function updateMemoryUI(){

  const score =
  calculateMemoryScore(
    currentMemory
  )

  if(memoryScore){
    memoryScore.textContent =
    `${score}%`
  }

  if(memoryScoreBar){
    memoryScoreBar.style.width =
    `${score}%`
  }

  if(!currentMemory){

    memorySummaryTitle.textContent =
    "No profile saved yet"

    memorySummaryText.textContent =
    "Add your target role, skills, salary goal and learning direction to make advice more personal."

    return

  }

  memorySummaryTitle.textContent =
  currentMemory.target_role
  ? `${currentMemory.target_role} plan`
  : "Career profile saved"

  memorySummaryText.textContent =
  `Level: ${currentMemory.experience_level || "Not set"} · Skills: ${currentMemory.current_skills || "Not set"} · Goal: ${currentMemory.learning_goal || "Not set"}`

}

function buildMemoryContext(){

  if(!currentMemory){
    return ""
  }

  return `
Career profile memory:
Target role: ${currentMemory.target_role || "Not provided"}
Target salary: ${currentMemory.target_salary || "Not provided"}
Experience level: ${currentMemory.experience_level || "Not provided"}
Current skills: ${currentMemory.current_skills || "Not provided"}
Industries: ${currentMemory.industries || "Not provided"}
Strengths / experience: ${currentMemory.strengths || "Not provided"}
Weaknesses: ${currentMemory.weaknesses || "Not provided"}
Learning goal: ${currentMemory.learning_goal || "Not provided"}
`
}

async function loadCareerMemory(){

  if(!currentUser){
    return
  }

  const { data, error } =
  await supabase
  .from("career_profiles")
  .select("*")
  .eq("user_id", currentUser.id)
  .maybeSingle()

  if(error){
    console.error("Career profile load error:", error)
    return
  }

  if(!data){
    currentMemory =
    null

    updateMemoryUI()
    return
  }

  currentMemory =
  data

  memoryTargetRole.value =
  data.target_role || ""

  memoryCurrentLevel.value =
  data.experience_level || ""

  memorySkills.value =
  data.current_skills || ""

  memoryExperience.value =
  data.strengths || ""

  memorySalaryGoal.value =
  data.target_salary || ""

  memoryIndustry.value =
  data.industries || ""

  memoryLearningGoal.value =
  data.learning_goal || ""

  updateMemoryUI()

}

async function saveCareerMemory(){

  currentUser =
  await protectPage()

  saveMemoryBtn.textContent =
  "Saving..."

  saveMemoryBtn.classList.add(
    "loading-state"
  )

  const memoryData = {
    user_id:currentUser.id,
    target_role:memoryTargetRole.value,
    target_salary:memorySalaryGoal.value,
    experience_level:memoryCurrentLevel.value,
    current_skills:memorySkills.value,
    industries:memoryIndustry.value,
    strengths:memoryExperience.value,
    weaknesses:"",
    learning_goal:memoryLearningGoal.value,
    updated_at:new Date().toISOString()
  }

  const { data:existing, error:fetchError } =
  await supabase
  .from("career_profiles")
  .select("*")
  .eq("user_id", currentUser.id)
  .maybeSingle()

  if(fetchError){
    console.error(fetchError)
    alert("Could not check career profile.")
    saveMemoryBtn.textContent = "Save Career Memory"
    saveMemoryBtn.classList.remove("loading-state")
    return
  }

  let result

  if(existing){

    result =
    await supabase
    .from("career_profiles")
    .update(memoryData)
    .eq("user_id", currentUser.id)
    .select()
    .single()

  }else{

    result =
    await supabase
    .from("career_profiles")
    .insert([memoryData])
    .select()
    .single()

  }

  saveMemoryBtn.textContent =
  "Save Career Memory"

  saveMemoryBtn.classList.remove(
    "loading-state"
  )

  if(result.error){
    console.error(result.error)
    alert("Could not save career profile.")
    return
  }

  currentMemory =
  result.data

  updateMemoryUI()

  alert("Career memory saved.")

}

function attachCopyButton(card, textGetter){

  const button =
  card.querySelector(".copy-response-btn")

  if(!button){
    return
  }

  button.addEventListener("click", async ()=>{

    const textToCopy =
    typeof textGetter === "function"
    ? textGetter()
    : textGetter

    await navigator.clipboard.writeText(
      textToCopy || ""
    )

    button.textContent =
    "Copied!"

    setTimeout(()=>{
      button.textContent =
      "Copy Response"
    }, 1500)

  })

}

function attachRegenerateButton(card, userMessage){

  const button =
  card.querySelector(".regenerate-response-btn")

  if(!button){
    return
  }

  button.addEventListener("click", async ()=>{

    if(isGenerating){
      return
    }

    await generateAssistantResponse(
      userMessage,
      false
    )

  })

}

function addMessage(title, message, type = "assistant", userMessageForRegenerate = ""){

  const card =
  document.createElement("div")

  card.className =
  type === "user"
  ? "question-card user-message-card"
  : "question-card assistant-message-card"

  const formattedMessage =
  type === "assistant"
  ? marked.parse(message || "")
  : `<p>${safeText(message).replace(/\n/g, "<br>")}</p>`

  const actionButtons =
  type === "assistant"
  ? `
      <button class="copy-response-btn">Copy Response</button>
      <button class="copy-response-btn regenerate-response-btn">Regenerate</button>
    `
  : ""

  card.innerHTML =
  `
    <h4>${safeText(title)}</h4>

    <div class="assistant-rich-text">
      ${formattedMessage}
    </div>

    ${actionButtons}
  `

  if(type === "assistant"){

    attachCopyButton(
      card,
      message
    )

    attachRegenerateButton(
      card,
      userMessageForRegenerate || lastUserMessage
    )

  }

  chatBox.appendChild(card)

  card.scrollIntoView({
    behavior:"smooth",
    block:"end"
  })

  return card

}

function createStreamingMessage(){

  const card =
  document.createElement("div")

  card.className =
  "question-card assistant-message-card streaming-card"

  card.innerHTML =
  `
    <h4>JobReady Assistant</h4>

    <div class="assistant-rich-text streaming-output">
      <p>Building your career strategy...</p>
    </div>

    <button class="copy-response-btn" style="display:none;">
      Copy Response
    </button>

    <button class="copy-response-btn regenerate-response-btn" style="display:none;">
      Regenerate
    </button>
  `

  chatBox.appendChild(card)

  card.scrollIntoView({
    behavior:"smooth",
    block:"end"
  })

  return card

}

function updateStreamingMessage(card, markdownText){

  const output =
  card.querySelector(".streaming-output")

  output.innerHTML =
  marked.parse(markdownText || "")

  card.scrollIntoView({
    behavior:"smooth",
    block:"end"
  })

}

function activateStreamingButtons(card, userMessage, replyGetter){

  const copyButton =
  card.querySelector(".copy-response-btn")

  const regenerateButton =
  card.querySelector(".regenerate-response-btn")

  if(copyButton){

    copyButton.style.display =
    "inline-block"

    attachCopyButton(
      card,
      replyGetter
    )

  }

  if(regenerateButton){

    regenerateButton.style.display =
    "inline-block"

    attachRegenerateButton(
      card,
      userMessage
    )

  }

}

function addStarterMessage(){

  chatBox.innerHTML =
  `
    <div class="question-card assistant-message-card">
      <h4>JobReady Assistant</h4>

      <div class="assistant-rich-text">
        <p>
          Tell me your career goal, current level, skills and what you want help with.
          I can recommend skills, qualifications, projects, salary steps, CV improvements and a clear action plan.
        </p>
      </div>
    </div>
  `

}

async function loadChatHistory(){

  if(!currentUser){
    return
  }

  const { data, error } =
  await supabase
  .from("career_assistant_chats")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:true
  })

  if(error){
    console.error(error)
    addStarterMessage()
    return
  }

  chatBox.innerHTML =
  ""

  if(!data || data.length === 0){
    addStarterMessage()
    return
  }

  data.forEach((chat)=>{

    addMessage(
      "You",
      chat.user_message,
      "user"
    )

    addMessage(
      "JobReady Assistant",
      chat.ai_reply,
      "assistant",
      chat.user_message
    )

  })

}

async function saveChat(userMessage, aiReply){

  if(!currentUser){
    return
  }

  const { error } =
  await supabase
  .from("career_assistant_chats")
  .insert([{
    user_id:currentUser.id,
    user_message:userMessage,
    ai_reply:aiReply
  }])

  if(error){
    console.error("Chat save error:", error)
  }

}

async function clearChatHistory(){

  currentUser =
  await protectPage()

  const confirmClear =
  confirm("Clear your saved AI Career Assistant chat history?")

  if(!confirmClear){
    return
  }

  const { error } =
  await supabase
  .from("career_assistant_chats")
  .delete()
  .eq("user_id", currentUser.id)

  if(error){
    console.error(error)
    alert("Could not clear chat history.")
    return
  }

  addStarterMessage()

  alert("Chat history cleared.")

}

function buildFinalMessage(message){

  const memoryContext =
  buildMemoryContext()

  const modeContext =
  modeInstructions[currentMode] ||
  modeInstructions.career

  return `
Assistant mode:
${modeContext}

${memoryContext}

User question:
${message}

Response requirements:
- Use UK English.
- Be specific, practical and honest.
- Do not make fake guarantees.
- Give a clear next action plan.
- Recommend realistic skills, qualifications, portfolio projects or job search actions when useful.
- Structure with headings and bullet points.
`

}

async function generateAssistantResponse(message, showUserMessage = true){

  if(isGenerating){
    return
  }

  currentUser =
  await protectPage()

  await loadCareerMemory()

  if(message.trim().length < 3){
    alert("Ask the assistant a question first.")
    return
  }

  lastUserMessage =
  message

  let streamingCard = null
  let fullReply = ""

  const finalMessage =
  buildFinalMessage(
    message
  )

  currentController =
  new AbortController()

  try{

    setGeneratingState(true)

    if(showUserMessage){

      addMessage(
        "You",
        message,
        "user"
      )

    }

    assistantInput.value =
    ""

    streamingCard =
    createStreamingMessage()

    const response =
    await apiFetch("/api/career-assistant-stream", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id,
        message:finalMessage
      }),
      signal:currentController.signal
    })

    if(!response.ok){

      const errorText =
      await response.text()

      if(streamingCard){
        streamingCard.remove()
      }

      alert(
        errorText ||
        "Career assistant failed."
      )

      return

    }

    const reader =
    response.body.getReader()

    const decoder =
    new TextDecoder()

    while(true){

      const {
        done,
        value
      } =
      await reader.read()

      if(done){
        break
      }

      const chunk =
      decoder.decode(value, {
        stream:true
      })

      fullReply +=
      chunk

      updateStreamingMessage(
        streamingCard,
        fullReply
      )

    }

    if(fullReply.trim().length === 0){

      updateStreamingMessage(
        streamingCard,
        "No response was generated. Please try again."
      )

      return

    }

    activateStreamingButtons(
      streamingCard,
      message,
      ()=> fullReply
    )

    await saveChat(
      message,
      fullReply
    )

  }catch(error){

    if(error.name === "AbortError"){

      if(streamingCard){

        if(fullReply.trim().length > 0){

          fullReply +=
          "\n\n**Generation stopped.**"

          updateStreamingMessage(
            streamingCard,
            fullReply
          )

          activateStreamingButtons(
            streamingCard,
            message,
            ()=> fullReply
          )

          await saveChat(
            message,
            fullReply
          )

        }else{

          streamingCard.remove()

        }

      }

      return

    }

    if(streamingCard){
      streamingCard.remove()
    }

    console.error(error)

    alert(
      "Career assistant failed. Make sure backend is running."
    )

  }finally{

    premiumActive =
    await checkPremium()

    setGeneratingState(false)

  }

}

function exportCareerPlanPDF(){

  const fileName =
  "JobReady-Career-Plan.pdf"

  const options = {
    margin:0.4,
    filename:fileName,
    image:{
      type:"jpeg",
      quality:1
    },
    html2canvas:{
      scale:2,
      useCORS:true
    },
    jsPDF:{
      unit:"in",
      format:"a4",
      orientation:"portrait"
    }
  }

  html2pdf()
  .set(options)
  .from(chatBox)
  .save()

}

promptButtons.forEach((button)=>{

  button.addEventListener("click", ()=>{

    assistantInput.value =
    button.textContent

    assistantInput.focus()

  })

})

modeButtons.forEach((button)=>{

  button.addEventListener("click", ()=>{

    modeButtons.forEach(item =>
      item.classList.remove("active-mode")
    )

    button.classList.add(
      "active-mode"
    )

    currentMode =
    button.dataset.mode || "career"

  })

})

saveMemoryBtn.addEventListener(
  "click",
  saveCareerMemory
)

stopAssistantBtn.addEventListener("click", ()=>{

  if(currentController){
    currentController.abort()
  }

})

sendAssistantBtn.addEventListener("click", async ()=>{

  const message =
  assistantInput.value.trim()

  await generateAssistantResponse(
    message,
    true
  )

})

assistantInput.addEventListener("keydown", async (event)=>{

  if(event.key === "Enter" && (event.ctrlKey || event.metaKey)){

    event.preventDefault()

    const message =
    assistantInput.value.trim()

    await generateAssistantResponse(
      message,
      true
    )

  }

})

exportAssistantPdfBtn.addEventListener(
  "click",
  exportCareerPlanPDF
)

clearChatBtn.addEventListener(
  "click",
  clearChatHistory
)

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

currentUser =
await protectPage()

await loadCareerMemory()

await loadChatHistory()

updateButton()