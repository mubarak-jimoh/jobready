import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium
}
from "/js/premium.js"

import { marked }
from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

const logoutBtn =
document.getElementById("logoutBtn")

const targetRoleInput =
document.getElementById("targetRoleInput")

const currentLevelInput =
document.getElementById("currentLevelInput")

const skillsInput =
document.getElementById("skillsInput")

const durationInput =
document.getElementById("durationInput")

const goalInput =
document.getElementById("goalInput")

const generateRoadmapBtn =
document.getElementById("generateRoadmapBtn")

const generateRoadmapTopBtn =
document.getElementById("generateRoadmapTopBtn")

const roadmapOutput =
document.getElementById("roadmapOutput")

const savedRoadmaps =
document.getElementById("savedRoadmaps")

const roadmapCount =
document.getElementById("roadmapCount")

const selectedDuration =
document.getElementById("selectedDuration")

const careerFocus =
document.getElementById("careerFocus")

const roadmapStrength =
document.getElementById("roadmapStrength")

const roadmapStrengthBar =
document.getElementById("roadmapStrengthBar")

const planType =
document.getElementById("planType")

const priorityStatus =
document.getElementById("priorityStatus")

let currentUser = null
let premiumActive = false

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function calculateRoadmapStrength(){

  let score = 0

  if(targetRoleInput.value.trim().length > 2) score += 25
  if(currentLevelInput.value.trim().length > 2) score += 15
  if(skillsInput.value.trim().length > 10) score += 20
  if(goalInput.value.trim().length > 20) score += 25
  if(durationInput.value) score += 15

  return Math.min(score, 100)

}

function updateRoadmapMeta(){

  const durationShort =
  durationInput.value
  .replace(" weeks", "w")
  .replace(" months", "m")

  selectedDuration.textContent =
  durationShort

  careerFocus.textContent =
  targetRoleInput.value.trim()
  ? targetRoleInput.value.trim().slice(0, 14)
  : "Unset"

  const strength =
  calculateRoadmapStrength()

  roadmapStrength.textContent =
  `${strength}%`

  roadmapStrengthBar.style.width =
  `${strength}%`

  if(targetRoleInput.value.toLowerCase().includes("data")){
    planType.textContent = "Data"
  }else if(targetRoleInput.value.toLowerCase().includes("cyber")){
    planType.textContent = "Cyber"
  }else if(targetRoleInput.value.toLowerCase().includes("software")){
    planType.textContent = "Tech"
  }else{
    planType.textContent = "Career"
  }

  if(strength >= 80){
    priorityStatus.textContent = "Ready"
  }else if(strength >= 50){
    priorityStatus.textContent = "Add detail"
  }else{
    priorityStatus.textContent = "Set goal"
  }

}

function setGenerateState(active){

  if(active){

    generateRoadmapBtn.textContent =
    "Generating..."

    generateRoadmapTopBtn.textContent =
    "Generating..."

    generateRoadmapBtn.classList.add(
      "loading-state"
    )

    generateRoadmapTopBtn.classList.add(
      "loading-state"
    )

  }else{

    generateRoadmapBtn.textContent =
    premiumActive
    ? "Generate Roadmap"
    : "Generate Roadmap · Premium"

    generateRoadmapTopBtn.textContent =
    "Generate Roadmap"

    generateRoadmapBtn.classList.remove(
      "loading-state"
    )

    generateRoadmapTopBtn.classList.remove(
      "loading-state"
    )

  }

}

