import {
  supabase,
  protectPage
}
from "/js/premium.js"

const isProfileView =
window.location.pathname.includes("profile-view.html")

const publicProfileContainer =
document.getElementById("publicProfileContainer")

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function formatText(text){
  return safeText(text).replace(/\n/g, "<br>")
}

function normaliseSlug(text){
  return String(text || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
}

function splitItems(text){
  return String(text || "")
  .split(/,|\n/)
  .map(item => item.trim())
  .filter(Boolean)
}

function renderChipList(items, fallback = "Not added yet"){
  if(!items || items.length === 0){
    return `<span class="keyword-chip">${safeText(fallback)}</span>`
  }

  return items
  .map(item => `<span class="keyword-chip">${safeText(item)}</span>`)
  .join("")
}

function renderParagraphList(text, fallback){
  const items =
  splitItems(text)

  if(items.length === 0){
    return `<p>${safeText(fallback)}</p>`
  }

  return `
    <ul>
      ${items.map(item => `<li>${safeText(item)}</li>`).join("")}
    </ul>
  `
}

async function loadPublicView(){
  if(!publicProfileContainer){
    return
  }

  const params =
  new URLSearchParams(window.location.search)

  const slug =
  params.get("slug")

  if(!slug){
    publicProfileContainer.innerHTML =
    "<h1>Profile not found.</h1>"
    return
  }

  const { data, error } =
  await supabase
  .from("public_profiles")
  .select("*")
  .eq("slug", slug)
  .eq("public_enabled", true)
  .maybeSingle()

  if(error || !data){
    publicProfileContainer.innerHTML =
    "<h1>This profile is private or does not exist.</h1>"
    return
  }

  const skills =
  splitItems(data.skills)

  const links =
  splitItems(data.links)

  publicProfileContainer.innerHTML =
  `
    <section class="dashboard-section public-profile-view-section">
      <div class="premium-dashboard-hero">
        <div>
          <p class="insight-label">JobReady Public Profile</p>
          <h1>${safeText(data.full_name || "JobReady Candidate")}</h1>
          <p>${safeText(data.headline || data.target_role || "Career profile")}</p>

          <div class="builder-mini-trust-row">
            <span>${safeText(data.target_role || "Open to opportunities")}</span>
            <span>${safeText(data.location || "United Kingdom")}</span>
            <span>Recruiter-ready profile</span>
          </div>
        </div>

        <div class="dashboard-career-score-card">
          <p class="insight-label">Profile</p>
          <h2>${safeText((data.full_name || "J").slice(0,1).toUpperCase())}</h2>
          <span>${safeText(data.target_role || "Candidate")}</span>
          <p>Created with JobReady.</p>
        </div>
      </div>

      <div class="panel-card">
        <p class="insight-label">Profile Summary</p>
        <h3>About</h3>
        <p>${formatText(data.summary || data.bio || "No summary added yet.")}</p>
      </div>

      <div class="panel-card" style="margin-top:25px;">
        <p class="insight-label">Core Skills</p>
        <h3>Skills</h3>
        <div class="keyword-chip-row">
          ${renderChipList(skills, "No skills added")}
        </div>
      </div>

      <div class="panel-card" style="margin-top:25px;">
        <p class="insight-label">Projects & Evidence</p>
        <h3>Projects</h3>
        ${renderParagraphList(data.projects, "No projects added yet.")}
      </div>

      <div class="panel-card" style="margin-top:25px;">
        <p class="insight-label">Experience</p>
        <h3>Experience Highlights</h3>
        ${renderParagraphList(data.experience, "No experience highlights added yet.")}
      </div>

      <div class="panel-card" style="margin-top:25px;">
        <p class="insight-label">Education</p>
        <h3>Education & Certifications</h3>
        ${renderParagraphList(data.education, "No education added yet.")}
      </div>

      <div class="panel-card" style="margin-top:25px;">
        <p class="insight-label">Links</p>
        <h3>Career Links</h3>
        <div class="keyword-chip-row">
          ${renderChipList(links, "No links added")}
        </div>
      </div>
    </section>
  `
}

if(isProfileView){
  loadPublicView()
}else{

  const logoutBtn =
  document.getElementById("logoutBtn")

  const saveProfileBtn =
  document.getElementById("saveProfileBtn")

  const saveProfileBtnSide =
  document.getElementById("saveProfileBtnSide")

  const previewProfileBtn =
  document.getElementById("previewProfileBtn")

  const fullNameInput =
  document.getElementById("fullNameInput")

  const targetRoleInput =
  document.getElementById("targetRoleInput")

  const locationInput =
  document.getElementById("locationInput")

  const headlineInput =
  document.getElementById("headlineInput")

  const summaryInput =
  document.getElementById("summaryInput")

  const skillsInput =
  document.getElementById("skillsInput")

  const projectsInput =
  document.getElementById("projectsInput")

  const experienceInput =
  document.getElementById("experienceInput")

  const educationInput =
  document.getElementById("educationInput")

  const linksInput =
  document.getElementById("linksInput")

  const visibilityInput =
  document.getElementById("visibilityInput")

  const profileStrengthScore =
  document.getElementById("profileStrengthScore")

  const profileStrengthLabel =
  document.getElementById("profileStrengthLabel")

  const profileStrengthBar =
  document.getElementById("profileStrengthBar")

  const profileStrengthAdvice =
  document.getElementById("profileStrengthAdvice")

  const visibilityStatus =
  document.getElementById("visibilityStatus")

  const profileLinkStatus =
  document.getElementById("profileLinkStatus")

  const recruiterSignalScore =
  document.getElementById("recruiterSignalScore")

  const previewStatus =
  document.getElementById("previewStatus")

  const profileAvatar =
  document.getElementById("profileAvatar")

  const previewName =
  document.getElementById("previewName")

  const previewHeadline =
  document.getElementById("previewHeadline")

  const previewLocation =
  document.getElementById("previewLocation")

  const previewRole =
  document.getElementById("previewRole")

  const previewSummary =
  document.getElementById("previewSummary")

  const previewSkills =
  document.getElementById("previewSkills")

  const previewProjects =
  document.getElementById("previewProjects")

  const previewExperience =
  document.getElementById("previewExperience")

  const previewEducation =
  document.getElementById("previewEducation")

  const previewLinks =
  document.getElementById("previewLinks")

  const checkNameRole =
  document.getElementById("checkNameRole")

  const checkSummary =
  document.getElementById("checkSummary")

  const checkSkills =
  document.getElementById("checkSkills")

  const checkProjects =
  document.getElementById("checkProjects")

  const profileLinkBox =
  document.getElementById("profileLinkBox")

  const copyProfileLinkBtn =
  document.getElementById("copyProfileLinkBtn")

  let currentUser = null
  let currentProfile = null
  let currentSlug = ""

  function getSlug(){
    const base =
    fullNameInput.value || currentUser?.email || "jobready-profile"

    return normaliseSlug(base)
  }

  function getPublicUrl(){
    const slug =
    currentSlug || getSlug()

    return `${window.location.origin}/pages/profile-view.html?slug=${encodeURIComponent(slug)}`
  }

  function calculateStrength(){
    const checks = [
      fullNameInput.value.trim().length > 1,
      targetRoleInput.value.trim().length > 2,
      headlineInput.value.trim().length > 8,
      summaryInput.value.trim().length > 60,
      splitItems(skillsInput.value).length >= 5,
      projectsInput.value.trim().length > 25,
      experienceInput.value.trim().length > 25,
      educationInput.value.trim().length > 10,
      splitItems(linksInput.value).length >= 1
    ]

    const passed =
    checks.filter(Boolean).length

    return Math.round((passed / checks.length) * 100)
  }

  function updateStrength(){
    const score =
    calculateStrength()

    if(profileStrengthScore){
      profileStrengthScore.textContent =
      `${score}%`
    }

    if(recruiterSignalScore){
      recruiterSignalScore.textContent =
      `${score}%`
    }

    if(profileStrengthBar){
      profileStrengthBar.style.width =
      `${score}%`
    }

    if(score >= 85){
      profileStrengthLabel.textContent =
      "Recruiter-ready"

      profileStrengthAdvice.textContent =
      "Strong profile. Keep it truthful and update it as you gain more experience."
    }else if(score >= 60){
      profileStrengthLabel.textContent =
      "Almost ready"

      profileStrengthAdvice.textContent =
      "Add stronger project proof, links or experience highlights to improve trust."
    }else{
      profileStrengthLabel.textContent =
      "Needs work"

      profileStrengthAdvice.textContent =
      "Add your role, summary, skills, projects and links to improve your profile."
    }
  }

  function updateChecklist(){
    checkNameRole.textContent =
    fullNameInput.value.trim() && targetRoleInput.value.trim()
    ? "Yes"
    : "No"

    checkSummary.textContent =
    summaryInput.value.trim().length > 60
    ? "Yes"
    : "No"

    checkSkills.textContent =
    splitItems(skillsInput.value).length >= 5
    ? "Yes"
    : "No"

    checkProjects.textContent =
    projectsInput.value.trim().length > 25
    ? "Yes"
    : "No"
  }

  function updateLinkBox(){
    const publicEnabled =
    visibilityInput.value === "public"

    visibilityStatus.textContent =
    publicEnabled
    ? "Public"
    : "Private"

    previewStatus.textContent =
    publicEnabled
    ? "Public"
    : "Draft"

    profileLinkStatus.textContent =
    currentProfile
    ? "Ready"
    : "Not ready"

    if(!currentProfile){
      profileLinkBox.innerHTML =
      "<p>Save your profile to generate your link.</p>"
      return
    }

    profileLinkBox.innerHTML =
    `
      <p><strong>${publicEnabled ? "Public link ready:" : "Profile saved but private:"}</strong></p>
      <p>${safeText(getPublicUrl())}</p>
    `
  }

  function updatePreview(){
    const fullName =
    fullNameInput.value || "Your Name"

    profileAvatar.textContent =
    fullName.slice(0, 1).toUpperCase()

    previewName.textContent =
    fullName

    previewHeadline.textContent =
    headlineInput.value || "Your professional headline will appear here."

    previewLocation.textContent =
    locationInput.value || "United Kingdom"

    previewRole.textContent =
    targetRoleInput.value || "Target role not set"

    previewSummary.innerHTML =
    summaryInput.value
    ? formatText(summaryInput.value)
    : "Add a summary to show recruiters who you are, what you are targeting and why you are a strong candidate."

    previewSkills.innerHTML =
    renderChipList(
      splitItems(skillsInput.value),
      "Add skills"
    )

    previewProjects.innerHTML =
    renderParagraphList(
      projectsInput.value,
      "Add projects, coursework or portfolio evidence."
    )

    previewExperience.innerHTML =
    renderParagraphList(
      experienceInput.value,
      "Add experience highlights."
    )

    previewEducation.innerHTML =
    renderParagraphList(
      educationInput.value,
      "Add education or certifications."
    )

    previewLinks.innerHTML =
    renderChipList(
      splitItems(linksInput.value),
      "Add links"
    )

    updateStrength()
    updateChecklist()
    updateLinkBox()
  }

  async function loadProfile(){
    const { data, error } =
    await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle()

    if(error){
      console.error(error)
      updatePreview()
      return
    }

    if(!data){
      updatePreview()
      return
    }

    currentProfile =
    data

    currentSlug =
    data.slug || ""

    fullNameInput.value =
    data.full_name || ""

    targetRoleInput.value =
    data.target_role || ""

    locationInput.value =
    data.location || ""

    headlineInput.value =
    data.headline || ""

    summaryInput.value =
    data.summary || data.bio || ""

    skillsInput.value =
    data.skills || ""

    projectsInput.value =
    data.projects || ""

    experienceInput.value =
    data.experience || ""

    educationInput.value =
    data.education || ""

    linksInput.value =
    data.links || [
      data.linkedin_url,
      data.github_url
    ].filter(Boolean).join("\n")

    visibilityInput.value =
    data.public_enabled
    ? "public"
    : "private"

    updatePreview()
  }

  async function saveProfile(){
    currentUser =
    await protectPage()

    if(fullNameInput.value.trim().length < 2){
      alert("Add your full name first.")
      return
    }

    if(targetRoleInput.value.trim().length < 2){
      alert("Add your target role first.")
      return
    }

    const buttons =
    [
      saveProfileBtn,
      saveProfileBtnSide
    ].filter(Boolean)

    buttons.forEach((button)=>{
      button.textContent =
      "Saving..."

      button.classList.add("loading-state")
    })

    const slug =
    currentSlug || getSlug()

    const profileData = {
      user_id:currentUser.id,
      slug,
      full_name:fullNameInput.value,
      target_role:targetRoleInput.value,
      location:locationInput.value,
      headline:headlineInput.value,
      summary:summaryInput.value,
      bio:summaryInput.value,
      skills:skillsInput.value,
      projects:projectsInput.value,
      experience:experienceInput.value,
      education:educationInput.value,
      links:linksInput.value,
      public_enabled:visibilityInput.value === "public",
      updated_at:new Date().toISOString()
    }

    let result

    if(currentProfile){
      result =
      await supabase
      .from("public_profiles")
      .update(profileData)
      .eq("user_id", currentUser.id)
      .select()
      .single()
    }else{
      result =
      await supabase
      .from("public_profiles")
      .insert([profileData])
      .select()
      .single()
    }

    buttons.forEach((button)=>{
      button.classList.remove("loading-state")
    })

    saveProfileBtn.textContent =
    "Save Profile"

    saveProfileBtnSide.textContent =
    "Save Public Profile"

    if(result.error){
      console.error(result.error)
      alert("Could not save profile. Your profile link may already exist.")
      return
    }

    currentProfile =
    result.data

    currentSlug =
    result.data.slug

    updatePreview()

    alert("Public profile saved.")
  }

  function scrollToPreview(){
    const preview =
    document.getElementById("profilePreview")

    if(preview){
      preview.scrollIntoView({
        behavior:"smooth",
        block:"start"
      })
    }
  }

  ;[
    fullNameInput,
    targetRoleInput,
    locationInput,
    headlineInput,
    summaryInput,
    skillsInput,
    projectsInput,
    experienceInput,
    educationInput,
    linksInput,
    visibilityInput
  ].filter(Boolean).forEach((input)=>{
    input.addEventListener("input", updatePreview)
    input.addEventListener("change", updatePreview)
  })

  if(saveProfileBtn){
    saveProfileBtn.addEventListener("click", saveProfile)
  }

  if(saveProfileBtnSide){
    saveProfileBtnSide.addEventListener("click", saveProfile)
  }

  if(previewProfileBtn){
    previewProfileBtn.addEventListener("click", scrollToPreview)
  }

  if(copyProfileLinkBtn){
    copyProfileLinkBtn.addEventListener("click", async ()=>{
      await navigator.clipboard.writeText(getPublicUrl())

      copyProfileLinkBtn.textContent =
      "Copied!"

      setTimeout(()=>{
        copyProfileLinkBtn.textContent =
        "Copy Profile Link"
      }, 1500)
    })
  }

  if(logoutBtn){
    logoutBtn.addEventListener("click", async ()=>{
      await supabase.auth.signOut()

      window.location.href =
      "login.html"
    })
  }

  currentUser =
  await protectPage()

  await loadProfile()
}