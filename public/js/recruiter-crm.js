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

const nameInput =
document.getElementById("nameInput")

const companyInput =
document.getElementById("companyInput")

const roleInput =
document.getElementById("roleInput")

const linkedinInput =
document.getElementById("linkedinInput")

const emailInput =
document.getElementById("emailInput")

const statusInput =
document.getElementById("statusInput")

const followUpInput =
document.getElementById("followUpInput")

const notesInput =
document.getElementById("notesInput")

const saveContactBtn =
document.getElementById("saveContactBtn")

const generateMessageBtn =
document.getElementById("generateMessageBtn")

const generateMessageTopBtn =
document.getElementById("generateMessageTopBtn")

const messageOutput =
document.getElementById("messageOutput")

const copyMessageBtn =
document.getElementById("copyMessageBtn")

const contactsList =
document.getElementById("contactsList")

const totalContacts =
document.getElementById("totalContacts")

const followUps =
document.getElementById("followUps")

const warmLeads =
document.getElementById("warmLeads")

const networkStrength =
document.getElementById("networkStrength")

const networkStrengthBar =
document.getElementById("networkStrengthBar")

const pipelineStage =
document.getElementById("pipelineStage")

const nextAction =
document.getElementById("nextAction")

let currentUser = null
let latestMessage = ""

function safeText(text){

  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")

}

function calculateInputStrength(){

  let score = 0

  if(nameInput.value.trim().length > 1) score += 15
  if(companyInput.value.trim().length > 1) score += 15
  if(roleInput.value.trim().length > 2) score += 15
  if(linkedinInput.value.trim().length > 8) score += 15
  if(emailInput.value.trim().length > 5) score += 15
  if(followUpInput.value) score += 10
  if(notesInput.value.trim().length > 15) score += 15

  return Math.min(score, 100)

}

function updateMeta(){

  const score =
  calculateInputStrength()

  networkStrength.textContent =
  `${score}%`

  networkStrengthBar.style.width =
  `${score}%`

  pipelineStage.textContent =
  statusInput.value || "New"

  if(score >= 80){
    nextAction.textContent =
    "Send message"
  }else if(score >= 55){
    nextAction.textContent =
    "Add notes"
  }else if(score >= 30){
    nextAction.textContent =
    "Add contact"
  }else{
    nextAction.textContent =
    "Start"
  }

}

function clearForm(){

  nameInput.value = ""
  companyInput.value = ""
  roleInput.value = ""
  linkedinInput.value = ""
  emailInput.value = ""
  statusInput.value = "New"
  followUpInput.value = ""
  notesInput.value = ""
  latestMessage = ""

  messageOutput.innerHTML =
  "<p>No outreach message generated yet.</p>"

  updateMeta()

}

function renderMessage(text){

  latestMessage =
  text || ""

  messageOutput.innerHTML =
  marked.parse(latestMessage)

}

function isDueSoon(dateString){

  if(!dateString){
    return false
  }

  const today =
  new Date()

  const due =
  new Date(dateString)

  const days =
  Math.ceil((due - today) / (1000 * 60 * 60 * 24))

  return days >= 0 && days <= 7

}

