import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium
}
from "/js/premium.js"

const logoutBtn = document.getElementById("logoutBtn")
const careerGoalInput = document.getElementById("careerGoalInput")
const skillsInput = document.getElementById("skillsInput")
const experienceInput = document.getElementById("experienceInput")
const messageInput = document.getElementById("messageInput")
const askCoachBtn = document.getElementById("askCoachBtn")
const coachOutput = document.getElementById("coachOutput")

let premiumActive =
await checkPremium()

function updateButton(){

  askCoachBtn.textContent =
  premiumActive
  ? "Ask Career Coach"
  : "Ask Career Coach · Premium"

}

askCoachBtn.addEventListener("click", async ()=>{

  const user =
  await protectPage()

  if(messageInput.value.trim().length < 3){
    alert("Ask the coach a question first.")
    return
  }

  try{

    askCoachBtn.textContent =
    "Thinking..."

    askCoachBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/career-coach", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:user.id,
        message:messageInput.value,
        careerGoal:careerGoalInput.value,
        currentSkills:skillsInput.value,
        experience:experienceInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    coachOutput.innerHTML =
    `
      <div class="salary-block">
        <h4>Advice</h4>
        <p>${data.reply}</p>

        <h4>Next Steps</h4>
        <ul>
          ${(data.nextSteps || [])
          .map(item => `<li>${item}</li>`)
          .join("")}
        </ul>

        <h4>Skills To Build</h4>
        <ul>
          ${(data.skillsToBuild || [])
          .map(item => `<li>${item}</li>`)
          .join("")}
        </ul>

        <h4>Job Suggestions</h4>
        <ul>
          ${(data.jobSuggestions || [])
          .map(item => `<li>${item}</li>`)
          .join("")}
        </ul>
      </div>
    `

  }catch(error){

    console.error(error)

    alert(
      "Career coach failed. Make sure backend is running."
    )

  }finally{

    premiumActive =
    await checkPremium()

    updateButton()

    askCoachBtn.classList.remove(
      "loading-state"
    )

  }

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

await protectPage()
updateButton()