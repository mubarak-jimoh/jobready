import { supabaseUrl, supabaseKey }
from "/js/config.js"

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase =
createClient(supabaseUrl, supabaseKey)

const cvList =
document.getElementById("cvList")

const logoutBtn =
document.getElementById("logoutBtn")

const cvSearchInput =
document.getElementById("cvSearchInput")

const totalCvStat =
document.getElementById("totalCvStat")

const bestCvStat =
document.getElementById("bestCvStat")

const avgCvStat =
document.getElementById("avgCvStat")

const latestCvStat =
document.getElementById("latestCvStat")

const portfolioHealth =
document.getElementById("portfolioHealth")

const portfolioAdvice =
document.getElementById("portfolioAdvice")

let allCvs = []

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function clamp(value){
  return Math.min(Math.max(Math.round(value || 0), 0), 100)
}

function formatDate(dateValue){
  if(!dateValue){
    return "—"
  }

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day:"2-digit",
    month:"short",
    year:"numeric"
  })
}

function getInitials(name){
  const parts =
  String(name || "CV")
  .trim()
  .split(/\s+/)
  .filter(Boolean)

  if(parts.length === 0){
    return "CV"
  }

  return parts
  .slice(0, 2)
  .map(part => part[0])
  .join("")
  .toUpperCase()
}

function getTemplateName(cv){
  const template =
  cv.template ||
  cv.cv_template ||
  cv.selected_template ||
  "modern"

  const names = {
    modern:"Modern Pro",
    graduate:"Graduate Plus",
    silicon:"Silicon Dark",
    developer:"Developer Grid",
    data:"Data Precision",
    cyber:"Cyber Sentinel",
    executive:"Executive Noir",
    boardroom:"Boardroom Elite",
    consultant:"Consultant Sharp",
    corporate:"Corporate Pro",
    finance:"Finance Elite",
    legal:"Legal Counsel",
    minimal:"Minimal Elite",
    pure:"Pure ATS",
    classic:"Classic",
    oxford:"Oxford Classic",
    creative:"Creative Edge",
    portfolio:"Portfolio Pro",
    marketing:"Marketing Impact",
    apprentice:"Apprentice Starter",
    student:"Student Plus",
    career_switch:"Career Switch",
    healthcare:"Healthcare Pro",
    nhs:"NHS Focus",
    retail:"Retail Ready",
    sales:"Sales Impact",
    hospitality:"Hospitality Pro",
    international:"International Pro",
    premium_pro:"Premium Pro"
  }

  return names[template] || "Modern Pro"
}

function getCvScore(cv){
  return clamp(
    cv.ats_score ||
    cv.score ||
    cv.cv_score ||
    0
  )
}

function getMatchScore(cv){
  return clamp(
    cv.match_score ||
    cv.job_match_score ||
    0
  )
}

function getSearchText(cv){
  return `
    ${cv.title || ""}
    ${cv.full_name || ""}
    ${cv.job_title || ""}
    ${cv.summary || ""}
    ${cv.skills || ""}
    ${cv.experience || ""}
    ${cv.education || ""}
  `.toLowerCase()
}

function updateStats(cvs){
  const total =
  cvs.length

  const scores =
  cvs.map(getCvScore)

  const best =
  scores.length
  ? Math.max(...scores)
  : 0

  const average =
  scores.length
  ? Math.round(scores.reduce((sum, score)=> sum + score, 0) / scores.length)
  : 0

  totalCvStat.textContent =
  total

  bestCvStat.textContent =
  `${best}%`

  avgCvStat.textContent =
  `${average}%`

  latestCvStat.textContent =
  total > 0
  ? formatDate(cvs[0].updated_at || cvs[0].created_at)
  : "—"

  const health =
  clamp(
    (total > 0 ? 25 : 0) +
    best * 0.45 +
    average * 0.30
  )

  portfolioHealth.textContent =
  `${health}%`

  if(total === 0){
    portfolioAdvice.textContent =
    "Create your first CV to start building your application portfolio."
  }else if(health >= 80){
    portfolioAdvice.textContent =
    "Strong portfolio. Keep tailoring each CV to specific roles."
  }else if(health >= 55){
    portfolioAdvice.textContent =
    "Good foundation. Improve weak CVs and add stronger role-specific keywords."
  }else{
    portfolioAdvice.textContent =
    "Your CV library is started. Build stronger summaries, skills and measurable achievements."
  }
}

