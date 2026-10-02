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

const targetRoleInput =
document.getElementById("targetRoleInput")

const experienceLevelInput =
document.getElementById("experienceLevelInput")

const skillsInput =
document.getElementById("skillsInput")

const industryInput =
document.getElementById("industryInput")

const generatePortfolioBtn =
document.getElementById("generatePortfolioBtn")

const portfolioOutput =
document.getElementById("portfolioOutput")

const savedPortfolioPlans =
document.getElementById("savedPortfolioPlans")

const copyPortfolioBtn =
document.getElementById("copyPortfolioBtn")

const exportPortfolioBtn =
document.getElementById("exportPortfolioBtn")

let currentUser = null
let latestPortfolioText = ""

function renderPortfolio(text){

  latestPortfolioText =
  text || ""

  portfolioOutput.innerHTML =
  marked.parse(latestPortfolioText)

}

async function loadSavedPortfolioPlans(){

  const { data, error } =
  await supabase
  .from("portfolio_projects")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    savedPortfolioPlans.innerHTML =
    "<p>Could not load portfolio plans.</p>"
    return
  }

  if(!data || data.length === 0){
    savedPortfolioPlans.innerHTML =
    "<p>No saved portfolio plans yet.</p>"
    return
  }

  savedPortfolioPlans.innerHTML =
  ""

  data.forEach((plan)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card"

    card.innerHTML =
    `
      <h4>${plan.target_role || "Portfolio Plan"}</h4>
      <p><strong>Level:</strong> ${plan.experience_level || "-"}</p>
      <p><strong>Skills:</strong> ${plan.skills || "-"}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-portfolio-btn">View</button>
        <button class="small-btn danger-btn delete-portfolio-btn">Delete</button>
      </div>
    `

    card.querySelector(".view-portfolio-btn")
    .addEventListener("click", ()=>{

      renderPortfolio(
        plan.project_content || ""
      )

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card.querySelector(".delete-portfolio-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this portfolio plan?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("portfolio_projects")
      .delete()
      .eq("id", plan.id)

      if(error){
        console.error(error)
        alert("Could not delete portfolio plan.")
        return
      }

      await loadSavedPortfolioPlans()

    })

    savedPortfolioPlans.appendChild(card)

  })

}

async function generatePortfolio(){

  currentUser =
  await protectPage()

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  try{

    generatePortfolioBtn.textContent =
    "Generating..."

    generatePortfolioBtn.classList.add(
      "loading-state"
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
Create a portfolio project plan for this user.

Target role:
${targetRoleInput.value}

Experience level:
${experienceLevelInput.value}

Skills:
${skillsInput.value}

Industry / interest:
${industryInput.value}

Return:
# Portfolio Strategy
# Best Project Ideas
# Project 1 Build Plan
# Project 2 Build Plan
# Project 3 Build Plan
# Tools To Use
# What To Show On GitHub Or Portfolio
# How To Explain These Projects On A CV
# How To Explain These Projects On LinkedIn
# Recruiter Advice
# 30 Day Build Plan

Rules:
- Make projects realistic.
- Do not suggest impossible enterprise-scale projects.
- Prioritise employability.
- Use UK English.
- Make it practical for students, graduates, juniors or career switchers.
`
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    const portfolioText =
    data.reply || ""

    renderPortfolio(
      portfolioText
    )

    const { error } =
    await supabase
    .from("portfolio_projects")
    .insert([{
      user_id:currentUser.id,
      target_role:targetRoleInput.value,
      skills:skillsInput.value,
      experience_level:experienceLevelInput.value,
      project_content:portfolioText
    }])

    if(error){
      console.error(error)
      alert("Portfolio plan generated, but could not save.")
      return
    }

    await loadSavedPortfolioPlans()

  }catch(error){

    console.error(error)

    alert(
      "Portfolio generation failed. Make sure backend is running."
    )

  }finally{

    generatePortfolioBtn.textContent =
    "Generate Portfolio Projects"

    generatePortfolioBtn.classList.remove(
      "loading-state"
    )

  }

}

copyPortfolioBtn.addEventListener("click", async ()=>{

  await navigator.clipboard.writeText(
    latestPortfolioText || portfolioOutput.innerText
  )

  copyPortfolioBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyPortfolioBtn.textContent =
    "Copy Portfolio Plan"
  }, 1500)

})

exportPortfolioBtn.addEventListener("click", ()=>{

  const blob =
  new Blob([latestPortfolioText || portfolioOutput.innerText], {
    type:"text/plain"
  })

  const url =
  URL.createObjectURL(blob)

  const a =
  document.createElement("a")

  a.href =
  url

  a.download =
  "JobReady-Portfolio-Plan.txt"

  a.click()

  URL.revokeObjectURL(url)

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

generatePortfolioBtn.addEventListener(
  "click",
  generatePortfolio
)

currentUser =
await protectPage()

await loadSavedPortfolioPlans()