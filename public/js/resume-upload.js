import {
  apiFetch,
  supabase,
  protectPage
}
from "/js/premium.js"

const logoutBtn =
document.getElementById("logoutBtn")

const uploadTopBtn =
document.getElementById("uploadTopBtn")

const dropZone =
document.getElementById("dropZone")

const cvFileInput =
document.getElementById("cvFileInput")

const fileNameDisplay =
document.getElementById("fileNameDisplay")

const analyseCvBtn =
document.getElementById("analyseCvBtn")

const sendToBuilderBtn =
document.getElementById("sendToBuilderBtn")

const copyImportBtn =
document.getElementById("copyImportBtn")

const importScore =
document.getElementById("importScore")

const importScoreBar =
document.getElementById("importScoreBar")

const importScoreLabel =
document.getElementById("importScoreLabel")

const importScoreAdvice =
document.getElementById("importScoreAdvice")

const structureScore =
document.getElementById("structureScore")

const atsReadinessScore =
document.getElementById("atsReadinessScore")

const proofStrengthScore =
document.getElementById("proofStrengthScore")

const builderReadyScore =
document.getElementById("builderReadyScore")

const structureBar =
document.getElementById("structureBar")

const atsReadinessBar =
document.getElementById("atsReadinessBar")

const proofStrengthBar =
document.getElementById("proofStrengthBar")

const builderReadyBar =
document.getElementById("builderReadyBar")

const detectedName =
document.getElementById("detectedName")

const detectedRole =
document.getElementById("detectedRole")

const importStatus =
document.getElementById("importStatus")

const importDiagnostics =
document.getElementById("importDiagnostics")

const importOutput =
document.getElementById("importOutput")

const uploadHistoryList =
document.getElementById("uploadHistoryList")

let currentUser = null
let selectedFile = null
let importedCv = null

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function clamp(value){
  return Math.min(
    Math.max(Math.round(value || 0), 0),
    100
  )
}

function setBar(element, value){
  if(element){
    element.style.width =
    `${clamp(value)}%`
  }
}