async function loadSavedRoadmaps(){

  const { data, error } =
  await supabase
  .from("learning_roadmaps")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    savedRoadmaps.innerHTML =
    "<p>Could not load saved roadmaps.</p>"

    roadmapCount.textContent =
    "0"

    return
  }

  const roadmaps =
  data || []

  roadmapCount.textContent =
  roadmaps.length

  if(roadmaps.length === 0){
    savedRoadmaps.innerHTML =
    "<p>No saved roadmaps yet.</p>"
    return
  }

  savedRoadmaps.innerHTML =
  ""

  roadmaps.slice(0, 8).forEach((roadmap)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    card.innerHTML =
    `
      <h4>${safeText(roadmap.title || "Untitled Roadmap")}</h4>

      <p>
        <strong>Target role:</strong>
        ${safeText(roadmap.target_role || "-")}
      </p>

      <p>
        <strong>Duration:</strong>
        ${safeText(roadmap.duration || "-")}
      </p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-roadmap-btn">
          View
        </button>

        <button class="small-btn danger-btn delete-roadmap-btn">
          Delete
        </button>
      </div>
    `

    card
    .querySelector(".view-roadmap-btn")
    .addEventListener("click", ()=>{

      roadmapOutput.innerHTML =
      marked.parse(roadmap.roadmap_content || "")

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card
    .querySelector(".delete-roadmap-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this roadmap?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("learning_roadmaps")
      .delete()
      .eq("id", roadmap.id)

      if(error){
        console.error(error)
        alert("Could not delete roadmap.")
        return
      }

      await loadSavedRoadmaps()

    })

    savedRoadmaps.appendChild(card)

  })

}

async function generateRoadmap(){

  if(!premiumActive){

    const upgrade =
    confirm("Learning Roadmaps are a Premium feature. Upgrade to unlock personalised roadmaps and career planning.")

    if(upgrade){
      window.location.href =
      "pricing.html"
    }

    return

  }

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  if(goalInput.value.trim().length < 10){
    alert("Add a clearer learning goal first.")
    return
  }

  try{

    setGenerateState(
      true
    )

    const message =
    `
Create a detailed, practical UK learning roadmap.

Target role:
${targetRoleInput.value}

Current level:
${currentLevelInput.value || "Not provided"}

Current skills:
${skillsInput.value || "Not provided"}

Duration:
${durationInput.value}

Learning goal:
${goalInput.value || "Not provided"}

Return markdown with this structure:

# Roadmap Summary
# Skills Gap
# Weekly Plan
Break the plan into realistic weeks.

# Skills To Learn
# Qualifications And Certifications
# Portfolio Projects
# CV And LinkedIn Improvements
# Job Search Actions
# Weekly Milestones
# Final Checklist
# What To Do After This Roadmap

Rules:
- Use UK English.
- Be realistic.
- Do not recommend too many things at once.
- Focus on becoming employable, not just learning theory.
- Include practical project ideas.
- Include measurable weekly outcomes.
`

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
      alert(data.error)
      return
    }

    roadmapOutput.innerHTML =
    marked.parse(data.reply || "")

    const title =
    `${targetRoleInput.value || "Career"} Roadmap`

    const { error } =
    await supabase
    .from("learning_roadmaps")
    .insert([{
      user_id:currentUser.id,
      title:title,
      target_role:targetRoleInput.value,
      duration:durationInput.value,
      roadmap_content:data.reply
    }])

    if(error){
      console.error(error)
      alert("Roadmap generated, but could not save.")
      return
    }

    await loadSavedRoadmaps()

  }catch(error){

    console.error(error)

    alert(
      "Roadmap generation failed. Make sure backend is running."
    )

  }finally{

    setGenerateState(
      false
    )

  }

}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

generateRoadmapBtn.addEventListener(
  "click",
  generateRoadmap
)

generateRoadmapTopBtn.addEventListener(
  "click",
  generateRoadmap
)

targetRoleInput.addEventListener(
  "input",
  updateRoadmapMeta
)

currentLevelInput.addEventListener(
  "input",
  updateRoadmapMeta
)

skillsInput.addEventListener(
  "input",
  updateRoadmapMeta
)

goalInput.addEventListener(
  "input",
  updateRoadmapMeta
)

durationInput.addEventListener(
  "change",
  updateRoadmapMeta
)

currentUser =
await protectPage()

premiumActive =
await checkPremium()

setGenerateState(
  false
)

updateRoadmapMeta()

await loadSavedRoadmaps()