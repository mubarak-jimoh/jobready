import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium
}
from "/js/premium.js"

const logoutBtn = document.getElementById("logoutBtn")
const jobRoleInput = document.getElementById("jobRoleInput")
const locationInput = document.getElementById("locationInput")
const experienceInput = document.getElementById("experienceInput")
const skillsInput = document.getElementById("skillsInput")
const salaryBtn = document.getElementById("salaryBtn")

const juniorSalary = document.getElementById("juniorSalary")
const midSalary = document.getElementById("midSalary")
const seniorSalary = document.getElementById("seniorSalary")
const salaryRoleTitle = document.getElementById("salaryRoleTitle")
const salaryOutput = document.getElementById("salaryOutput")

let premiumActive =
await checkPremium()

function updateButton(){
  salaryBtn.textContent =
  premiumActive
  ? "Analyse Salary Path"
  : "Analyse Salary Path · Premium"
}

salaryBtn.addEventListener("click", async ()=>{

  const user =
  await protectPage()

  if(jobRoleInput.value.trim().length < 2){
    alert("Enter a job role first.")
    return
  }

  try{

    salaryBtn.textContent = "Analysing..."
    salaryBtn.classList.add("loading-state")

    const response =
    await apiFetch("/api/salary-path", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        jobRole:jobRoleInput.value,
        location:locationInput.value,
        experienceLevel:experienceInput.value,
        skills:skillsInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    juniorSalary.textContent =
    data.juniorSalary || "-"

    midSalary.textContent =
    data.midSalary || "-"

    seniorSalary.textContent =
    data.seniorSalary || "-"

    salaryRoleTitle.textContent =
    `${data.role || jobRoleInput.value} Salary Path`

    salaryOutput.innerHTML =
    `
      <div class="salary-block">
        <h4>Salary Summary</h4>
        <p>${data.salarySummary}</p>

        <h4>Progression Path</h4>
        <ul>
          ${(data.progressionPath || [])
          .map(item => `<li>${item}</li>`)
          .join("")}
        </ul>

        <h4>Skills To Increase Salary</h4>
        <ul>
          ${(data.skillsToIncreaseSalary || [])
          .map(item => `<li>${item}</li>`)
          .join("")}
        </ul>

        <h4>Next Best Move</h4>
        <p>${data.nextBestMove}</p>

        <div class="accuracy-note">
          ${data.accuracyNote || "Salary figures are estimates and can vary by employer, location, industry, and market conditions."}
        </div>
      </div>
    `

  }catch(error){

    console.error(error)
    alert("Salary analysis failed. Make sure backend is running.")

  }finally{

    premiumActive =
    await checkPremium()

    updateButton()

    salaryBtn.classList.remove("loading-state")

  }

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

await protectPage()
updateButton()