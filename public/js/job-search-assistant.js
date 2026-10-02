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

const locationInput =
document.getElementById("locationInput")

const workStyleInput =
document.getElementById("workStyleInput")

const experienceLevelInput =
document.getElementById("experienceLevelInput")

const skillsInput =
document.getElementById("skillsInput")

const notesInput =
document.getElementById("notesInput")

const generateSearchPlanBtn =
document.getElementById("generateSearchPlanBtn")

const searchPlanOutput =
document.getElementById("searchPlanOutput")

const savedSearchPlans =
document.getElementById("savedSearchPlans")

const copySearchPlanBtn =
document.getElementById("copySearchPlanBtn")

const exportSearchPlanBtn =
document.getElementById("exportSearchPlanBtn")

const searchPromptButtons =
document.querySelectorAll(".search-prompt-btn")

let currentUser = null
let latestPlanText = ""

function renderPlan(text){

  latestPlanText =
  text || ""

  searchPlanOutput.innerHTML =
  marked.parse(latestPlanText)

}

async function loadSavedPlans(){

  const { data, error } =
  await supabase
  .from("job_search_plans")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    savedSearchPlans.innerHTML =
    "<p>Could not load saved plans.</p>"
    return
  }

  if(!data || data.length === 0){
    savedSearchPlans.innerHTML =
    "<p>No saved job search plans yet.</p>"
    return
  }

  savedSearchPlans.innerHTML =
  ""

  data.forEach((plan)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card"

    card.innerHTML =
    `
      <h4>${plan.target_role || "Job Search Plan"}</h4>
      <p><strong>Location:</strong> ${plan.location || "-"}</p>
      <p><strong>Work style:</strong> ${plan.work_style || "-"}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-plan-btn">View</button>
        <button class="small-btn danger-btn delete-plan-btn">Delete</button>
      </div>
    `

    card.querySelector(".view-plan-btn")
    .addEventListener("click", ()=>{

      renderPlan(
        plan.plan_content || ""
      )

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card.querySelector(".delete-plan-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this search plan?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("job_search_plans")
      .delete()
      .eq("id", plan.id)

      if(error){
        console.error(error)
        alert("Could not delete plan.")
        return
      }

      await loadSavedPlans()

    })

    savedSearchPlans.appendChild(card)

  })

}

async function generateSearchPlan(){

  currentUser =
  await protectPage()

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  try{

    generateSearchPlanBtn.textContent =
    "Generating..."

    generateSearchPlanBtn.classList.add(
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
Create a UK job search strategy.

Target role:
${targetRoleInput.value}

Location:
${locationInput.value}

Work style:
${workStyleInput.value}

Experience level:
${experienceLevelInput.value}

Skills:
${skillsInput.value}

Extra notes:
${notesInput.value}

Return:
# Best Job Titles To Search
# Search Keywords
# Best Job Boards
# Weekly Application Targets
# Companies To Target
# Networking Strategy
# LinkedIn Search Strategy
# CV Positioning
# Cover Letter Angle
# 7 Day Action Plan
# 30 Day Job Search Plan
# Mistakes To Avoid

Be practical, realistic and UK-focused.
`
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    const planText =
    data.reply || ""

    renderPlan(
      planText
    )

    const { error } =
    await supabase
    .from("job_search_plans")
    .insert([{
      user_id:currentUser.id,
      target_role:targetRoleInput.value,
      location:locationInput.value,
      work_style:workStyleInput.value,
      experience_level:experienceLevelInput.value,
      skills:skillsInput.value,
      plan_content:planText
    }])

    if(error){
      console.error(error)
      alert("Plan generated, but could not save.")
      return
    }

    await loadSavedPlans()

  }catch(error){

    console.error(error)

    alert(
      "Search plan generation failed. Make sure backend is running."
    )

  }finally{

    generateSearchPlanBtn.textContent =
    "Generate Search Plan"

    generateSearchPlanBtn.classList.remove(
      "loading-state"
    )

  }

}

searchPromptButtons.forEach((button)=>{

  button.addEventListener("click", ()=>{

    notesInput.value =
    button.textContent

    notesInput.focus()

  })

})

copySearchPlanBtn.addEventListener("click", async ()=>{

  await navigator.clipboard.writeText(
    latestPlanText || searchPlanOutput.innerText
  )

  copySearchPlanBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copySearchPlanBtn.textContent =
    "Copy Plan"
  }, 1500)

})

exportSearchPlanBtn.addEventListener("click", ()=>{

  const blob =
  new Blob([latestPlanText || searchPlanOutput.innerText], {
    type:"text/plain"
  })

  const url =
  URL.createObjectURL(blob)

  const a =
  document.createElement("a")

  a.href =
  url

  a.download =
  "JobReady-Job-Search-Plan.txt"

  a.click()

  URL.revokeObjectURL(url)

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

generateSearchPlanBtn.addEventListener(
  "click",
  generateSearchPlan
)

currentUser =
await protectPage()

await loadSavedPlans()