function renderEmptyState(){
  cvList.innerHTML =
  `
    <div class="empty-state premium-empty-state">
      <span class="empty-icon">📄</span>
      <h2>No CVs saved yet</h2>
      <p>Create your first recruiter-ready CV or import an existing CV to start your JobReady portfolio.</p>

      <div class="hero-buttons">
        <a href="builder.html" class="primary-btn">Build CV</a>
        <a href="resume-upload.html" class="secondary-btn">Upload CV</a>
      </div>
    </div>
  `
}

function renderCVs(cvs){
  updateStats(allCvs)

  if(cvs.length === 0){
    renderEmptyState()
    return
  }

  cvList.innerHTML =
  cvs.map((cv)=>{
    const score =
    getCvScore(cv)

    const match =
    getMatchScore(cv)

    const title =
    cv.title ||
    `${cv.job_title || "Untitled"} CV`

    const summary =
    cv.summary ||
    "No summary added yet."

    const skills =
    String(cv.skills || "")
    .split(/,|\n/)
    .map(skill => skill.trim())
    .filter(Boolean)
    .slice(0, 6)

    const initials =
    getInitials(cv.full_name || title)

    const templateName =
    getTemplateName(cv)

    return `
      <article class="saved-cv-premium-card" data-id="${cv.id}">
        <div class="saved-cv-preview">
          <div class="saved-cv-preview-header">
            <div class="saved-cv-avatar">${safeText(initials)}</div>
            <div>
              <strong>${safeText(cv.full_name || "Unnamed Candidate")}</strong>
              <span>${safeText(cv.job_title || "No target role")}</span>
            </div>
          </div>

          <div class="saved-cv-preview-line wide"></div>
          <div class="saved-cv-preview-line"></div>
          <div class="saved-cv-preview-line short"></div>

          <div class="saved-cv-mini-section">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="saved-cv-content">
          <div class="saved-cv-topline">
            <div>
              <p class="insight-label">${safeText(templateName)}</p>
              <h2>${safeText(title)}</h2>
              <p>${safeText(cv.job_title || "No job title added")}</p>
            </div>

            <div class="saved-cv-score-stack">
              <span class="cv-score premium-score">${score}%</span>
              <small>ATS</small>
            </div>
          </div>

          <p class="saved-cv-summary">
            ${safeText(summary.slice(0, 190))}${summary.length > 190 ? "..." : ""}
          </p>

          <div class="saved-cv-meta-row">
            <span>Match ${match}%</span>
            <span>Saved ${safeText(formatDate(cv.created_at))}</span>
            <span>Updated ${safeText(formatDate(cv.updated_at || cv.created_at))}</span>
          </div>

          <div class="saved-cv-skill-row">
            ${
              skills.length
              ? skills.map(skill => `<span>${safeText(skill)}</span>`).join("")
              : "<span>No skills added</span>"
            }
          </div>

          <div class="saved-cv-actions">
            <button class="small-btn view-btn" data-id="${cv.id}">
              View
            </button>

            <button class="small-btn edit-btn" data-id="${cv.id}">
              Edit
            </button>

            <button class="small-btn download-btn" data-id="${cv.id}">
              Download
            </button>

            <button class="small-btn danger-btn delete-btn" data-id="${cv.id}">
              Delete
            </button>
          </div>
        </div>
      </article>
    `
  }).join("")

  bindCardButtons()
}