async function loadContacts(){

  const { data, error } =
  await supabase
  .from("recruiter_contacts")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)
    contactsList.innerHTML =
    "<p>Could not load contacts.</p>"
    return
  }

  const contacts =
  data || []

  totalContacts.textContent =
  contacts.length

  followUps.textContent =
  contacts.filter(contact =>
    isDueSoon(contact.follow_up_date)
  ).length

  warmLeads.textContent =
  contacts.filter(contact =>
    contact.status === "Warm Lead" ||
    contact.status === "Replied" ||
    contact.status === "Interviewing"
  ).length

  if(contacts.length === 0){
    contactsList.innerHTML =
    "<p>No recruiter contacts yet.</p>"
    return
  }

  contactsList.innerHTML =
  ""

  contacts.forEach((contact)=>{

    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    const linkedinLink =
    contact.linkedin_url
    ? `<a class="small-btn view-btn" href="${safeText(contact.linkedin_url)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`
    : ""

    const emailLink =
    contact.email
    ? `<a class="small-btn view-btn" href="mailto:${safeText(contact.email)}">Email</a>`
    : ""

    card.innerHTML =
    `
      <h4>${safeText(contact.name || "Unnamed Contact")}</h4>

      <p><strong>Company:</strong> ${safeText(contact.company || "-")}</p>
      <p><strong>Role:</strong> ${safeText(contact.role || "-")}</p>
      <p><strong>Status:</strong> ${safeText(contact.status || "New")}</p>
      <p><strong>Follow-up:</strong> ${safeText(contact.follow_up_date || "-")}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-contact-btn">Load</button>
        ${linkedinLink}
        ${emailLink}
        <button class="small-btn danger-btn delete-contact-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-contact-btn")
    .addEventListener("click", ()=>{

      nameInput.value =
      contact.name || ""

      companyInput.value =
      contact.company || ""

      roleInput.value =
      contact.role || ""

      linkedinInput.value =
      contact.linkedin_url || ""

      emailInput.value =
      contact.email || ""

      statusInput.value =
      contact.status || "New"

      followUpInput.value =
      contact.follow_up_date || ""

      notesInput.value =
      contact.notes || ""

      renderMessage(
        contact.outreach_message || "No outreach message saved for this contact."
      )

      updateMeta()

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })

    })

    card
    .querySelector(".delete-contact-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this recruiter contact?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("recruiter_contacts")
      .delete()
      .eq("id", contact.id)

      if(error){
        console.error(error)
        alert("Could not delete contact.")
        return
      }

      await loadContacts()

    })

    contactsList.appendChild(card)

  })

}

async function saveContact(){

  currentUser =
  await protectPage()

  if(nameInput.value.trim().length < 2 && companyInput.value.trim().length < 2){
    alert("Add at least a name or company.")
    return
  }

  try{

    saveContactBtn.textContent =
    "Saving..."

    saveContactBtn.classList.add(
      "loading-state"
    )

    const { error } =
    await supabase
    .from("recruiter_contacts")
    .insert([{
      user_id:currentUser.id,
      name:nameInput.value,
      company:companyInput.value,
      role:roleInput.value,
      linkedin_url:linkedinInput.value,
      email:emailInput.value,
      status:statusInput.value,
      follow_up_date:followUpInput.value || null,
      notes:notesInput.value,
      outreach_message:latestMessage
    }])

    if(error){
      console.error(error)
      alert("Could not save contact.")
      return
    }

    clearForm()

    await loadContacts()

  }catch(error){

    console.error(error)

    alert("Contact save failed.")

  }finally{

    saveContactBtn.textContent =
    "Save Contact"

    saveContactBtn.classList.remove(
      "loading-state"
    )

  }

}

async function generateMessage(){

  currentUser =
  await protectPage()

  if(nameInput.value.trim().length < 2 && companyInput.value.trim().length < 2){
    alert("Add a recruiter name or company first.")
    return
  }

  try{

    generateMessageBtn.textContent =
    "Generating..."

    generateMessageTopBtn.textContent =
    "Generating..."

    generateMessageBtn.classList.add(
      "loading-state"
    )

    generateMessageTopBtn.classList.add(
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
Write a premium UK recruiter outreach pack.

Contact name:
${nameInput.value || "Not provided"}

Company:
${companyInput.value || "Not provided"}

Contact role / hiring focus:
${roleInput.value || "Not provided"}

Candidate notes:
${notesInput.value || "Not provided"}

Return markdown with this exact structure:

# LinkedIn Connection Message
Write under 300 characters.

# LinkedIn Follow-Up Message
Write a short follow-up after they accept.

# Email Subject Lines
Give 3 options.

# Email Version
Write a concise professional email.

# Follow-Up Email
Write a polite follow-up if no response after 5-7 days.

# Personalisation Tips
Tell the user how to customise the message.

Rules:
- UK English.
- Natural, confident and professional.
- Do not sound desperate.
- Do not overclaim experience.
- Suitable for students, graduates, apprenticeships and job seekers.
- Keep messages realistic and usable.
`
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    renderMessage(
      data.reply || ""
    )

  }catch(error){

    console.error(error)

    alert("Message generation failed. Make sure backend is running.")

  }finally{

    generateMessageBtn.textContent =
    "Generate Outreach Message"

    generateMessageTopBtn.textContent =
    "Generate Outreach"

    generateMessageBtn.classList.remove(
      "loading-state"
    )

    generateMessageTopBtn.classList.remove(
      "loading-state"
    )

  }

}

copyMessageBtn.addEventListener("click", async ()=>{

  await navigator.clipboard.writeText(
    latestMessage || messageOutput.innerText
  )

  copyMessageBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyMessageBtn.textContent =
    "Copy Message"
  }, 1500)

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

saveContactBtn.addEventListener(
  "click",
  saveContact
)

generateMessageBtn.addEventListener(
  "click",
  generateMessage
)

generateMessageTopBtn.addEventListener(
  "click",
  generateMessage
)

;[
  nameInput,
  companyInput,
  roleInput,
  linkedinInput,
  emailInput,
  statusInput,
  followUpInput,
  notesInput
].forEach((input)=>{

  input.addEventListener(
    "input",
    updateMeta
  )

  input.addEventListener(
    "change",
    updateMeta
  )

})

currentUser =
await protectPage()

updateMeta()

await loadContacts()