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

const analyseLinkedinTopBtn =
document.getElementById("analyseLinkedinTopBtn")

const analyseLinkedinBtn =
document.getElementById("analyseLinkedinBtn")

const fullNameInput =
document.getElementById("fullNameInput")

const targetRoleInput =
document.getElementById("targetRoleInput")

const industryInput =
document.getElementById("industryInput")

const headlineInput =
document.getElementById("headlineInput")

const aboutInput =
document.getElementById("aboutInput")

const experienceInput =
document.getElementById("experienceInput")

const skillsInput =
document.getElementById("skillsInput")

const projectsInput =
document.getElementById("projectsInput")

const profileScore =
document.getElementById("profileScore")

const recruiterScore =
document.getElementById("recruiterScore")

const keywordStrength =
document.getElementById("keywordStrength")

const heroProfileScore =
document.getElementById("heroProfileScore")

const heroProfileLabel =
document.getElementById("heroProfileLabel")

const heroProfileAdvice =
document.getElementById("heroProfileAdvice")

const linkedinScoreBar =
document.getElementById("linkedinScoreBar")

const keywordCount =
document.getElementById("keywordCount")

const priorityStatus =
document.getElementById("priorityStatus")

const headlineClarityScore =
document.getElementById("headlineClarityScore")

const aboutStrengthScore =
document.getElementById("aboutStrengthScore")

const proofScore =
document.getElementById("proofScore")

const networkingScore =
document.getElementById("networkingScore")

const feedbackOutput =
document.getElementById("feedbackOutput")

const headlineOutput =
document.getElementById("headlineOutput")

const aboutOutput =
document.getElementById("aboutOutput")

const keywordsOutput =
document.getElementById("keywordsOutput")

const networkingOutput =
document.getElementById("networkingOutput")

const copyHeadlineBtn =
document.getElementById("copyHeadlineBtn")

const copyAboutBtn =
document.getElementById("copyAboutBtn")

const copyNetworkingBtn =
document.getElementById("copyNetworkingBtn")

const savedReviewsList =
document.getElementById("savedReviewsList")

let currentUser = null
let latestHeadline = ""
let latestAbout = ""
let latestNetworking = ""

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function splitKeywords(text){
  return String(text || "")
  .split(/,|\n/)
  .map(item => item.trim())
  .filter(Boolean)
}

function extractSection(text, heading){
  const source =
  String(text || "")

  const escaped =
  heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  const regex =
  new RegExp(`#\\s*${escaped}\\s*([\\s\\S]*?)(?=\\n#\\s|$)`, "i")

  const match =
  source.match(regex)

  return match
  ? match[1].trim()
  : ""
}

function localRoleKeywords(){
  const role =
  `${targetRoleInput.value} ${industryInput?.value || ""}`.toLowerCase()

  if(role.includes("data") || role.includes("analyst")){
    return ["SQL", "Excel", "Power BI", "Data Analysis", "Dashboard Reporting", "Data Cleaning", "Stakeholder Communication"]
  }

  if(role.includes("software") || role.includes("developer")){
    return ["JavaScript", "React", "HTML", "CSS", "Git", "APIs", "Problem Solving", "Testing"]
  }

  if(role.includes("cyber")){
    return ["Cybersecurity", "Networking", "Linux", "Risk", "Monitoring", "Incident Response", "Security Awareness"]
  }

  if(role.includes("marketing")){
    return ["Content Marketing", "SEO", "Social Media", "Analytics", "Campaigns", "Branding", "Copywriting"]
  }

  if(role.includes("finance")){
    return ["Excel", "Financial Analysis", "Reporting", "Budgeting", "Forecasting", "Attention to Detail", "Compliance"]
  }

  return ["Communication", "Teamwork", "Problem Solving", "Organisation", "Microsoft Office", "Attention to Detail"]
}

function calculateLocalBreakdown(){
  const headline =
  headlineInput.value.toLowerCase()

  const about =
  aboutInput.value.toLowerCase()

  const experience =
  experienceInput.value.toLowerCase()

  const skills =
  skillsInput.value.toLowerCase()

  const projects =
  projectsInput?.value.toLowerCase() || ""

  const role =
  targetRoleInput.value.toLowerCase()

  const allText =
  `${headline} ${about} ${experience} ${skills} ${projects}`

  const keywords =
  localRoleKeywords()

  const matchedKeywords =
  keywords.filter(keyword =>
    allText.includes(keyword.toLowerCase())
  )

  const headlineScore =
  Math.min(
    100,
    (headline.length > 15 ? 35 : 0) +
    (role && headline.includes(role) ? 35 : 0) +
    (matchedKeywords.length >= 2 ? 20 : 0) +
    (headline.length < 160 ? 10 : 0)
  )

  const aboutScore =
  Math.min(
    100,
    (about.length > 120 ? 35 : 0) +
    (about.length > 300 ? 20 : 0) +
    (matchedKeywords.length >= 3 ? 25 : 0) +
    (/\d/.test(about) ? 10 : 0) +
    (about.includes("project") || about.includes("experience") ? 10 : 0)
  )

  const proof =
  Math.min(
    100,
    (experience.length > 100 ? 30 : 0) +
    (projects.length > 30 ? 30 : 0) +
    (/\d/.test(`${experience} ${projects}`) ? 20 : 0) +
    (skills.length > 30 ? 20 : 0)
  )

  const networking =
  Math.min(
    100,
    (headlineScore * 0.35) +
    (aboutScore * 0.35) +
    (proof * 0.30)
  )

  return {
    headlineScore:Math.round(headlineScore),
    aboutScore:Math.round(aboutScore),
    proof:Math.round(proof),
    networking:Math.round(networking),
    matchedKeywords,
    keywords
  }
}

