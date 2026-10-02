import {
  supabase,
  protectPage
}
from "/js/premium.js"

const logoutBtn =
document.getElementById("logoutBtn")

const saveProfileBtn =
document.getElementById("saveProfileBtn")

const saveProfileTopBtn =
document.getElementById("saveProfileTopBtn")

const targetRole =
document.getElementById("targetRole")

const targetSalary =
document.getElementById("targetSalary")

const experienceLevel =
document.getElementById("experienceLevel")

const currentSkills =
document.getElementById("currentSkills")

const industries =
document.getElementById("industries")

const strengths =
document.getElementById("strengths")

const weaknesses =
document.getElementById("weaknesses")

const learningGoal =
document.getElementById("learningGoal")

const profileStrength =
document.getElementById("profileStrength")

const profileStrengthBar =
document.getElementById("profileStrengthBar")

const targetRoleStat =
document.getElementById("targetRoleStat")

const salaryGoalStat =
document.getElementById("salaryGoalStat")

const levelStat =
document.getElementById("levelStat")

const memoryStatus =
document.getElementById("memoryStatus")

const nextAction =
document.getElementById("nextAction")

const profilePreview =
document.getElementById("profilePreview")

let currentUser = null

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function calculateProfileStrength(){

  const fields = [
    targetRole.value,
    targetSalary.value,
    experienceLevel.value,
    currentSkills.value,
    industries.value,
    strengths.value,
    weaknesses.value,
    learningGoal.value
  ]

  const complete =
  fields.filter(field =>
    String(field || "").trim().length > 2
  ).length

  return Math.round(
    (complete / fields.length) * 100
  )

}

function updateProfileUI(){

  const score =
  calculateProfileStrength()

  profileStrength.textContent =
  `${score}%`

  profileStrengthBar.style.width =
  `${score}%`

  targetRoleStat.textContent =
  targetRole.value.trim()
  ? targetRole.value.trim().slice(0, 14)
  : "Unset"

  salaryGoalStat.textContent =
  targetSalary.value.trim()
  ? targetSalary.value.trim().slice(0, 12)
  : "Unset"

  levelStat.textContent =
  experienceLevel.value || "Unset"

  if(score >= 85){
    memoryStatus.textContent =
    "Strong"

    nextAction.textContent =
    "Use AI"
  }else if(score >= 60){
    memoryStatus.textContent =
    "Good"

    nextAction.textContent =
    "Add gaps"
  }else if(score >= 35){
    memoryStatus.textContent =
    "Basic"

    nextAction.textContent =
    "Add skills"
  }else{
    memoryStatus.textContent =
    "Incomplete"

    nextAction.textContent =
    "Add details"
  }

  renderPreview()

}

function renderPreview(){

  if(calculateProfileStrength() === 0){

    profilePreview.innerHTML =
    "<p>No career profile saved yet.</p>"

    return

  }

  profilePreview.innerHTML =
  `
    <h3>${safeText(targetRole.value || "Career Goal Not Set")}</h3>

    <p>
      <strong>Target salary:</strong>
      ${safeText(targetSalary.value || "Not set")}
    </p>

    <p>
      <strong>Experience level:</strong>
      ${safeText(experienceLevel.value || "Not set")}
    </p>

    <p>
      <strong>Current skills:</strong>
      ${safeText(currentSkills.value || "Not set").replace(/\n/g, "<br>")}
    </p>

    <p>
      <strong>Industries:</strong>
      ${safeText(industries.value || "Not set").replace(/\n/g, "<br>")}
    </p>

    <p>
      <strong>Strengths:</strong>
      ${safeText(strengths.value || "Not set").replace(/\n/g, "<br>")}
    </p>

    <p>
      <strong>Weaknesses / gaps:</strong>
      ${safeText(weaknesses.value || "Not set").replace(/\n/g, "<br>")}
    </p>

    <p>
      <strong>Learning goal:</strong>
      ${safeText(learningGoal.value || "Not set").replace(/\n/g, "<br>")}
    </p>
  `

}

async function loadProfile(){

  currentUser =
  await protectPage()

  const { data, error } =
  await supabase
  .from("career_profiles")
  .select("*")
  .eq("user_id", currentUser.id)
  .maybeSingle()

  if(error){
    console.error(error)
    return
  }

  if(!data){
    updateProfileUI()
    return
  }

  targetRole.value =
  data.target_role || ""

  targetSalary.value =
  data.target_salary || ""

  experienceLevel.value =
  data.experience_level || ""

  currentSkills.value =
  data.current_skills || ""

  industries.value =
  data.industries || ""

  strengths.value =
  data.strengths || ""

  weaknesses.value =
  data.weaknesses || ""

  learningGoal.value =
  data.learning_goal || ""

  updateProfileUI()

}

function setSaveState(active){

  if(active){

    saveProfileBtn.textContent =
    "Saving..."

    saveProfileTopBtn.textContent =
    "Saving..."

    saveProfileBtn.classList.add(
      "loading-state"
    )

    saveProfileTopBtn.classList.add(
      "loading-state"
    )

  }else{

    saveProfileBtn.textContent =
    "Save Career Identity"

    saveProfileTopBtn.textContent =
    "Save Career Identity"

    saveProfileBtn.classList.remove(
      "loading-state"
    )

    saveProfileTopBtn.classList.remove(
      "loading-state"
    )

  }

}

async function saveProfile(){

  currentUser =
  await protectPage()

  if(targetRole.value.trim().length < 2){
    alert("Add your target role first.")
    return
  }

  try{

    setSaveState(
      true
    )

    const payload = {
      user_id:currentUser.id,
      target_role:targetRole.value,
      target_salary:targetSalary.value,
      experience_level:experienceLevel.value,
      current_skills:currentSkills.value,
      industries:industries.value,
      strengths:strengths.value,
      weaknesses:weaknesses.value,
      learning_goal:learningGoal.value,
      updated_at:new Date().toISOString()
    }

    const { error } =
    await supabase
    .from("career_profiles")
    .upsert(payload, {
      onConflict:"user_id"
    })

    if(error){
      console.error(error)
      alert("Failed to save profile.")
      return
    }

    updateProfileUI()

    alert("Career identity saved successfully.")

  }catch(error){

    console.error(error)

    alert("Could not save career profile.")

  }finally{

    setSaveState(
      false
    )

  }

}

[
  targetRole,
  targetSalary,
  experienceLevel,
  currentSkills,
  industries,
  strengths,
  weaknesses,
  learningGoal
].forEach((field)=>{

  field.addEventListener(
    "input",
    updateProfileUI
  )

  field.addEventListener(
    "change",
    updateProfileUI
  )

})

saveProfileBtn.addEventListener(
  "click",
  saveProfile
)

saveProfileTopBtn.addEventListener(
  "click",
  saveProfile
)

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

await loadProfile()