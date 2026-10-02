import { supabaseUrl, supabaseKey }
from "/js/config.js"

import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase =
createClient(supabaseUrl, supabaseKey)

const companyInput =
document.getElementById("companyInput")

const roleInput =
document.getElementById("roleInput")

const statusInput =
document.getElementById("statusInput")

const notesInput =
document.getElementById("notesInput")

const saveJobBtn =
document.getElementById("saveJobBtn")

const jobList =
document.getElementById("jobList")

const totalApplications =
document.getElementById("totalApplications")

const totalInterviews =
document.getElementById("totalInterviews")

const totalOffers =
document.getElementById("totalOffers")

const logoutBtn =
document.getElementById("logoutBtn")

const statuses = [
  "Saved",
  "Applied",
  "Interview",
  "Offer",
  "Rejected"
]

async function protectPage(){

  const { data:{ user } } =
  await supabase.auth.getUser()

  if(!user){
    window.location.href = "login.html"
  }

}

async function saveJob(){

  const { data:{ user } } =
  await supabase.auth.getUser()

  if(!user){
    return
  }

  if(companyInput.value.trim().length < 2){
    alert("Enter a company name.")
    return
  }

  if(roleInput.value.trim().length < 2){
    alert("Enter a role.")
    return
  }

  const { error } =
  await supabase
  .from("job_applications")
  .insert([{
    user_id:user.id,
    company:companyInput.value,
    role:roleInput.value,
    status:statusInput.value,
    notes:notesInput.value
  }])

  if(error){
    console.error(error)
    alert("Failed to save application.")
    return
  }

  companyInput.value = ""
  roleInput.value = ""
  notesInput.value = ""
  statusInput.value = "Saved"

  await loadJobs()

  alert("Application saved.")
}

async function updateJobStatus(jobId, newStatus){

  const { error } =
  await supabase
  .from("job_applications")
  .update({
    status:newStatus
  })
  .eq("id", jobId)

  if(error){
    console.error(error)
    alert("Failed to update status.")
    return
  }

  await loadJobs()

}

async function deleteJob(jobId){

  const confirmDelete =
  confirm("Delete this application?")

  if(!confirmDelete){
    return
  }

  const { error } =
  await supabase
  .from("job_applications")
  .delete()
  .eq("id", jobId)

  if(error){
    console.error(error)
    alert("Failed to delete application.")
    return
  }

  await loadJobs()

}

async function loadJobs(){

  const { data:{ user } } =
  await supabase.auth.getUser()

  if(!user){
    return
  }

  const { data, error } =
  await supabase
  .from("job_applications")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending:false })

  if(error){
    console.error(error)
    return
  }

  totalApplications.textContent =
  data.length

  totalInterviews.textContent =
  data.filter(job =>
    job.status === "Interview"
  ).length

  totalOffers.textContent =
  data.filter(job =>
    job.status === "Offer"
  ).length

  if(data.length === 0){

    jobList.innerHTML = `
      <p>No job applications yet.</p>
    `

    return
  }

  jobList.innerHTML = ""

  data.forEach((job)=>{

    const card =
    document.createElement("div")

    card.className =
    "cv-card"

    const statusOptions =
    statuses
    .map(status => `
      <option
        value="${status}"
        ${job.status === status ? "selected" : ""}
      >
        ${status}
      </option>
    `)
    .join("")

    card.innerHTML = `
      <div class="cv-card-top">

        <div>
          <h3>${job.role || "Untitled Role"}</h3>
          <p>${job.company || "No company added"}</p>
        </div>

        <div class="cv-score">
          ${job.status}
        </div>

      </div>

      <p>
        ${job.notes || "No notes added."}
      </p>

      <div class="form-group">
        <label>Update Status</label>

        <select class="status-select update-status">
          ${statusOptions}
        </select>
      </div>

      <div class="cv-card-actions">
        <button class="small-btn danger-btn delete-job-btn">
          Delete
        </button>
      </div>
    `

    card
    .querySelector(".update-status")
    .addEventListener("change", (event)=>{

      updateJobStatus(
        job.id,
        event.target.value
      )

    })

    card
    .querySelector(".delete-job-btn")
    .addEventListener("click", ()=>{

      deleteJob(job.id)

    })

    jobList.appendChild(card)

  })

}

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

saveJobBtn.addEventListener(
  "click",
  saveJob
)

protectPage()
loadJobs()