import {
  apiFetch,
  supabase,
  protectPage
}
from "/js/premium.js"

import { marked }
from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js"

const logoutBtn = document.getElementById("logoutBtn")
const generateTopBtn = document.getElementById("generateTopBtn")
const generateBulletsBtn = document.getElementById("generateBulletsBtn")

const targetRoleInput = document.getElementById("targetRoleInput")
const dutyInput = document.getElementById("dutyInput")
const industryInput = document.getElementById("industryInput")
const toneInput = document.getElementById("toneInput")

const inputQuality = document.getElementById("inputQuality")
const bulletStrength = document.getElementById("bulletStrength")
const keywordCount = document.getElementById("keywordCount")

const bulletsOutput = document.getElementById("bulletsOutput")
const achievementOutput = document.getElementById("achievementOutput")
const keywordsOutput = document.getElementById("keywordsOutput")
const savedBulletsList = document.getElementById("savedBulletsList")

const copyBulletsBtn = document.getElementById("copyBulletsBtn")
const copyAchievementBtn = document.getElementById("copyAchievementBtn")
const sendToBuilderBtn = document.getElementById("sendToBuilderBtn")

const exampleDutyButtons = document.querySelectorAll(".example-duty")

let currentUser = null
let latestBullets = ""
let latestAchievement = ""
let latestKeywords = ""

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function calculateInputQuality(){
  let score = 20

  if(targetRoleInput.value.trim().length > 2) score += 20
  if(dutyInput.value.trim().length > 20) score += 30
  if(industryInput.value.trim().length > 2) score += 15
  if(/\d/.test(dutyInput.value)) score += 15

  score = Math.min(score, 100)

  inputQuality.textContent = `${score}%`

  return score
}

function renderKeywords(text){
  const keywords =
  String(text || "")
  .split(/,|\n/)
  .map(item => item.trim())
  .filter(Boolean)

  keywordCount.textContent =
  keywords.length

  if(keywords.length === 0){
    keywordsOutput.innerHTML = "<p>No keywords yet.</p>"
    return
  }

  keywordsOutput.innerHTML =
  keywords
  .map(keyword => `<span class="keyword-chip">${safeText(keyword)}</span>`)
  .join("")
}

function renderResult(data){
  latestBullets =
  data.bullets || ""

  latestAchievement =
  data.achievementVersion || ""

  latestKeywords =
  data.keywords || ""

  bulletStrength.textContent =
  `${data.strengthScore || 0}%`

  bulletsOutput.innerHTML =
  marked.parse(latestBullets || "")

  achievementOutput.innerHTML =
  `<p>${safeText(latestAchievement).replace(/\n/g, "<br>")}</p>`

  renderKeywords(latestKeywords)
}

async function loadSavedBullets(){
  const { data, error } =
  await supabase
  .from("bullet_sets")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    savedBulletsList.innerHTML =
    "<p>Could not load saved bullets.</p>"
    return
  }

  const rows =
  data || []

  if(rows.length === 0){
    savedBulletsList.innerHTML =
    "<p>No saved bullet sets yet.</p>"
    return
  }

  savedBulletsList.innerHTML = ""

  rows.slice(0, 8).forEach((item)=>{
    const card =
    document.createElement("div")

    card.className =
    "question-card"

    card.innerHTML =
    `
      <h4>${safeText(item.target_role || "Bullet Set")}</h4>
      <p><strong>Strength:</strong> ${item.strength_score || 0}%</p>
      <p>${safeText(item.original_duty || "").slice(0,120)}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-bullets-btn">View</button>
        <button class="small-btn danger-btn delete-bullets-btn">Delete</button>
      </div>
    `

    card.querySelector(".view-bullets-btn").addEventListener("click", ()=>{
      renderResult({
        bullets:item.bullets,
        achievementVersion:item.achievement_version,
        keywords:item.keywords,
        strengthScore:item.strength_score
      })

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card.querySelector(".delete-bullets-btn").addEventListener("click", async ()=>{
      const confirmDelete =
      confirm("Delete this bullet set?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("bullet_sets")
      .delete()
      .eq("id", item.id)

      if(error){
        console.error(error)
        alert("Could not delete bullet set.")
        return
      }

      await loadSavedBullets()
    })

    savedBulletsList.appendChild(card)
  })
}

async function generateBullets(){
  currentUser =
  await protectPage()

  calculateInputQuality()

  if(dutyInput.value.trim().length < 5){
    alert("Describe the duty or experience first.")
    return
  }

  try{
    generateBulletsBtn.textContent = "Generating..."
    generateTopBtn.textContent = "Generating..."

    generateBulletsBtn.classList.add("loading-state")
    generateTopBtn.classList.add("loading-state")

    const response =
    await apiFetch("/api/bullet-generator", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id,
        targetRole:targetRoleInput.value,
        duty:dutyInput.value,
        industry:industryInput.value,
        tone:toneInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    renderResult(data)

    const { error } =
    await supabase
    .from("bullet_sets")
    .insert([{
      user_id:currentUser.id,
      target_role:targetRoleInput.value,
      industry:industryInput.value,
      tone:toneInput.value,
      original_duty:dutyInput.value,
      bullets:data.bullets || "",
      achievement_version:data.achievementVersion || "",
      keywords:data.keywords || "",
      strength_score:data.strengthScore || 0
    }])

    if(error){
      console.error(error)
      alert("Bullets generated, but could not save.")
      return
    }

    await loadSavedBullets()

  }catch(error){
    console.error(error)
    alert("Bullet generation failed. Make sure backend is running.")
  }finally{
    generateBulletsBtn.textContent = "Generate Strong Bullets"
    generateTopBtn.textContent = "Generate Bullets"

    generateBulletsBtn.classList.remove("loading-state")
    generateTopBtn.classList.remove("loading-state")
  }
}

async function copyText(button, text, defaultLabel){
  await navigator.clipboard.writeText(text || "")

  button.textContent =
  "Copied!"

  setTimeout(()=>{
    button.textContent =
    defaultLabel
  }, 1500)
}

function sendToBuilder(){
  if(!latestBullets){
    alert("Generate bullets first.")
    return
  }

  const existing =
  localStorage.getItem("jobready_imported_cv")

  let payload = {}

  if(existing){
    try{
      payload = JSON.parse(existing)
    }catch(error){
      payload = {}
    }
  }

  payload.jobTitle =
  payload.jobTitle || targetRoleInput.value

  payload.experience =
  latestBullets

  if(latestKeywords){
    payload.skills =
    payload.skills
    ? `${payload.skills}, ${latestKeywords}`
    : latestKeywords
  }

  localStorage.setItem(
    "jobready_imported_cv",
    JSON.stringify(payload)
  )

  window.location.href =
  "builder.html"
}

exampleDutyButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    dutyInput.value =
    button.textContent.trim()

    calculateInputQuality()
  })
})

targetRoleInput.addEventListener("input", calculateInputQuality)
dutyInput.addEventListener("input", calculateInputQuality)
industryInput.addEventListener("input", calculateInputQuality)

generateBulletsBtn.addEventListener("click", generateBullets)
generateTopBtn.addEventListener("click", generateBullets)

copyBulletsBtn.addEventListener("click", ()=>{
  copyText(copyBulletsBtn, latestBullets || bulletsOutput.innerText, "Copy Bullets")
})

copyAchievementBtn.addEventListener("click", ()=>{
  copyText(copyAchievementBtn, latestAchievement || achievementOutput.innerText, "Copy Achievement Version")
})

sendToBuilderBtn.addEventListener("click", sendToBuilder)

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

currentUser =
await protectPage()

calculateInputQuality()
await loadSavedBullets()