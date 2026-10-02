import {
  supabase,
  protectPage
}
from "/js/premium.js"

const logoutBtn =
document.getElementById("logoutBtn")

const generateMissionsBtn =
document.getElementById("generateMissionsBtn")

const missionsList =
document.getElementById("missionsList")

const activeMissionCount =
document.getElementById("activeMissionCount")

const completedMissionCount =
document.getElementById("completedMissionCount")

const missionProgress =
document.getElementById("missionProgress")

let currentUser = null

const defaultMissions = [
  {
    title:"Apply to 10 relevant jobs",
    description:"Focus on quality roles that match your target career direction.",
    mission_type:"applications",
    target_value:10
  },
  {
    title:"Improve your CV score",
    description:"Update your CV summary, skills and experience with stronger evidence.",
    mission_type:"cv",
    target_value:1
  },
  {
    title:"Optimise your LinkedIn profile",
    description:"Improve your headline, About section and recruiter keywords.",
    mission_type:"linkedin",
    target_value:1
  },
  {
    title:"Message 3 recruiters",
    description:"Use recruiter outreach to increase opportunities beyond job boards.",
    mission_type:"recruiter",
    target_value:3
  },
  {
    title:"Complete 1 portfolio task",
    description:"Build proof of skill with a project, case study or GitHub update.",
    mission_type:"portfolio",
    target_value:1
  }
]

async function loadMissions(){

  const { data, error } =
  await supabase
  .from("career_missions")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    missionsList.innerHTML =
    "<p>Could not load missions.</p>"
    return
  }

  const missions =
  data || []

  const completed =
  missions.filter(mission => mission.completed).length

  activeMissionCount.textContent =
  missions.filter(mission => !mission.completed).length

  completedMissionCount.textContent =
  completed

  const progress =
  missions.length > 0
  ? Math.round((completed / missions.length) * 100)
  : 0

  missionProgress.textContent =
  `${progress}%`

  if(missions.length === 0){
    missionsList.innerHTML =
    "<p>No missions yet. Generate your weekly missions.</p>"
    return
  }

  missionsList.innerHTML =
  ""

  missions.forEach((mission)=>{

    const percent =
    mission.target_value > 0
    ? Math.min(Math.round((mission.current_value / mission.target_value) * 100), 100)
    : 0

    const card =
    document.createElement("div")

    card.className =
    mission.completed
    ? "question-card mission-card mission-complete"
    : "question-card mission-card"

    card.innerHTML =
    `
      <div class="mission-top-row">
        <div>
          <h4>${mission.title}</h4>
          <p>${mission.description || ""}</p>
        </div>

        <strong>${percent}%</strong>
      </div>

      <div class="mission-progress-bar">
        <div style="width:${percent}%;"></div>
      </div>

      <p>
        ${mission.current_value || 0}/${mission.target_value || 1} completed
      </p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn mission-plus-btn">
          + Progress
        </button>

        <button class="small-btn danger-btn mission-delete-btn">
          Delete
        </button>
      </div>
    `

    card
    .querySelector(".mission-plus-btn")
    .addEventListener("click", async ()=>{

      const newValue =
      Math.min(
        (mission.current_value || 0) + 1,
        mission.target_value || 1
      )

      const isComplete =
      newValue >= (mission.target_value || 1)

      const { error } =
      await supabase
      .from("career_missions")
      .update({
        current_value:newValue,
        completed:isComplete,
        updated_at:new Date().toISOString()
      })
      .eq("id", mission.id)

      if(error){
        console.error(error)
        alert("Could not update mission.")
        return
      }

      await loadMissions()

    })

    card
    .querySelector(".mission-delete-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this mission?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("career_missions")
      .delete()
      .eq("id", mission.id)

      if(error){
        console.error(error)
        alert("Could not delete mission.")
        return
      }

      await loadMissions()

    })

    missionsList.appendChild(card)

  })

}

async function generateMissions(){

  currentUser =
  await protectPage()

  generateMissionsBtn.textContent =
  "Generating..."

  generateMissionsBtn.classList.add(
    "loading-state"
  )

  const rows =
  defaultMissions.map((mission)=>{
    return {
      user_id:currentUser.id,
      title:mission.title,
      description:mission.description,
      mission_type:mission.mission_type,
      target_value:mission.target_value,
      current_value:0,
      completed:false
    }
  })

  const { error } =
  await supabase
  .from("career_missions")
  .insert(rows)

  generateMissionsBtn.textContent =
  "Generate Missions"

  generateMissionsBtn.classList.remove(
    "loading-state"
  )

  if(error){
    console.error(error)
    alert("Could not generate missions.")
    return
  }

  await loadMissions()

}

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

generateMissionsBtn.addEventListener(
  "click",
  generateMissions
)

currentUser =
await protectPage()

await loadMissions()