function updatePriority(score){
  if(score >= 85){
    priorityStatus.textContent =
    "Strong profile"

    heroProfileLabel.textContent =
    "Recruiter-ready"

    heroProfileAdvice.textContent =
    "Your profile is strong. Keep updating it with projects, metrics and role-specific keywords."
  }else if(score >= 65){
    priorityStatus.textContent =
    "Improve keywords"

    heroProfileLabel.textContent =
    "Good foundation"

    heroProfileAdvice.textContent =
    "Your profile is decent. Improve keyword targeting and make your proof more specific."
  }else if(score >= 45){
    priorityStatus.textContent =
    "Rewrite headline"

    heroProfileLabel.textContent =
    "Needs positioning"

    heroProfileAdvice.textContent =
    "Make your target role clearer and strengthen your About section."
  }else{
    priorityStatus.textContent =
    "High risk"

    heroProfileLabel.textContent =
    "Low visibility"

    heroProfileAdvice.textContent =
    "Recruiters may not understand your value quickly. Start with headline and keywords."
  }
}

function renderKeywords(text){
  const keywords =
  splitKeywords(text)

  keywordCount.textContent =
  keywords.length

  if(keywords.length === 0){
    keywordsOutput.innerHTML =
    "<p>No keywords yet.</p>"
    return
  }

  keywordsOutput.innerHTML =
  ""

  keywords.forEach((keyword)=>{
    const span =
    document.createElement("span")

    span.className =
    "keyword-chip"

    span.textContent =
    keyword

    keywordsOutput.appendChild(span)
  })
}

function renderLocalBreakdown(){
  const breakdown =
  calculateLocalBreakdown()

  headlineClarityScore.textContent =
  `${breakdown.headlineScore}%`

  aboutStrengthScore.textContent =
  `${breakdown.aboutScore}%`

  proofScore.textContent =
  `${breakdown.proof}%`

  networkingScore.textContent =
  `${breakdown.networking}%`
}

function renderReview(data){
  const profile =
  data.profileScore || 0

  const recruiter =
  data.recruiterScore || 0

  const keywords =
  data.keywordStrength || 0

  profileScore.textContent =
  `${profile}%`

  recruiterScore.textContent =
  `${recruiter}%`

  keywordStrength.textContent =
  `${keywords}%`

  heroProfileScore.textContent =
  `${profile}%`

  linkedinScoreBar.style.width =
  `${profile}%`

  updatePriority(
    profile
  )

  renderLocalBreakdown()

  feedbackOutput.innerHTML =
  marked.parse(data.aiFeedback || "")

  latestHeadline =
  data.improvedHeadline || ""

  latestAbout =
  data.improvedAbout || ""

  latestNetworking =
  data.networkingMessages ||
  extractSection(data.aiFeedback || "", "Networking Messages") ||
  `
# LinkedIn Connection Message
Hi, I’m interested in ${targetRoleInput.value || "this field"} and would love to connect.

# Follow-Up Message
Hi, thanks for connecting. I’m currently building experience towards ${targetRoleInput.value || "my target role"} and would appreciate any advice or opportunities you think may be relevant.
`

  headlineOutput.innerHTML =
  `<p>${safeText(latestHeadline)}</p>`

  aboutOutput.innerHTML =
  marked.parse(latestAbout || "")

  networkingOutput.innerHTML =
  marked.parse(latestNetworking || "")

  renderKeywords(
    data.recruiterKeywords || localRoleKeywords().join(", ")
  )
}