function openCvModal(cv){
  const existing =
  document.getElementById("cvViewModal")

  if(existing){
    existing.remove()
  }

  const modal =
  document.createElement("div")

  modal.id =
  "cvViewModal"

  modal.className =
  "cv-modal-overlay"

  modal.innerHTML =
  `
    <div class="cv-modal-card">
      <button class="cv-modal-close" id="closeCvModal">×</button>

      <p class="insight-label">Saved CV Preview</p>
      <h2>${safeText(cv.title || `${cv.job_title || "Untitled"} CV`)}</h2>
      <p>${safeText(cv.full_name || "Unnamed Candidate")} · ${safeText(cv.job_title || "No role")}</p>

      <div class="cv-modal-grid">
        <section>
          <h3>Professional Summary</h3>
          <p>${safeText(cv.summary || "No summary added.")}</p>
        </section>

        <section>
          <h3>Skills</h3>
          <p>${safeText(cv.skills || "No skills added.")}</p>
        </section>

        <section>
          <h3>Experience</h3>
          <p>${safeText(cv.experience || "No experience added.")}</p>
        </section>

        <section>
          <h3>Education</h3>
          <p>${safeText(cv.education || "No education added.")}</p>
        </section>
      </div>

      <div class="saved-cv-actions">
        <button class="small-btn edit-btn" data-id="${cv.id}">Edit in Builder</button>
        <button class="small-btn download-btn" data-id="${cv.id}">Download</button>
      </div>
    </div>
  `

  document.body.appendChild(modal)

  document
  .getElementById("closeCvModal")
  .addEventListener("click", ()=>{
    modal.remove()
  })

  modal.addEventListener("click", (event)=>{
    if(event.target === modal){
      modal.remove()
    }
  })

  bindCardButtons()
}

function sendCvToBuilder(cv){
  localStorage.setItem(
    "jobready_edit_cv",
    JSON.stringify(cv)
  )

  window.location.href =
  "builder.html"
}

function downloadCvAsText(cv){
  const content =
`
${cv.full_name || ""}
${cv.job_title || ""}

PROFESSIONAL SUMMARY
${cv.summary || ""}

SKILLS
${cv.skills || ""}

EXPERIENCE
${cv.experience || ""}

EDUCATION
${cv.education || ""}
`.trim()

  const blob =
  new Blob([content], {
    type:"text/plain"
  })

  const url =
  URL.createObjectURL(blob)

  const link =
  document.createElement("a")

  link.href =
  url

  link.download =
  `${(cv.title || cv.job_title || "jobready-cv").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`

  document.body.appendChild(link)

  link.click()

  link.remove()

  URL.revokeObjectURL(url)
}

async function deleteCv(cv){
  const confirmDelete =
  confirm(`Delete "${cv.title || cv.job_title || "this CV"}"?`)

  if(!confirmDelete){
    return
  }

  const { error } =
  await supabase
  .from("cvs")
  .delete()
  .eq("id", cv.id)

  if(error){
    alert("Error deleting CV.")
    console.error(error)
    return
  }

  allCvs =
  allCvs.filter(item => item.id !== cv.id)

  renderCVs(allCvs)

  alert("CV deleted.")
}

function bindCardButtons(){
  document
  .querySelectorAll(".view-btn")
  .forEach((button)=>{
    button.onclick = ()=>{
      const cv =
      allCvs.find(item => item.id === button.dataset.id)

      if(cv){
        openCvModal(cv)
      }
    }
  })

  document
  .querySelectorAll(".edit-btn")
  .forEach((button)=>{
    button.onclick = ()=>{
      const cv =
      allCvs.find(item => item.id === button.dataset.id)

      if(cv){
        sendCvToBuilder(cv)
      }
    }
  })

  document
  .querySelectorAll(".download-btn")
  .forEach((button)=>{
    button.onclick = ()=>{
      const cv =
      allCvs.find(item => item.id === button.dataset.id)

      if(cv){
        downloadCvAsText(cv)
      }
    }
  })

  document
  .querySelectorAll(".delete-btn")
  .forEach((button)=>{
    button.onclick = async ()=>{
      const cv =
      allCvs.find(item => item.id === button.dataset.id)

      if(cv){
        await deleteCv(cv)
      }
    }
  })
}

async function loadCVs(){
  const {
    data:{ user }
  } =
  await supabase.auth.getUser()

  if(!user){
    window.location.href =
    "login.html"

    return
  }

  const { data, error } =
  await supabase
  .from("cvs")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    cvList.innerHTML =
    `<p class="loading-text">Error loading CVs.</p>`

    return
  }

  allCvs =
  data || []

  renderCVs(allCvs)
}

if(cvSearchInput){
  cvSearchInput.addEventListener("input", ()=>{
    const query =
    cvSearchInput.value.toLowerCase().trim()

    if(!query){
      renderCVs(allCvs)
      return
    }

    const filtered =
    allCvs.filter(cv =>
      getSearchText(cv).includes(query)
    )

    renderCVs(filtered)
  })
}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()

  window.location.href =
  "login.html"
})

loadCVs()