function cleanFileSize(bytes){
  if(!bytes){
    return "0 KB"
  }

  if(bytes < 1024 * 1024){
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getImportLabel(score){
  if(score >= 85) return "Excellent import"
  if(score >= 70) return "Strong import"
  if(score >= 50) return "Usable import"
  if(score >= 30) return "Needs review"
  return "Weak import"
}

function getImportAdvice(score){
  if(score >= 85){
    return "This CV has enough structure to import into Builder confidently."
  }

  if(score >= 70){
    return "Good import. Review details before sending it into Builder."
  }

  if(score >= 50){
    return "Usable import. You should strengthen missing sections in Builder."
  }

  if(score >= 30){
    return "Some important sections are missing. Review carefully before importing."
  }

  return "This CV needs more structure. Add clear sections before applying."
}

function calculateBreakdown(data){
  const combined =
  `
    ${data.summary || ""}
    ${data.skills || ""}
    ${data.experience || ""}
    ${data.education || ""}
    ${data.projects || ""}
    ${data.certifications || ""}
  `.toLowerCase()

  const structure =
  clamp(
    (data.fullName ? 20 : 0) +
    (data.jobTitle ? 20 : 0) +
    (data.summary ? 20 : 0) +
    (data.skills ? 20 : 0) +
    (data.experience ? 20 : 0)
  )

  const ats =
  clamp(
    (data.jobTitle ? 20 : 0) +
    (data.summary && data.summary.length > 60 ? 20 : 0) +
    (data.skills && data.skills.length > 25 ? 30 : 0) +
    (data.experience && data.experience.length > 80 ? 20 : 0) +
    (data.education ? 10 : 0)
  )

  const proof =
  clamp(
    (/\d/.test(combined) ? 30 : 0) +
    (data.projects ? 25 : 0) +
    (data.certifications ? 20 : 0) +
    (["achieved","improved","created","delivered","managed","supported","analysed"].some(word => combined.includes(word)) ? 25 : 0)
  )

  const ready =
  clamp(
    structure * 0.45 +
    ats * 0.35 +
    proof * 0.20
  )

  const overall =
  clamp(
    structure * 0.35 +
    ats * 0.35 +
    proof * 0.30
  )

  return {
    structure,
    ats,
    proof,
    ready,
    overall
  }
}

function calculateScore(data){
  return calculateBreakdown(data).overall
}

function createDiagnostics(data){
  const issues = []
  const wins = []

  if(data.fullName){
    wins.push("Name detected.")
  }else{
    issues.push("Name was not detected clearly.")
  }

  if(data.jobTitle){
    wins.push("Target role or job title detected.")
  }else{
    issues.push("Target role was not detected.")
  }

  if(data.summary){
    wins.push("Professional summary found.")
  }else{
    issues.push("Professional summary is missing.")
  }

  if(data.skills){
    wins.push("Skills section extracted.")
  }else{
    issues.push("Skills section is missing or unclear.")
  }

  if(data.experience){
    wins.push("Experience section extracted.")
  }else{
    issues.push("Experience section is missing or weak.")
  }

  if(data.education){
    wins.push("Education section detected.")
  }else{
    issues.push("Education section was not detected.")
  }

  const combined =
  `${data.summary || ""} ${data.experience || ""} ${data.projects || ""}`

  if(/\d/.test(combined)){
    wins.push("Measurable evidence detected.")
  }else{
    issues.push("No numbers or measurable achievements detected.")
  }

  if(data.projects || data.certifications){
    wins.push("Extra proof detected through projects or certifications.")
  }else{
    issues.push("Projects or certifications could strengthen this CV.")
  }

  return {
    wins,
    issues
  }
}

function importedCvAsText(data){
  return `
Full Name:
${data.fullName || ""}

Target Role:
${data.jobTitle || ""}

Professional Summary:
${data.summary || ""}

Skills:
${data.skills || ""}

Experience:
${data.experience || ""}

Education:
${data.education || ""}

Projects:
${data.projects || ""}

Certifications:
${data.certifications || ""}
`.trim()
}

function renderImportedCv(data){
  importedCv = data

  const breakdown =
  calculateBreakdown(data)

  importScore.textContent =
  `${breakdown.overall}%`

  importScoreBar.style.width =
  `${breakdown.overall}%`

  importScoreLabel.textContent =
  getImportLabel(breakdown.overall)

  importScoreAdvice.textContent =
  getImportAdvice(breakdown.overall)

  structureScore.textContent =
  `${breakdown.structure}%`

  atsReadinessScore.textContent =
  `${breakdown.ats}%`

  proofStrengthScore.textContent =
  `${breakdown.proof}%`

  builderReadyScore.textContent =
  `${breakdown.ready}%`

  setBar(structureBar, breakdown.structure)
  setBar(atsReadinessBar, breakdown.ats)
  setBar(proofStrengthBar, breakdown.proof)
  setBar(builderReadyBar, breakdown.ready)

  detectedName.textContent =
  data.fullName || "-"

  detectedRole.textContent =
  data.jobTitle || "-"

  importStatus.textContent =
  "CV imported successfully. Review it, then send it to the builder."

  const diagnostics =
  createDiagnostics(data)

  importDiagnostics.innerHTML =
  `
    <div class="upload-diagnostic-grid">
      <div>
        <h4>What looks good</h4>
        <ul>
          ${diagnostics.wins.map(item => `<li>${safeText(item)}</li>`).join("")}
        </ul>
      </div>

      <div>
        <h4>What to improve</h4>
        <ul>
          ${diagnostics.issues.map(item => `<li>${safeText(item)}</li>`).join("")}
        </ul>
      </div>
    </div>
  `

  importOutput.innerHTML =
  `
    <div class="salary-block">
      <h4>Full Name</h4>
      <p>${safeText(data.fullName || "Not detected")}</p>

      <h4>Target Role</h4>
      <p>${safeText(data.jobTitle || "Not detected")}</p>

      <h4>Professional Summary</h4>
      <p>${safeText(data.summary || "Not detected")}</p>

      <h4>Skills</h4>
      <p>${safeText(data.skills || "Not detected")}</p>

      <h4>Experience</h4>
      <p>${safeText(data.experience || "Not detected").replace(/\n/g, "<br>")}</p>

      <h4>Education</h4>
      <p>${safeText(data.education || "Not detected").replace(/\n/g, "<br>")}</p>

      <h4>Projects</h4>
      <p>${safeText(data.projects || "Not detected").replace(/\n/g, "<br>")}</p>

      <h4>Certifications</h4>
      <p>${safeText(data.certifications || "Not detected").replace(/\n/g, "<br>")}</p>
    </div>
  `

  sendToBuilderBtn.disabled =
  false

  copyImportBtn.disabled =
  false
}

function handleFile(file){
  if(!file){
    return
  }

  const allowedTypes =
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
  ]

  const allowedExtensions =
  [".pdf", ".doc", ".docx", ".txt"]

  const lowerName =
  file.name.toLowerCase()

  const extensionAllowed =
  allowedExtensions.some(ext => lowerName.endsWith(ext))

  if(!allowedTypes.includes(file.type) && !extensionAllowed){
    alert("Please upload a PDF, DOC, DOCX or TXT file.")
    return
  }

  if(file.size > 8 * 1024 * 1024){
    alert("File is too large. Please upload a CV under 8MB.")
    return
  }

  selectedFile =
  file

  fileNameDisplay.textContent =
  `${file.name} · ${cleanFileSize(file.size)}`

  importStatus.textContent =
  "File selected. Click Analyse & Import CV."
}

dropZone.addEventListener("click", ()=>{
  cvFileInput.click()
})

uploadTopBtn.addEventListener("click", ()=>{
  cvFileInput.click()
})

cvFileInput.addEventListener("change", ()=>{
  handleFile(cvFileInput.files[0])
})

dropZone.addEventListener("dragover", (event)=>{
  event.preventDefault()
  dropZone.classList.add("active-upload-zone")
})

dropZone.addEventListener("dragleave", ()=>{
  dropZone.classList.remove("active-upload-zone")
})

dropZone.addEventListener("drop", (event)=>{
  event.preventDefault()
  dropZone.classList.remove("active-upload-zone")
  handleFile(event.dataTransfer.files[0])
})

async function saveUploadHistory(data){
  const { error } =
  await supabase
  .from("cv_uploads")
  .insert([{
    user_id:currentUser.id,
    file_name:selectedFile?.name || "",
    file_size:selectedFile?.size || 0,
    full_name:data.fullName || "",
    job_title:data.jobTitle || "",
    import_score:calculateScore(data),
    imported_data:data
  }])

  if(error){
    console.warn("Could not save upload history:", error)
  }
}

async function loadUploadHistory(){
  const { data, error } =
  await supabase
  .from("cv_uploads")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.warn("Could not load upload history:", error)

    uploadHistoryList.innerHTML =
    "<p>No upload history yet.</p>"

    return
  }

  const uploads =
  data || []

  if(uploads.length === 0){
    uploadHistoryList.innerHTML =
    "<p>No upload history yet.</p>"
    return
  }

  uploadHistoryList.innerHTML =
  ""

  uploads.slice(0, 6).forEach((upload)=>{
    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    card.innerHTML =
    `
      <h4>${safeText(upload.job_title || upload.file_name || "Uploaded CV")}</h4>

      <p><strong>Name:</strong> ${safeText(upload.full_name || "-")}</p>
      <p><strong>Import Score:</strong> ${upload.import_score || 0}%</p>
      <p><strong>File:</strong> ${safeText(upload.file_name || "-")}</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn load-upload-btn">Load</button>
        <button class="small-btn danger-btn delete-upload-btn">Delete</button>
      </div>
    `

    card.querySelector(".load-upload-btn").addEventListener("click", ()=>{
      renderImportedCv(upload.imported_data || {})
      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card.querySelector(".delete-upload-btn").addEventListener("click", async ()=>{
      const confirmDelete =
      confirm("Delete this uploaded CV history item?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("cv_uploads")
      .delete()
      .eq("id", upload.id)

      if(error){
        console.error(error)
        alert("Could not delete upload.")
        return
      }

      await loadUploadHistory()
    })

    uploadHistoryList.appendChild(card)
  })
}

async function analyseCv(){
  currentUser =
  await protectPage()

  if(!selectedFile){
    alert("Choose a CV file first.")
    return
  }

  try{
    analyseCvBtn.textContent =
    "Importing..."

    analyseCvBtn.classList.add(
      "loading-state"
    )

    analyseCvBtn.disabled =
    true

    importStatus.textContent =
    "Reading, analysing and structuring your CV..."

    const formData =
    new FormData()

    formData.append(
      "cv",
      selectedFile
    )

    formData.append(
      "userId",
      currentUser.id
    )

    const response =
    await apiFetch("/api/import-cv", {
      method:"POST",
      body:formData
    })

    const data =
    await response.json()

    if(!response.ok || data.error){
      alert(data.error || "Import failed.")
      importStatus.textContent =
      "Import failed."
      return
    }

    renderImportedCv(data)

    await saveUploadHistory(data)

    await loadUploadHistory()

  }catch(error){
    console.error(error)

    alert(
      "CV import failed. Make sure your backend is running."
    )

    importStatus.textContent =
    "Import failed."
  }finally{
    analyseCvBtn.textContent =
    "Analyse & Import CV"

    analyseCvBtn.classList.remove(
      "loading-state"
    )

    analyseCvBtn.disabled =
    false
  }
}

function sendToBuilder(){
  if(!importedCv){
    alert("Import a CV first.")
    return
  }

  localStorage.setItem(
    "jobready_imported_cv",
    JSON.stringify(importedCv)
  )

  window.location.href =
  "builder.html"
}

copyImportBtn.addEventListener("click", async ()=>{
  if(!importedCv){
    alert("Import a CV first.")
    return
  }

  await navigator.clipboard.writeText(
    importedCvAsText(importedCv)
  )

  copyImportBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyImportBtn.textContent =
    "Copy Imported CV"
  }, 1500)
})

analyseCvBtn.addEventListener(
  "click",
  analyseCv
)

sendToBuilderBtn.addEventListener(
  "click",
  sendToBuilder
)

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

currentUser =
await protectPage()

await loadUploadHistory()