async function loadSavedReviews(){
  const { data, error } =
  await supabase
  .from("linkedin_reviews")
  .select("*")
  .eq("user_id", currentUser.id)
  .order("created_at", {
    ascending:false
  })

  if(error){
    console.error(error)

    savedReviewsList.innerHTML =
    "<p>Could not load saved reviews.</p>"

    return
  }

  const reviews =
  data || []

  if(reviews.length === 0){
    savedReviewsList.innerHTML =
    "<p>No saved LinkedIn reviews yet.</p>"

    return
  }

  savedReviewsList.innerHTML =
  ""

  reviews.slice(0, 8).forEach((review)=>{
    const card =
    document.createElement("div")

    card.className =
    "question-card dashboard-recent-card"

    card.innerHTML =
    `
      <h4>${safeText(review.target_role || "LinkedIn Review")}</h4>

      <p><strong>Profile Score:</strong> ${review.profile_score || 0}%</p>
      <p><strong>Recruiter Score:</strong> ${review.recruiter_score || 0}%</p>
      <p><strong>Keyword Strength:</strong> ${review.keyword_strength || 0}%</p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-review-btn">View</button>
        <button class="small-btn danger-btn delete-review-btn">Delete</button>
      </div>
    `

    card
    .querySelector(".view-review-btn")
    .addEventListener("click", ()=>{
      renderReview({
        profileScore:review.profile_score,
        recruiterScore:review.recruiter_score,
        keywordStrength:review.keyword_strength,
        aiFeedback:review.ai_feedback,
        improvedHeadline:review.improved_headline,
        improvedAbout:review.improved_about,
        recruiterKeywords:review.recruiter_keywords,
        networkingMessages:review.networking_messages
      })

      window.scrollTo({
        top:0,
        behavior:"smooth"
      })
    })

    card
    .querySelector(".delete-review-btn")
    .addEventListener("click", async ()=>{
      const confirmDelete =
      confirm("Delete this LinkedIn review?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("linkedin_reviews")
      .delete()
      .eq("id", review.id)

      if(error){
        console.error(error)
        alert("Could not delete review.")
        return
      }

      await loadSavedReviews()
    })

    savedReviewsList.appendChild(card)
  })
}

function setAnalyseState(active){
  if(active){
    analyseLinkedinBtn.textContent =
    "Analysing..."

    analyseLinkedinTopBtn.textContent =
    "Analysing..."

    analyseLinkedinBtn.classList.add(
      "loading-state"
    )

    analyseLinkedinTopBtn.classList.add(
      "loading-state"
    )
  }else{
    analyseLinkedinBtn.textContent =
    "Analyse LinkedIn Profile"

    analyseLinkedinTopBtn.textContent =
    "Analyse Profile"

    analyseLinkedinBtn.classList.remove(
      "loading-state"
    )

    analyseLinkedinTopBtn.classList.remove(
      "loading-state"
    )
  }
}

async function analyseLinkedin(){
  currentUser =
  await protectPage()

  if(targetRoleInput.value.trim().length < 2){
    alert("Enter a target role first.")
    return
  }

  if(
    headlineInput.value.trim().length < 3 &&
    aboutInput.value.trim().length < 10 &&
    experienceInput.value.trim().length < 10
  ){
    alert("Paste your headline, About section or experience before analysing.")
    return
  }

  try{
    setAnalyseState(
      true
    )

    const response =
    await apiFetch("/api/linkedin-optimiser", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id,
        fullName:fullNameInput.value,
        targetRole:targetRoleInput.value,
        industry:industryInput?.value || "",
        headline:headlineInput.value,
        aboutSection:aboutInput.value,
        experience:experienceInput.value,
        skills:skillsInput.value,
        projects:projectsInput?.value || ""
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    if(!data.networkingMessages){
      data.networkingMessages =
      extractSection(data.aiFeedback || "", "Networking Messages")
    }

    renderReview(
      data
    )

    const insertData = {
      user_id:currentUser.id,
      full_name:fullNameInput.value,
      target_role:targetRoleInput.value,
      headline:headlineInput.value,
      about_section:aboutInput.value,
      experience:experienceInput.value,
      skills:skillsInput.value,
      profile_score:data.profileScore || 0,
      recruiter_score:data.recruiterScore || 0,
      keyword_strength:data.keywordStrength || 0,
      ai_feedback:data.aiFeedback || "",
      improved_headline:data.improvedHeadline || "",
      improved_about:data.improvedAbout || "",
      recruiter_keywords:data.recruiterKeywords || "",
      networking_messages:data.networkingMessages || ""
    }

    const { error } =
    await supabase
    .from("linkedin_reviews")
    .insert([insertData])

    if(error){
      console.error(error)
      alert("Review generated, but could not save. You may need to add the networking_messages column.")
      return
    }

    await loadSavedReviews()
  }catch(error){
    console.error(error)

    alert(
      "LinkedIn analysis failed. Make sure backend is running."
    )
  }finally{
    setAnalyseState(
      false
    )
  }
}

copyHeadlineBtn.addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(
    latestHeadline || headlineOutput.innerText
  )

  copyHeadlineBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyHeadlineBtn.textContent =
    "Copy Headline"
  }, 1500)
})

copyAboutBtn.addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(
    latestAbout || aboutOutput.innerText
  )

  copyAboutBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyAboutBtn.textContent =
    "Copy About Section"
  }, 1500)
})

copyNetworkingBtn.addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(
    latestNetworking || networkingOutput.innerText
  )

  copyNetworkingBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyNetworkingBtn.textContent =
    "Copy Messages"
  }, 1500)
})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href =
  "login.html"
})

analyseLinkedinBtn.addEventListener(
  "click",
  analyseLinkedin
)

analyseLinkedinTopBtn.addEventListener(
  "click",
  analyseLinkedin
)

;[
  headlineInput,
  aboutInput,
  experienceInput,
  skillsInput,
  projectsInput,
  targetRoleInput,
  industryInput
].forEach((input)=>{
  if(input){
    input.addEventListener("input", renderLocalBreakdown)
  }
})

currentUser =
await protectPage()

renderLocalBreakdown()

await loadSavedReviews()