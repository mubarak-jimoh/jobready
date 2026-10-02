import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium,
  requirePremium
}
from "/js/premium.js"

import html2pdf
from "https://cdn.jsdelivr.net/npm/html2pdf.js/+esm"

const nameInput = document.getElementById("nameInput")
const jobInput = document.getElementById("jobInput")
const summaryInput = document.getElementById("summaryInput")
const skillsInput = document.getElementById("skillsInput")
const experienceInput = document.getElementById("experienceInput")
const educationInput = document.getElementById("educationInput")
const projectsInput = document.getElementById("projectsInput")
const certificationsInput = document.getElementById("certificationsInput")
const volunteerInput = document.getElementById("volunteerInput")
const languagesInput = document.getElementById("languagesInput")
const linksInput = document.getElementById("linksInput")
const jobDescriptionInput = document.getElementById("jobDescriptionInput")

const cvPreview = document.getElementById("cvPreview")
const selectedTemplateName = document.getElementById("selectedTemplateName")
const templateButtons = document.querySelectorAll(".template-pill")
const themeButtons = document.querySelectorAll(".theme-dot")

const atsScore = document.getElementById("atsScore")
const feedback1 = document.getElementById("feedback1")
const feedback2 = document.getElementById("feedback2")
const feedback3 = document.getElementById("feedback3")

const matchScore = document.getElementById("matchScore")
const recruiterInsight = document.getElementById("recruiterInsight")

const saveCvBtn = document.getElementById("saveCvBtn")
const analyseJobBtn = document.getElementById("analyseJobBtn")
const logoutBtn = document.getElementById("logoutBtn")
const improveAiBtn = document.getElementById("improveAiBtn")
const humaniseBtn = document.getElementById("humaniseBtn")
const coverLetterBtn = document.getElementById("coverLetterBtn")
const downloadPdfBtn = document.getElementById("downloadPdfBtn")
const downloadWordBtn =
document.getElementById("downloadWordBtn")
const advancedScoreBtn = document.getElementById("advancedScoreBtn")
const advancedScorePanel = document.getElementById("advancedScorePanel")
const advancedScoreOutput = document.getElementById("advancedScoreOutput")

const fontSelector = document.getElementById("fontSelector")
const fontSizeSlider = document.getElementById("fontSizeSlider")
const lineSpacingSlider = document.getElementById("lineSpacingSlider")
const sectionSpacingSlider = document.getElementById("sectionSpacingSlider")
const pagePaddingSlider = document.getElementById("pagePaddingSlider")
const headerStyleSelector = document.getElementById("headerStyleSelector")
const resetDesignBtn = document.getElementById("resetDesignBtn")

const fontSizeValue = document.getElementById("fontSizeValue")
const lineSpacingValue = document.getElementById("lineSpacingValue")
const sectionSpacingValue = document.getElementById("sectionSpacingValue")
const pagePaddingValue = document.getElementById("pagePaddingValue")

const sectionControlList = document.getElementById("sectionControlList")

const cvHealthScore = document.getElementById("cvHealthScore")
const cvHealthBar = document.getElementById("cvHealthBar")
const cvHealthOutput = document.getElementById("cvHealthOutput")
const scanScore = document.getElementById("scanScore")
const scanBar = document.getElementById("scanBar")
const recruiterScanOutput = document.getElementById("recruiterScanOutput")

const applicationPackageBtn = document.getElementById("applicationPackageBtn")
const applicationPackagePanel = document.getElementById("applicationPackagePanel")
const applicationPackageOutput = document.getElementById("applicationPackageOutput")
const recruiterModeBtn =
document.getElementById("recruiterModeBtn")

const recruiterPanel =
document.getElementById("recruiterPanel")

const recruiterOutput =
document.getElementById("recruiterOutput")
let currentAtsScore = 40
let currentMatchScore = 0
let currentMissingKeywords = ""
let currentMatchedKeywords = ""
let currentTemplate = "modern"
let currentTheme = "blue"
let premiumActive = false

let keywordHeatmapOutput = null
let recruiterBreakdownOutput = null
let skillsGapOutput = null
let shortlistRiskOutput = null
let quantifierOutput = null
let oneClickPolishBtn = null
let oneClickKeywordBtn = null
let oneClickAchievementBtn = null
let spellCheckPanel = null
let spellCheckOutput = null
let spellCheckBtn = null
let spellingScoreOutput = null
let designSettings = {
  font:"inter",
  fontSize:16,
  lineSpacing:1.6,
  sectionSpacing:22,
  pagePadding:36,
  headerStyle:"standard"
}

let cvSections = [
  { id:"summary", label:"Professional Summary", visible:true },
  { id:"skills", label:"Core Skills", visible:true },
  { id:"experience", label:"Experience", visible:true },
  { id:"education", label:"Education", visible:true },
  { id:"projects", label:"Projects", visible:true },
  { id:"certifications", label:"Certifications", visible:true },
  { id:"volunteer", label:"Volunteer Experience", visible:false },
  { id:"languages", label:"Languages", visible:false },
  { id:"links", label:"Links", visible:true }
]

const premiumTemplates = [
  "silicon",
  "developer",
  "data",
  "cyber",
  "executive",
  "boardroom",
  "consultant",
  "corporate",
  "finance",
  "legal",
  "minimal",
  "pure",
  "classic",
  "oxford",
  "creative",
  "portfolio",
  "marketing",
  "apprentice",
  "student",
  "career-switch",
  "healthcare",
  "nhs",
  "retail",
  "sales",
  "hospitality",
  "international",
  "premium-pro"
]

const templateNames = {
  modern:"Modern Pro",
  graduate:"Graduate Plus",
  "prime-ats":"Prime ATS",
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
  classic:"Classic Serif",
  oxford:"Oxford Classic",
  creative:"Creative Edge",
  portfolio:"Portfolio Bold",
  marketing:"Marketing Pulse",
  apprentice:"Apprentice Start",
  student:"Student Focus",
  "career-switch":"Career Switch",
  healthcare:"Healthcare Care",
  nhs:"NHS Admin",
  retail:"Retail Ready",
  sales:"Sales Impact",
  hospitality:"Hospitality Pro",
  international:"International Clean",
  "premium-pro":"Premium Pro"
}

const keywordBank = [
  "communication",
  "teamwork",
  "customer service",
  "problem solving",
  "organisation",
  "leadership",
  "time management",
  "sales",
  "cash handling",
  "microsoft office",
  "data entry",
  "attention to detail",
  "adaptability",
  "reliability",
  "punctual",
  "targets",
  "stock",
  "inventory",
  "administration",
  "support",
  "training",
  "reporting",
  "excel",
  "sql",
  "python",
  "power bi",
  "analysis",
  "stakeholder",
  "project",
  "crm",
  "kpi",
  "dashboard",
  "data cleaning",
  "visualisation",
  "analytics",
  "presentation",
  "documentation",
  "quality assurance",
  "risk",
  "compliance",
  "budgeting",
  "forecasting",
  "reconciliation",
  "salesforce",
  "javascript",
  "html",
  "css",
  "react",
  "node",
  "api",
  "git",
  "azure",
  "aws",
  "cybersecurity",
  "networking",
  "linux",
  "troubleshooting"
]

const roleKeywordMap = {
  data:[
    "excel",
    "sql",
    "power bi",
    "dashboard",
    "data cleaning",
    "analysis",
    "reporting",
    "kpi",
    "stakeholder",
    "visualisation"
  ],
  software:[
    "javascript",
    "html",
    "css",
    "react",
    "node",
    "api",
    "git",
    "testing",
    "problem solving",
    "debugging"
  ],
  cyber:[
    "cybersecurity",
    "networking",
    "linux",
    "risk",
    "compliance",
    "troubleshooting",
    "security",
    "incident",
    "monitoring"
  ],
  finance:[
    "excel",
    "reconciliation",
    "budgeting",
    "forecasting",
    "analysis",
    "reporting",
    "attention to detail",
    "compliance",
    "stakeholder"
  ],
  retail:[
    "customer service",
    "cash handling",
    "stock",
    "teamwork",
    "communication",
    "sales",
    "targets",
    "reliability",
    "problem solving"
  ],
  admin:[
    "administration",
    "data entry",
    "microsoft office",
    "organisation",
    "communication",
    "documentation",
    "attention to detail",
    "support"
  ]
}

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function formatText(text, fallback = ""){
  return safeText(text || fallback).replace(/\n/g, "<br>")
}

function getInputValue(input){
  return input?.value || ""
}

function getValues(){
  return {
    name:nameInput.value || "Your Name",
    job:jobInput.value || "Your Job Title",
    summary:summaryInput.value || "Your professional summary will appear here.",
    skills:skillsInput.value || "",
    experience:experienceInput.value || "Your experience will appear here.",
    education:educationInput.value || "Your education will appear here.",
    projects:getInputValue(projectsInput),
    certifications:getInputValue(certificationsInput),
    volunteer:getInputValue(volunteerInput),
    languages:getInputValue(languagesInput),
    links:getInputValue(linksInput)
  }
}

function getCvText(){
  return `
    ${jobInput.value}
    ${summaryInput.value}
    ${skillsInput.value}
    ${experienceInput.value}
    ${educationInput.value}
    ${projectsInput?.value || ""}
    ${certificationsInput?.value || ""}
    ${volunteerInput?.value || ""}
    ${languagesInput?.value || ""}
    ${linksInput?.value || ""}
  `.toLowerCase()
}

function getSkillArray(){
  return String(skillsInput.value || "")
  .split(/,|\n/)
  .map(item => item.trim())
  .filter(Boolean)
}

function textToList(text){
  const items =
  String(text || "")
  .split(/\n|,/)
  .map(item => item.trim())
  .filter(Boolean)

  if(items.length === 0){
    return ""
  }

  return `
    <ul class="cv-clean-list">
      ${items.map(item => `<li>${safeText(item)}</li>`).join("")}
    </ul>
  `
}

function skillChips(){
  const skills = getSkillArray()

  if(skills.length === 0){
    return `<p>Your skills will appear here.</p>`
  }

  return `
    <div class="cv-skill-list">
      ${skills.map(skill => `<span>${safeText(skill)}</span>`).join("")}
    </div>
  `
}

function skillLines(){
  const skills = getSkillArray()

  if(skills.length === 0){
    return `<p>Your skills will appear here.</p>`
  }

  return `
    <ul class="cv-clean-list">
      ${skills.map(skill => `<li>${safeText(skill)}</li>`).join("")}
    </ul>
  `
}

function isSectionVisible(id){
  return cvSections.some(section => section.id === id && section.visible)
}

function renderSection(id, title, content, options = {}){
  if(!isSectionVisible(id)){
    return ""
  }

  const hasContent =
  String(content || "").trim().length > 0

  if(!hasContent && options.hideWhenEmpty){
    return ""
  }

  const body =
  options.list
  ? textToList(content)
  : `<p>${formatText(content, options.fallback || "")}</p>`

  if(!body){
    return ""
  }

  return `
    <section class="cv-premium-section" data-cv-section="${id}">
      <h3>${safeText(title)}</h3>
      ${body}
    </section>
  `
}

function renderSectionById(id, v){
  const map = {
    summary:()=>renderSection("summary", "Professional Summary", v.summary),
    skills:()=>isSectionVisible("skills") ? `
      <section class="cv-premium-section" data-cv-section="skills">
        <h3>Core Skills</h3>
        ${skillChips()}
      </section>
    ` : "",
    experience:()=>renderSection("experience", "Experience", v.experience),
    education:()=>renderSection("education", "Education", v.education),
    projects:()=>renderSection("projects", "Projects", v.projects, { hideWhenEmpty:true }),
    certifications:()=>renderSection("certifications", "Certifications", v.certifications, { hideWhenEmpty:true, list:true }),
    volunteer:()=>renderSection("volunteer", "Volunteer Experience", v.volunteer, { hideWhenEmpty:true }),
    languages:()=>renderSection("languages", "Languages", v.languages, { hideWhenEmpty:true, list:true }),
    links:()=>renderSection("links", "Links", v.links, { hideWhenEmpty:true, list:true })
  }

  return map[id] ? map[id]() : ""
}
function orderedSections(v){
  return cvSections
  .map(section => renderSectionById(section.id, v))
  .join("")
}

function designStyle(){
  const fontMap = {
    inter:"Inter, sans-serif",
    poppins:"Poppins, sans-serif",
    lato:"Lato, sans-serif",
    georgia:"Georgia, serif"
  }

  return `
    --jr-font:${fontMap[designSettings.font] || fontMap.inter};
    --jr-font-size:${designSettings.fontSize}px;
    --jr-line-height:${designSettings.lineSpacing};
    --jr-section-gap:${designSettings.sectionSpacing}px;
    --jr-page-padding:${designSettings.pagePadding}px;
  `
}

function headerClass(){
  return `header-${designSettings.headerStyle || "standard"}`
}

function professionalContactBar(v){
  const links =
  String(v.links || "")
  .split(/\n|,/)
  .map(item => item.trim())
  .filter(Boolean)

  const contactItems = [
    v.job || "Target Role",
    ...links.slice(0, 3)
  ]

  return `
    <div class="pro-cv-contact-bar">
      ${contactItems.map(item => `<span>${safeText(item)}</span>`).join("")}
    </div>
  `
}

function professionalSkillsBlock(){
  if(!isSectionVisible("skills")){
    return ""
  }

  const skills =
  getSkillArray()

  if(skills.length === 0){
    return ""
  }

  return `
    <section class="pro-cv-section pro-cv-skills-section">
      <h3>Core Skills</h3>
      <div class="pro-cv-skill-grid">
        ${skills.map(skill => `<span>${safeText(skill)}</span>`).join("")}
      </div>
    </section>
  `
}

function professionalMainSections(v){
  return cvSections
  .filter(section => section.id !== "skills")
  .map(section => renderSectionById(section.id, v))
  .join("")
}

function renderModern(v){
  return `
    <div class="pro-cv-page pro-cv-modern ${headerClass()}" style="${designStyle()}">
      <header class="pro-cv-header">
        <h1>${safeText(v.name)}</h1>
        <p>${safeText(v.job)}</p>
        ${professionalContactBar(v)}
      </header>

      ${isSectionVisible("summary") ? `
        <section class="pro-cv-summary">
          <h3>Professional Profile</h3>
          <p>${formatText(v.summary)}</p>
        </section>
      ` : ""}

      ${professionalSkillsBlock()}

      <div class="pro-cv-body">
        ${cvSections
          .filter(section => !["summary","skills"].includes(section.id))
          .map(section => renderSectionById(section.id, v))
          .join("")}
      </div>
    </div>
  `
}

function renderGraduate(v){
  return `
    <div class="pro-cv-page pro-cv-graduate ${headerClass()}" style="${designStyle()}">
      <header class="pro-cv-header graduate-header">
        <div>
          <h1>${safeText(v.name)}</h1>
          <p>${safeText(v.job)}</p>
          ${professionalContactBar(v)}
        </div>
      </header>

      <div class="graduate-focus-strip">
        <span>Education</span>
        <span>Projects</span>
        <span>Skills</span>
        <span>Potential</span>
      </div>

      ${isSectionVisible("summary") ? `
        <section class="pro-cv-summary">
          <h3>Career Profile</h3>
          <p>${formatText(v.summary)}</p>
        </section>
      ` : ""}

      ${isSectionVisible("education") ? renderSection("education", "Education", v.education) : ""}
      ${isSectionVisible("projects") ? renderSection("projects", "Projects", v.projects, { hideWhenEmpty:true }) : ""}
      ${professionalSkillsBlock()}

      ${cvSections
        .filter(section => !["summary","skills","education","projects"].includes(section.id))
        .map(section => renderSectionById(section.id, v))
        .join("")}
    </div>
  `
}

function renderSilicon(v){
  return `
    <div class="pro-cv-page pro-cv-tech ${headerClass()}" style="${designStyle()}">
      <aside class="pro-cv-sidebar dark-sidebar">
        <h1>${safeText(v.name)}</h1>
        <p>${safeText(v.job)}</p>

        ${professionalContactBar(v)}

        ${isSectionVisible("skills") ? `
          <section>
            <h3>Technical Skills</h3>
            ${skillLines()}
          </section>
        ` : ""}

        ${isSectionVisible("links") && v.links ? `
          <section>
            <h3>Links</h3>
            ${textToList(v.links)}
          </section>
        ` : ""}

        ${isSectionVisible("certifications") && v.certifications ? `
          <section>
            <h3>Certifications</h3>
            ${textToList(v.certifications)}
          </section>
        ` : ""}
      </aside>

      <main class="pro-cv-main">
        ${isSectionVisible("summary") ? `
          <section class="pro-cv-summary">
            <h3>Professional Profile</h3>
            <p>${formatText(v.summary)}</p>
          </section>
        ` : ""}

        ${cvSections
          .filter(section => !["summary","skills","links","certifications"].includes(section.id))
          .map(section => renderSectionById(section.id, v))
          .join("")}
      </main>
    </div>
  `
}

function renderExecutive(v){
  return `
    <div class="pro-cv-page pro-cv-executive ${headerClass()}" style="${designStyle()}">
      <header class="executive-black-header">
        <p>Executive Profile</p>
        <h1>${safeText(v.name)}</h1>
        <span>${safeText(v.job)}</span>
        ${professionalContactBar(v)}
      </header>

      ${isSectionVisible("summary") ? `
        <section class="executive-summary-block">
          <h3>Leadership Profile</h3>
          <p>${formatText(v.summary)}</p>
        </section>
      ` : ""}

      ${professionalSkillsBlock()}

      ${cvSections
        .filter(section => !["summary","skills"].includes(section.id))
        .map(section => renderSectionById(section.id, v))
        .join("")}
    </div>
  `
}

function renderCorporate(v){
  return `
    <div class="pro-cv-page pro-cv-corporate ${headerClass()}" style="${designStyle()}">
      <header class="corporate-header">
        <div>
          <h1>${safeText(v.name)}</h1>
          <p>${safeText(v.job)}</p>
        </div>
        <strong>Professional CV</strong>
      </header>

      ${professionalContactBar(v)}

      <div class="corporate-layout">
        <aside>
          ${isSectionVisible("skills") ? `
            <section>
              <h3>Key Skills</h3>
              ${skillLines()}
            </section>
          ` : ""}

          ${isSectionVisible("education") ? `
            <section>
              <h3>Education</h3>
              <p>${formatText(v.education)}</p>
            </section>
          ` : ""}

          ${isSectionVisible("certifications") && v.certifications ? `
            <section>
              <h3>Certifications</h3>
              ${textToList(v.certifications)}
            </section>
          ` : ""}
        </aside>

        <main>
          ${cvSections
            .filter(section => !["skills","education","certifications"].includes(section.id))
            .map(section => renderSectionById(section.id, v))
            .join("")}
        </main>
      </div>
    </div>
  `
}
function renderMinimal(v){
  return `
    <div class="cv-minimal-shell ${headerClass()}" style="${designStyle()}">
      <header>
        <h1>${safeText(v.name)}</h1>
        <span>${safeText(v.job)}</span>
      </header>

      ${orderedSections(v)}
    </div>
  `
}

function renderOxford(v){
  return `
    <div class="cv-oxford-shell ${headerClass()}" style="${designStyle()}">
      <header>
        <h1>${safeText(v.name)}</h1>
        <p>${safeText(v.job)}</p>
      </header>

      ${orderedSections(v)}
    </div>
  `
}

function renderFinance(v){
  return `
    <div class="cv-finance-shell ${headerClass()}" style="${designStyle()}">
      <header>
        <div>
          <h1>${safeText(v.name)}</h1>
          <span>${safeText(v.job)}</span>
        </div>

        <strong>ANALYST CV</strong>
      </header>

      <div class="cv-finance-metrics">
        <div>Commercial</div>
        <div>Analytical</div>
        <div>Detail-led</div>
      </div>

      ${orderedSections(v)}
    </div>
  `
}

function renderCreative(v){
  return `
    <div class="cv-creative-shell ${headerClass()}" style="${designStyle()}">
      <div class="cv-creative-banner">
        <div class="cv-avatar">${safeText(v.name).slice(0,1).toUpperCase()}</div>

        <div>
          <h1>${safeText(v.name)}</h1>
          <span>${safeText(v.job)}</span>
        </div>
      </div>

      ${orderedSections(v)}
    </div>
  `
}

function renderPreview(){
  const values =
  getValues()

  const renderers = {
    modern:renderModern,
    graduate:renderGraduate,
    silicon:renderSilicon,
    executive:renderExecutive,
    corporate:renderCorporate,
    minimal:renderMinimal,
    oxford:renderOxford,
    finance:renderFinance,
    creative:renderCreative
  }

  cvPreview.innerHTML =
  (renderers[currentTemplate] || renderModern)(values)
}

function saveDesignSettings(){
  localStorage.setItem(
    "jobready_design_settings",
    JSON.stringify(designSettings)
  )
}

function loadDesignSettings(){
  const saved =
  localStorage.getItem("jobready_design_settings")

  if(!saved){
    return
  }

  try{
    designSettings = {
      ...designSettings,
      ...JSON.parse(saved)
    }
  }catch(error){
    console.error(error)
  }
}

function syncDesignControls(){
  if(!fontSelector){
    return
  }

  fontSelector.value = designSettings.font
  fontSizeSlider.value = designSettings.fontSize
  lineSpacingSlider.value = designSettings.lineSpacing
  sectionSpacingSlider.value = designSettings.sectionSpacing
  pagePaddingSlider.value = designSettings.pagePadding
  headerStyleSelector.value = designSettings.headerStyle

  fontSizeValue.textContent = designSettings.fontSize
  lineSpacingValue.textContent = designSettings.lineSpacing
  sectionSpacingValue.textContent = designSettings.sectionSpacing
  pagePaddingValue.textContent = designSettings.pagePadding
}

function updateDesign(){
  designSettings = {
    font:fontSelector.value,
    fontSize:Number(fontSizeSlider.value),
    lineSpacing:Number(lineSpacingSlider.value),
    sectionSpacing:Number(sectionSpacingSlider.value),
    pagePadding:Number(pagePaddingSlider.value),
    headerStyle:headerStyleSelector.value
  }

  syncDesignControls()
  saveDesignSettings()
  updatePreview()
}

function saveSectionSettings(){
  localStorage.setItem(
    "jobready_section_settings",
    JSON.stringify(cvSections)
  )
}

function loadSectionSettings(){
  const saved =
  localStorage.getItem("jobready_section_settings")

  if(!saved){
    return
  }

  try{
    const parsed =
    JSON.parse(saved)

    if(Array.isArray(parsed)){
      cvSections = parsed
    }
  }catch(error){
    console.error(error)
  }
}

function renderSectionControls(){
  if(!sectionControlList){
    return
  }

  sectionControlList.innerHTML = ""

  cvSections.forEach((section, index)=>{
    const row =
    document.createElement("div")

    row.className =
    "section-control-row"

    row.innerHTML =
    `
      <label>
        <input type="checkbox" ${section.visible ? "checked" : ""}>
        <span>${safeText(section.label)}</span>
      </label>

      <div>
        <button type="button" class="section-move-btn" data-direction="up">↑</button>
        <button type="button" class="section-move-btn" data-direction="down">↓</button>
      </div>
    `

    row.querySelector("input").addEventListener("change", (event)=>{
      cvSections[index].visible =
      event.target.checked

      saveSectionSettings()
      updatePreview()
      updateHealthAndScan()
    })

    row.querySelectorAll(".section-move-btn").forEach((button)=>{
      button.addEventListener("click", ()=>{
        const direction =
        button.dataset.direction

        const targetIndex =
        direction === "up"
        ? index - 1
        : index + 1

        if(targetIndex < 0 || targetIndex >= cvSections.length){
          return
        }

        const copy =
        [...cvSections]

        const item =
        copy.splice(index, 1)[0]

        copy.splice(targetIndex, 0, item)

        cvSections =
        copy

        saveSectionSettings()
        renderSectionControls()
        updatePreview()
        updateHealthAndScan()
      })
    })

    sectionControlList.appendChild(row)
  })
}

function createIntelligenceExtras(){
  const target =
  recruiterScanOutput?.closest(".builder-intelligence-grid") ||
  document.querySelector(".builder-right")

  if(!target || document.getElementById("eliteIntelligencePanel")){
    return
  }

  const panel =
  document.createElement("div")

  panel.className =
  "panel-card elite-intelligence-panel"

  panel.id =
  "eliteIntelligencePanel"

  panel.innerHTML =
  `
    <p class="insight-label">Elite Recruiter Intelligence</p>
    <h3>Shortlist diagnostics</h3>
    <p>See what is helping or hurting your chance before you apply.</p>

    <div class="elite-diagnostic-grid">
      <div>
        <h4>Keyword Heatmap</h4>
        <div id="keywordHeatmapOutput" class="keyword-chip-row">
          <p>Paste a job advert and run Job Match.</p>
        </div>
      </div>

      <div>
        <h4>Recruiter Score Breakdown</h4>
        <div id="recruiterBreakdownOutput" class="builder-intelligence-output">
          <p>Build your CV to see a score breakdown.</p>
        </div>
      </div>

      <div>
        <h4>Skills Gap</h4>
        <div id="skillsGapOutput" class="keyword-chip-row">
          <p>Add a target role to detect missing skills.</p>
        </div>
      </div>

      <div>
        <h4>Shortlist Risk</h4>
        <div id="shortlistRiskOutput" class="builder-intelligence-output">
          <p>No risk analysis yet.</p>
        </div>
      </div>
    </div>

    <div class="panel-card mini-action-panel">
      <h4>One-click local upgrades</h4>
      <p>Quick improvements before using full AI rewriting.</p>

      <div class="builder-actions">
        <button class="secondary-action-btn" id="oneClickPolishBtn">Polish Summary</button>
        <button class="secondary-action-btn" id="oneClickKeywordBtn">Add Keyword Suggestions</button>
        <button class="secondary-action-btn" id="oneClickAchievementBtn">Add Achievement Prompts</button>
      </div>
    </div>

    <div class="panel-card mini-action-panel">
      <h4>Achievement Quantifier</h4>
      <div id="quantifierOutput" class="builder-intelligence-output">
        <p>JobReady will suggest where to add measurable results.</p>
      </div>
    </div>
  `

  const advancedPanel =
  document.getElementById("advancedScorePanel")

  if(advancedPanel){
    advancedPanel.before(panel)
  }else{
    target.appendChild(panel)
  }

  keywordHeatmapOutput =
  document.getElementById("keywordHeatmapOutput")

  recruiterBreakdownOutput =
  document.getElementById("recruiterBreakdownOutput")

  skillsGapOutput =
  document.getElementById("skillsGapOutput")

  shortlistRiskOutput =
  document.getElementById("shortlistRiskOutput")

  quantifierOutput =
  document.getElementById("quantifierOutput")

  oneClickPolishBtn =
  document.getElementById("oneClickPolishBtn")

  oneClickKeywordBtn =
  document.getElementById("oneClickKeywordBtn")

  oneClickAchievementBtn =
  document.getElementById("oneClickAchievementBtn")

  oneClickPolishBtn.addEventListener("click", polishSummaryLocally)
  oneClickKeywordBtn.addEventListener("click", addKeywordSuggestionsLocally)
  oneClickAchievementBtn.addEventListener("click", addAchievementPromptsLocally)
}
function createSpellCheckerPanel(){
  const target =
  document.querySelector(".builder-right")

  if(!target || document.getElementById("spellCheckPanel")){
    return
  }

  const panel =
  document.createElement("div")

  panel.className =
  "panel-card"

  panel.id =
  "spellCheckPanel"

  panel.style.marginBottom =
  "25px"

  panel.innerHTML =
  `
    <div class="chat-header-row">
      <div>
        <p class="insight-label">Spell & Grammar Check</p>
        <h3>CV writing quality</h3>
        <p>Find common spelling mistakes, weak phrases and readability issues.</p>
      </div>

      <div>
        <p class="insight-label">Writing Score</p>
        <h3 id="spellingScoreOutput">0%</h3>
      </div>
    </div>

    <div id="spellCheckOutput" class="builder-intelligence-output">
      <p>Run a writing check to find improvements.</p>
    </div>

    <button class="secondary-action-btn" id="spellCheckBtn">
      Run Spell Check
    </button>
  `

  const cvStage =
  document.querySelector(".cv-stage-shell")

  if(cvStage){
    cvStage.before(panel)
  }else{
    target.appendChild(panel)
  }

  spellCheckPanel =
  document.getElementById("spellCheckPanel")

  spellCheckOutput =
  document.getElementById("spellCheckOutput")

  spellCheckBtn =
  document.getElementById("spellCheckBtn")

  spellingScoreOutput =
  document.getElementById("spellingScoreOutput")

  spellCheckBtn.addEventListener("click", runSpellCheck)
}

function runSpellCheck(){
  if(!spellCheckOutput){
    return
  }

  const fields = [
    { label:"Professional Summary", input:summaryInput },
    { label:"Skills", input:skillsInput },
    { label:"Experience", input:experienceInput },
    { label:"Education", input:educationInput },
    { label:"Projects", input:projectsInput },
    { label:"Certifications", input:certificationsInput }
  ].filter(item => item.input)

  const commonMistakes = [
    { wrong:"managment", correct:"management" },
    { wrong:"experiance", correct:"experience" },
    { wrong:"responsable", correct:"responsible" },
    { wrong:"recieved", correct:"received" },
    { wrong:"achievment", correct:"achievement" },
    { wrong:"acheivement", correct:"achievement" },
    { wrong:"succesful", correct:"successful" },
    { wrong:"sucessful", correct:"successful" },
    { wrong:"comunication", correct:"communication" },
    { wrong:"communcation", correct:"communication" },
    { wrong:"collaberated", correct:"collaborated" },
    { wrong:"proffesional", correct:"professional" },
    { wrong:"enviroment", correct:"environment" },
    { wrong:"maintainance", correct:"maintenance" },
    { wrong:"definately", correct:"definitely" },
    { wrong:"seperate", correct:"separate" },
    { wrong:"oppurtunity", correct:"opportunity" }
  ]

  const weakPhrases = [
    {
      phrase:"hard working",
      advice:"Replace with specific proof, such as reliability, results or responsibilities."
    },
    {
      phrase:"team player",
      advice:"Show how you worked with a team and what outcome you supported."
    },
    {
      phrase:"good communication skills",
      advice:"Give a specific communication example instead of a generic claim."
    },
    {
      phrase:"responsible for",
      advice:"Start bullets with stronger action verbs like delivered, supported, improved or managed."
    },
    {
      phrase:"various tasks",
      advice:"Be specific about the tasks, tools or outcomes."
    },
    {
      phrase:"helped with",
      advice:"Explain what you helped with and the result."
    }
  ]

  const issues = []

  fields.forEach((field)=>{
    const text =
    String(field.input.value || "")

    const lower =
    text.toLowerCase()

    commonMistakes.forEach((mistake)=>{
      const regex =
      new RegExp(`\\b${mistake.wrong}\\b`, "i")

      if(regex.test(text)){
        issues.push({
          type:"Spelling",
          field:field.label,
          message:`"${mistake.wrong}" may be misspelled. Suggested: "${mistake.correct}".`
        })
      }
    })

    weakPhrases.forEach((item)=>{
      if(lower.includes(item.phrase)){
        issues.push({
          type:"Weak phrase",
          field:field.label,
          message:`"${item.phrase}" is generic. ${item.advice}`
        })
      }
    })

    const repeatedWords =
    text.match(/\b(\w+)\s+\1\b/gi)

    if(repeatedWords){
      repeatedWords.forEach((repeat)=>{
        issues.push({
          type:"Repeated word",
          field:field.label,
          message:`Repeated word detected: "${repeat}".`
        })
      })
    }

    if(text.length > 0){
      const longSentences =
      text
      .split(/[.!?]/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.split(/\s+/).length > 32)

      longSentences.slice(0, 2).forEach(()=>{
        issues.push({
          type:"Readability",
          field:field.label,
          message:"One sentence may be too long. Consider splitting it for recruiter readability."
        })
      })
    }
  })

  const totalTextLength =
  fields.reduce((sum, field)=>{
    return sum + String(field.input.value || "").length
  }, 0)

  let score =
  totalTextLength > 40
  ? 100 - Math.min(issues.length * 8, 65)
  : 0

  score =
  Math.max(score, 0)

  if(spellingScoreOutput){
    spellingScoreOutput.textContent =
    `${score}%`
  }

  if(issues.length === 0 && totalTextLength > 40){
    spellCheckOutput.innerHTML =
    `
      <p><strong>Strong writing quality.</strong></p>
      <p>No obvious spelling, repeated-word or weak phrase issues found.</p>
    `
    return
  }

  if(totalTextLength <= 40){
    spellCheckOutput.innerHTML =
    `
      <p>Add more CV content before running a full writing check.</p>
    `
    return
  }

  spellCheckOutput.innerHTML =
  `
    <p><strong>${issues.length} writing improvements found.</strong></p>

    <ul>
      ${issues.slice(0, 8).map(issue => `
        <li>
          <strong>${safeText(issue.type)} · ${safeText(issue.field)}:</strong>
          ${safeText(issue.message)}
        </li>
      `).join("")}
    </ul>
  `
}

function getRoleFamily(){
  const role =
  `${jobInput.value} ${jobDescriptionInput.value}`.toLowerCase()

  if(role.includes("data") || role.includes("analyst") || role.includes("power bi")){
    return "data"
  }

  if(role.includes("software") || role.includes("developer") || role.includes("engineer")){
    return "software"
  }

  if(role.includes("cyber") || role.includes("security")){
    return "cyber"
  }

  if(role.includes("finance") || role.includes("account") || role.includes("bank")){
    return "finance"
  }

  if(role.includes("retail") || role.includes("customer") || role.includes("shop")){
    return "retail"
  }

  if(role.includes("admin") || role.includes("office") || role.includes("assistant")){
    return "admin"
  }

  return "admin"
}

function getRecommendedRoleKeywords(){
  const family =
  getRoleFamily()

  return roleKeywordMap[family] || roleKeywordMap.admin
}

function extractJobKeywords(){
  const jobDescription =
  jobDescriptionInput.value.toLowerCase()

  const bankMatches =
  keywordBank.filter(keyword =>
    jobDescription.includes(keyword)
  )

  const roleMatches =
  getRecommendedRoleKeywords()

  return [
    ...new Set([
      ...bankMatches,
      ...roleMatches
    ])
  ]
}

function renderKeywordHeatmap(){
  if(!keywordHeatmapOutput){
    return
  }

  const cvText =
  getCvText()

  const keywords =
  extractJobKeywords()

  if(keywords.length === 0){
    keywordHeatmapOutput.innerHTML =
    "<p>Paste a job advert to see matched and missing keywords.</p>"
    return
  }

  const matched =
  keywords.filter(keyword => cvText.includes(keyword))

  const missing =
  keywords.filter(keyword => !cvText.includes(keyword))

  currentMatchedKeywords =
  matched.join(", ")

  currentMissingKeywords =
  missing.join(", ")

  keywordHeatmapOutput.innerHTML =
  `
    ${matched.map(keyword => `<span class="keyword-chip matched-keyword">✓ ${safeText(keyword)}</span>`).join("")}
    ${missing.map(keyword => `<span class="keyword-chip missing-keyword">+ ${safeText(keyword)}</span>`).join("")}
  `
}

function calculateBreakdown(){
  const cvText =
  getCvText()

  const skills =
  getSkillArray()

  const structure =
  Math.min(
    100,
    20 +
    (nameInput.value ? 15 : 0) +
    (jobInput.value ? 15 : 0) +
    (summaryInput.value ? 15 : 0) +
    (experienceInput.value ? 20 : 0) +
    (educationInput.value ? 15 : 0)
  )

  const evidence =
  Math.min(
    100,
    20 +
    (/\d/.test(cvText) ? 30 : 0) +
    (projectsInput?.value ? 20 : 0) +
    (certificationsInput?.value ? 15 : 0) +
    (["achieved","improved","created","analysed","delivered","managed","supported"].some(word => cvText.includes(word)) ? 15 : 0)
  )

  const keywords =
  extractJobKeywords()

  const matched =
  keywords.filter(keyword => cvText.includes(keyword)).length

  const keywordScore =
  keywords.length > 0
  ? Math.round((matched / keywords.length) * 100)
  : Math.min(100, skills.length * 10)

  const readability =
  Math.min(
    100,
    35 +
    (summaryInput.value.length > 50 && summaryInput.value.length < 550 ? 20 : 0) +
    (skills.length >= 6 ? 20 : 0) +
    (experienceInput.value.length > 80 ? 15 : 0) +
    (designSettings.lineSpacing >= 1.4 ? 10 : 0)
  )

  return {
    structure,
    evidence,
    keywordScore,
    readability
  }
}

function renderRecruiterBreakdown(){
  if(!recruiterBreakdownOutput){
    return
  }

  const breakdown =
  calculateBreakdown()

  recruiterBreakdownOutput.innerHTML =
  `
    <div class="score-breakdown-mini">
      <p><strong>Structure:</strong> ${breakdown.structure}%</p>
      <p><strong>Evidence:</strong> ${breakdown.evidence}%</p>
      <p><strong>Keywords:</strong> ${breakdown.keywordScore}%</p>
      <p><strong>Readability:</strong> ${breakdown.readability}%</p>
    </div>
  `
}

function renderSkillsGap(){
  if(!skillsGapOutput){
    return
  }

  const cvText =
  getCvText()

  const recommended =
  getRecommendedRoleKeywords()

  const missing =
  recommended.filter(keyword => !cvText.includes(keyword))

  if(missing.length === 0){
    skillsGapOutput.innerHTML =
    `<span class="keyword-chip matched-keyword">Strong role alignment</span>`
    return
  }

  skillsGapOutput.innerHTML =
  missing
  .slice(0, 8)
  .map(keyword => `<span class="keyword-chip missing-keyword">${safeText(keyword)}</span>`)
  .join("")
}

function renderShortlistRisk(){
  if(!shortlistRiskOutput){
    return
  }

  const risks = []

  if(!jobInput.value.trim()){
    risks.push("Target role is unclear.")
  }

  if(summaryInput.value.trim().length < 60){
    risks.push("Summary is too light for fast recruiter scanning.")
  }

  if(getSkillArray().length < 6){
    risks.push("Skills section may be too thin.")
  }

  if(!/\d/.test(getCvText())){
    risks.push("No measurable evidence or numbers detected.")
  }

  if(experienceInput.value.trim().length < 80){
    risks.push("Experience section needs stronger proof.")
  }

  if(currentMatchScore > 0 && currentMatchScore < 55){
    risks.push("Job match is currently weak for this advert.")
  }

  if(risks.length === 0){
    shortlistRiskOutput.innerHTML =
    "<p><strong>Low risk.</strong> Your CV is in a stronger position. Tailor it to each advert before applying.</p>"
    return
  }

  shortlistRiskOutput.innerHTML =
  `
    <p><strong>${risks.length} shortlist risks found:</strong></p>
    <ul>
      ${risks.slice(0, 5).map(risk => `<li>${safeText(risk)}</li>`).join("")}
    </ul>
  `
}

function renderQuantifierAdvice(){
  if(!quantifierOutput){
    return
  }

  const advice = []

  if(experienceInput.value && !/\d/.test(experienceInput.value)){
    advice.push("Add numbers to experience if truthful: customers served, reports created, tasks completed, time saved or accuracy improved.")
  }

  if(projectsInput?.value && !/\d/.test(projectsInput.value)){
    advice.push("Add project metrics: dataset size, number of pages, features built, dashboard visuals or tools used.")
  }

  if(summaryInput.value && !summaryInput.value.toLowerCase().includes(jobInput.value.toLowerCase()) && jobInput.value){
    advice.push("Mention your target role naturally in the summary.")
  }

  if(advice.length === 0){
    quantifierOutput.innerHTML =
    "<p>Your CV already includes stronger evidence signals. Keep metrics truthful and specific.</p>"
    return
  }

  quantifierOutput.innerHTML =
  `
    <ul>
      ${advice.map(item => `<li>${safeText(item)}</li>`).join("")}
    </ul>
  `
}

function updateEliteIntelligence(){
  renderKeywordHeatmap()
  renderRecruiterBreakdown()
  renderSkillsGap()
  renderShortlistRisk()
  renderQuantifierAdvice()
}

function polishSummaryLocally(){
  const role =
  jobInput.value || "target role"

  if(summaryInput.value.trim().length < 20){
    summaryInput.value =
    `Motivated candidate targeting a ${role} position, with a strong interest in developing practical skills, contributing to professional teams and delivering reliable work.`
  }else if(!summaryInput.value.toLowerCase().includes(role.toLowerCase())){
    summaryInput.value =
    `${summaryInput.value.trim()} Currently targeting ${role} opportunities where I can apply my skills and continue developing professionally.`
  }else{
    summaryInput.value =
    summaryInput.value.trim()
  }

  updatePreview()
}

function addKeywordSuggestionsLocally(){
  const missing =
  currentMissingKeywords
  ? currentMissingKeywords.split(",").map(item => item.trim()).filter(Boolean)
  : getRecommendedRoleKeywords()

  const existing =
  getSkillArray().map(item => item.toLowerCase())

  const additions =
  missing.filter(keyword => !existing.includes(keyword.toLowerCase())).slice(0, 6)

  if(additions.length === 0){
    alert("No obvious keyword suggestions found. Paste a job advert and run Job Match first.")
    return
  }

  const current =
  skillsInput.value.trim()

  skillsInput.value =
  current
  ? `${current}, ${additions.join(", ")}`
  : additions.join(", ")

  updatePreview()
}

function addAchievementPromptsLocally(){
  const prompt =
  `
Achievement prompts to complete:
- Improved [process/task] by [result] using [skill/tool].
- Supported [team/customer/user group] by delivering [specific task].
- Created or contributed to [project/output] using [tools/skills].
- Helped reduce, increase, organise, analyse or deliver [measurable outcome].
`.trim()

  const current =
  experienceInput.value.trim()

  if(current.includes("Achievement prompts to complete")){
    alert("Achievement prompts already added.")
    return
  }

  experienceInput.value =
  current
  ? `${current}\n\n${prompt}`
  : prompt

  updatePreview()
}

async function getLoggedInUser(){
  return await protectPage()
}

async function refreshPremiumState(){
  premiumActive =
  await checkPremium()

  updatePremiumButtons()
}

function applyTemplateVisual(template){
  currentTemplate =
  template

  cvPreview.className =
  `cv-preview premium-cv-preview template-${template} theme-${currentTheme}`

  selectedTemplateName.textContent =
  templateNames[template] || "Modern Pro"

  localStorage.setItem(
    "jobready_template",
    template
  )

  templateButtons.forEach((button)=>{
    button.classList.remove("active-template")

    if(button.dataset.template === template){
      button.classList.add("active-template")
    }
  })

  renderPreview()
}

function applyTheme(theme){
  currentTheme =
  theme || "blue"

  localStorage.setItem(
    "jobready_theme",
    currentTheme
  )

  themeButtons.forEach((button)=>{
    button.classList.remove("active-theme")

    if(button.dataset.theme === currentTheme){
      button.classList.add("active-theme")
    }
  })

  applyTemplateVisual(
    currentTemplate
  )
}

async function applyTemplate(template){
  if(
    premiumTemplates.includes(template) &&
    !premiumActive
  ){
    const allowed =
    await requirePremium(
      `${templateNames[template]} template`
    )

    if(!allowed){
      return
    }

    premiumActive =
    true
  }

  applyTemplateVisual(template)
}

async function loadTemplate(){
  const savedTheme =
  localStorage.getItem("jobready_theme") ||
  "blue"

  const savedTemplate =
  localStorage.getItem("jobready_template") ||
  "modern"

  currentTheme =
  savedTheme

  if(
    premiumTemplates.includes(savedTemplate) &&
    !premiumActive
  ){
    currentTemplate =
    "modern"
  }else{
    currentTemplate =
    savedTemplate
  }

  applyTheme(savedTheme)
}

function loadImportedCv(){
  const saved =
  localStorage.getItem("jobready_imported_cv")

  if(!saved){
    return
  }

  try{
    const data =
    JSON.parse(saved)

    nameInput.value =
    data.fullName || nameInput.value

    jobInput.value =
    data.jobTitle || jobInput.value

    summaryInput.value =
    data.summary || summaryInput.value

    skillsInput.value =
    data.skills || skillsInput.value

    experienceInput.value =
    data.experience || experienceInput.value

    educationInput.value =
    data.education || educationInput.value

    if(projectsInput){
      projectsInput.value =
      data.projects || projectsInput.value
    }

    if(certificationsInput){
      certificationsInput.value =
      data.certifications || certificationsInput.value
    }

    localStorage.removeItem(
      "jobready_imported_cv"
    )

    alert("Imported CV loaded into the builder.")
  }catch(error){
    console.error(error)
  }
}

function updatePremiumButtons(){
  improveAiBtn.textContent =
  premiumActive
  ? "✨ Improve with AI"
  : "✨ Improve with AI · Premium"

  humaniseBtn.textContent =
  premiumActive
  ? "🧠 Humanise CV"
  : "🧠 Humanise CV · Premium"

  coverLetterBtn.textContent =
  premiumActive
  ? "Generate Cover Letter"
  : "Generate Cover Letter · Premium"

  advancedScoreBtn.textContent =
  premiumActive
  ? "Advanced CV Score"
  : "Advanced CV Score · Premium"

  downloadPdfBtn.textContent =
  "Download PDF"
}

function updatePreview(){
  renderPreview()
  updateATS()
  updateHealthAndScan()
  updateEliteIntelligence()

  if(spellCheckOutput && spellingScoreOutput){
    runSpellCheck()
  }
}

function updateATS(){
  let score = 40

  if(nameInput.value.trim().length > 2) score += 8
  if(jobInput.value.trim().length > 2) score += 8
  if(summaryInput.value.trim().length > 60) score += 14
  if(skillsInput.value.trim().length > 25) score += 10
  if(experienceInput.value.trim().length > 70) score += 12
  if(educationInput.value.trim().length > 10) score += 6
  if(projectsInput?.value.trim().length > 30) score += 6
  if(certificationsInput?.value.trim().length > 10) score += 4

  const combinedText =
  `${summaryInput.value} ${skillsInput.value} ${experienceInput.value} ${projectsInput?.value || ""}`.toLowerCase()

  const actionWords = [
    "improved",
    "supported",
    "managed",
    "delivered",
    "achieved",
    "assisted",
    "organised",
    "increased",
    "reduced",
    "trained",
    "created",
    "analysed",
    "developed",
    "led"
  ]

  if(actionWords.some(word => combinedText.includes(word))){
    score += 8
  }

  if(/\d/.test(combinedText)){
    score += 6
  }

  score =
  Math.min(score, 100)

  currentAtsScore =
  score

  atsScore.textContent =
  `${score}%`

  if(score >= 85){
    feedback1.textContent = "✓ Strong ATS optimisation"
    feedback2.textContent = "✓ Recruiter-ready structure"
    feedback3.textContent = "✓ CV looks competitive"
  }else if(score >= 65){
    feedback1.textContent = "✓ Good CV structure"
    feedback2.textContent = "⚠ Add stronger action words"
    feedback3.textContent = "⚠ Add measurable achievements"
  }else{
    feedback1.textContent = "⚠ Add more job-specific keywords"
    feedback2.textContent = "⚠ Professional summary needs more detail"
    feedback3.textContent = "⚠ Experience section is too weak"
  }
}

function updateHealthAndScan(){
  const combined =
  getCvText()

  const checks = [
    {
      passed:nameInput.value.trim().length > 2,
      text:"Add your full name."
    },
    {
      passed:jobInput.value.trim().length > 2,
      text:"Add a clear target job title."
    },
    {
      passed:summaryInput.value.trim().length >= 60,
      text:"Write a stronger professional summary."
    },
    {
      passed:getSkillArray().length >= 6,
      text:"Add at least 6 relevant skills."
    },
    {
      passed:experienceInput.value.trim().length >= 80,
      text:"Strengthen your experience section."
    },
    {
      passed:/\d/.test(combined),
      text:"Add measurable results or numbers where truthful."
    },
    {
      passed:["achieved","improved","supported","managed","delivered","created","analysed"].some(word => combined.includes(word)),
      text:"Use stronger action verbs."
    },
    {
      passed:projectsInput?.value.trim().length > 20 || certificationsInput?.value.trim().length > 10,
      text:"Add projects or certifications to improve proof."
    }
  ]

  const passed =
  checks.filter(check => check.passed).length

  const health =
  Math.round((passed / checks.length) * 100)

  cvHealthScore.textContent =
  `${health}%`

  cvHealthBar.style.width =
  `${health}%`

  const fixes =
  checks
  .filter(check => !check.passed)
  .slice(0, 4)

  cvHealthOutput.innerHTML =
  fixes.length === 0
  ? `<p>Strong CV health. Now tailor it to a live job advert.</p>`
  : `
    <ul>
      ${fixes.map(fix => `<li>${safeText(fix.text)}</li>`).join("")}
    </ul>
  `

  let scan = 30

  if(nameInput.value) scan += 10
  if(jobInput.value) scan += 15
  if(summaryInput.value.length > 80) scan += 15
  if(experienceInput.value.length > 100) scan += 15
  if(getSkillArray().length >= 6) scan += 10
  if(projectsInput?.value || certificationsInput?.value) scan += 5

  scan =
  Math.min(scan, 100)

  scanScore.textContent =
  `${scan}%`

  scanBar.style.width =
  `${scan}%`

  const scanItems = [
    nameInput.value ? "Recruiters see your name clearly." : "Your name is missing.",
    jobInput.value ? "Your target role is clear." : "Your target role is unclear.",
    summaryInput.value.length > 80 ? "Your summary gives useful context." : "Your summary may be too light.",
    experienceInput.value.length > 100 ? "Your experience section has enough detail." : "Your experience needs stronger evidence.",
    getSkillArray().length >= 6 ? "Your skills are easy to scan." : "Add more role-specific skills."
  ]

  recruiterScanOutput.innerHTML =
  `
    <ol>
      ${scanItems.map(item => `<li>${safeText(item)}</li>`).join("")}
    </ol>
  `
}
function runRecruiterMode(){
 
}
function analyseJobMatch(){
  const jobDescription =
  jobDescriptionInput.value.toLowerCase().trim()

  const cvText =
  getCvText()

  if(jobDescription.length < 30){
    alert("Paste a full job advert first.")
    return
  }

  analyseJobBtn.textContent =
  "Analysing..."

  analyseJobBtn.classList.add(
    "loading-state"
  )

  let matched = []
  let missing = []

  extractJobKeywords().forEach((keyword)=>{
    if(cvText.includes(keyword)){
      matched.push(keyword)
    }else{
      missing.push(keyword)
    }
  })

  const totalRelevant =
  matched.length + missing.length

  let score =
  totalRelevant > 0
  ? Math.round((matched.length / totalRelevant) * 100)
  : 35

  if(jobInput.value && jobDescription.includes(jobInput.value.toLowerCase())){
    score += 10
  }

  score =
  Math.min(score, 100)

  currentMatchScore =
  score
  currentMatchedKeywords =
  matched.join(", ")
  currentMissingKeywords =
  missing.join(", ")

  matchScore.textContent =
  `${score}%`

  if(score >= 80){
    recruiterInsight.textContent =
    "Strong match. Your CV is aligned with this job advert and likely passes basic keyword screening."
  }else if(score >= 55){
    recruiterInsight.textContent =
    `Medium match. Add missing keywords naturally: ${currentMissingKeywords || "more job-specific language"}.`
  }else{
    recruiterInsight.textContent =
    "Weak match. Your CV does not currently reflect enough of what this employer is asking for."
  }

  let resultBox =
  document.getElementById("jobMatchResultBox")

  if(!resultBox){
    resultBox =
    document.createElement("div")

    resultBox.id =
    "jobMatchResultBox"

    resultBox.className =
    "panel-card"

    resultBox.style.marginTop =
    "18px"

    analyseJobBtn.after(resultBox)
  }

  resultBox.innerHTML =
  `
    <h3>Job Match Result</h3>

    <p><strong>Match Score:</strong> ${score}%</p>

    <p><strong>Matched Keywords:</strong></p>
    <div class="keyword-chip-row">
      ${
        matched.length
        ? matched.map(keyword => `<span class="keyword-chip matched-keyword">✓ ${safeText(keyword)}</span>`).join("")
        : "<p>No matched keywords found yet.</p>"
      }
    </div>

    <p style="margin-top:14px;"><strong>Missing Keywords:</strong></p>
    <div class="keyword-chip-row">
      ${
        missing.length
        ? missing.map(keyword => `<span class="keyword-chip missing-keyword">+ ${safeText(keyword)}</span>`).join("")
        : "<p>No major missing keywords detected.</p>"
      }
    </div>

    <p style="margin-top:14px;">
      ${safeText(recruiterInsight.textContent)}
    </p>
  `

  updateEliteIntelligence()
  updateHealthAndScan()

  analyseJobBtn.textContent =
  "Analyse Job Match"

  analyseJobBtn.classList.remove(
    "loading-state"
  )

  resultBox.scrollIntoView({
    behavior:"smooth",
    block:"start"
  })
}

async function saveCV(){
  const user =
  await getLoggedInUser()

  const { error } =
  await supabase
  .from("cvs")
  .insert([{
    user_id:user.id,
    title:`${jobInput.value || "Untitled"} CV`,
    full_name:nameInput.value,
    job_title:jobInput.value,
    summary:summaryInput.value,
    skills:skillsInput.value,
    experience:experienceInput.value,
    education:educationInput.value,
    ats_score:currentAtsScore,
    job_description:jobDescriptionInput.value,
    match_score:currentMatchScore,
    missing_keywords:currentMissingKeywords,
    template:currentTemplate
  }])

  if(error){
    console.error(error)
    alert("Error saving CV.")
  }else{
    alert("CV saved successfully!")
  }
}

async function improveWithAI(){
  const user =
  await getLoggedInUser()

  try{
    improveAiBtn.textContent =
    "Improving..."

    improveAiBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/rewrite-cv", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        jobTitle:jobInput.value,
        summary:summaryInput.value,
        skills:skillsInput.value,
        experience:experienceInput.value,
        education:educationInput.value,
        jobDescription:jobDescriptionInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    summaryInput.value =
    data.summary || summaryInput.value

    skillsInput.value =
    data.skills || skillsInput.value

    experienceInput.value =
    data.experience || experienceInput.value

    educationInput.value =
    data.education || educationInput.value

    updatePreview()

    if(jobDescriptionInput.value.trim().length >= 30){
      analyseJobMatch()
    }

    const beforeScore =
currentAtsScore || 0

updatePreview()

const afterScore =
currentAtsScore || beforeScore

const improvement =
afterScore - beforeScore

alert(
`CV fixed successfully.

ATS Before: ${beforeScore}%
ATS After: ${afterScore}%

Improvement: +${improvement}%`
)

  }catch(error){
    console.error(error)
    alert("AI improvement failed. Make sure npm start is running.")
  }finally{
    improveAiBtn.classList.remove("loading-state")
    await refreshPremiumState()
  }
}

async function humaniseCV(){
  const user =
  await getLoggedInUser()

  try{
    humaniseBtn.textContent =
    "Humanising..."

    humaniseBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/humanise-cv", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        summary:summaryInput.value,
        skills:skillsInput.value,
        experience:experienceInput.value,
        education:educationInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    summaryInput.value =
    data.summary || summaryInput.value

    skillsInput.value =
    data.skills || skillsInput.value

    experienceInput.value =
    data.experience || experienceInput.value

    educationInput.value =
    data.education || educationInput.value

    updatePreview()

    alert("CV humanised.")

  }catch(error){
    console.error(error)
    alert("Humaniser failed. Make sure npm start is running.")
  }finally{
    humaniseBtn.classList.remove("loading-state")
    await refreshPremiumState()
  }
}

async function generateCoverLetter(){
  const user =
  await getLoggedInUser()

  try{
    coverLetterBtn.textContent =
    "Generating..."

    coverLetterBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/generate-cover-letter", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        fullName:nameInput.value,
        jobTitle:jobInput.value,
        summary:summaryInput.value,
        skills:skillsInput.value,
        experience:experienceInput.value,
        education:educationInput.value,
        jobDescription:jobDescriptionInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    const { error } =
    await supabase
    .from("cover_letters")
    .insert([{
      user_id:user.id,
      title:`${jobInput.value || "Untitled"} Cover Letter`,
      job_title:jobInput.value,
      company:"",
      content:data.coverLetter
    }])

    if(error){
      console.error(error)
      alert(data.coverLetter)
      return
    }

    const openSaved =
    confirm(
      "Cover letter generated and saved. Open saved cover letters?"
    )

    if(openSaved){
      window.location.href =
      "cover-letters.html"
    }

  }catch(error){
    console.error(error)
    alert("Cover letter generation failed.")
  }finally{
    coverLetterBtn.classList.remove("loading-state")
    await refreshPremiumState()
  }
}

function generateApplicationPackage(){
  applicationPackagePanel.style.display =
  "block"

  const missing =
  currentMissingKeywords ||
  "Paste a job advert and run Job Match first for missing keywords."

  const matched =
  currentMatchedKeywords ||
  "Run Job Match to detect matched keywords."

  applicationPackageOutput.innerHTML =
  `
    <div class="salary-block">
      <h4>Complete Application Kit</h4>

      <ul>
        <li><strong>CV:</strong> Use your selected ${safeText(templateNames[currentTemplate])} template.</li>
        <li><strong>Matched Keywords:</strong> ${safeText(matched)}</li>
        <li><strong>Missing Keywords:</strong> ${safeText(missing)}</li>
        <li><strong>Cover Letter:</strong> Generate a tailored cover letter using this CV and advert.</li>
        <li><strong>Recruiter Message:</strong> Open Recruiter CRM and create outreach for this role.</li>
        <li><strong>Interview Prep:</strong> Practise likely questions in the Interview Simulator.</li>
      </ul>

      <h4>Recommended Application Workflow</h4>

      <ol>
        <li>Fix the missing keywords naturally.</li>
        <li>Run Advanced CV Score.</li>
        <li>Generate and save your cover letter.</li>
        <li>Practise interview questions.</li>
        <li>Track the application in Job Tracker.</li>
      </ol>

      <div class="builder-actions">
        <a href="recruiter-crm.html" class="dashboard-btn">Recruiter Message</a>
        <a href="interview-simulator.html" class="dashboard-btn">Interview Prep</a>
        <a href="job-tracker.html" class="dashboard-btn">Track Application</a>
      </div>
    </div>
  `

  applicationPackagePanel.scrollIntoView({
    behavior:"smooth",
    block:"start"
  })
}

function safeList(items){
  return (items || [])
  .map(item => `<li>${safeText(item)}</li>`)
  .join("")
}

async function advancedCVScore(){
  const user =
  await getLoggedInUser()

  try{
    advancedScoreBtn.textContent =
    "Scoring..."

    advancedScoreBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/advanced-cv-score", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        jobTitle:jobInput.value,
        summary:summaryInput.value,
        skills:skillsInput.value,
        experience:experienceInput.value,
        education:educationInput.value,
        jobDescription:jobDescriptionInput.value
      })
    })

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    advancedScorePanel.style.display =
    "block"

    advancedScoreOutput.innerHTML =
    `
      <div class="insight-panel">
        <div>
          <p class="insight-label">ATS</p>
          <h2>${data.atsScore || 0}%</h2>
        </div>

        <div>
          <p class="insight-label">Readability</p>
          <h2>${data.recruiterReadability || 0}%</h2>
        </div>

        <div>
          <p class="insight-label">Interview Potential</p>
          <h2>${data.interviewPotential || 0}%</h2>
        </div>
      </div>

      <div class="salary-block">
        <h4>Keyword Strength</h4>
        <p>${data.keywordStrength || 0}%</p>

        <h4>Experience Impact</h4>
        <p>${data.experienceImpact || 0}%</p>

        <h4>Seniority Level</h4>
        <p>${safeText(data.seniorityLevel || "")}</p>

        <h4>Overall Verdict</h4>
        <p>${safeText(data.overallVerdict || "")}</p>

        <h4>Top Strengths</h4>
        <ul>${safeList(data.topStrengths)}</ul>

        <h4>Biggest Weaknesses</h4>
        <ul>${safeList(data.biggestWeaknesses)}</ul>

        <h4>Priority Fixes</h4>
        <ul>${safeList(data.priorityFixes)}</ul>

        <h4>Recruiter Insight</h4>
        <p>${safeText(data.recruiterInsight || "")}</p>
      </div>
    `
  }catch(error){
    console.error(error)
    alert("Advanced CV scoring failed. Make sure npm start is running.")
  }finally{
    advancedScoreBtn.classList.remove("loading-state")
    await refreshPremiumState()
  }
}

function downloadPDF(){
  const fileName =
  `${nameInput.value || "JobReady"}-${jobInput.value || "CV"}.pdf`
  .replace(/\s+/g,"-")

  const options = {
    margin:0.25,
    filename:fileName,
    image:{ type:"jpeg", quality:1 },
    html2canvas:{ scale:2, useCORS:true },
    jsPDF:{ unit:"in", format:"a4", orientation:"portrait" }
  }

  html2pdf()
  .set(options)
  .from(cvPreview)
  .save()
}
function downloadWord(){

  const fileName =
  `${nameInput.value || "JobReady"}-${jobInput.value || "CV"}.doc`
  .replace(/\s+/g,"-")

  const html =
  `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">

    <style>
      body{
        font-family:Arial, sans-serif;
        color:#111827;
        padding:32px;
        line-height:1.6;
      }

      h1,h2,h3,h4{
        color:#111827;
        margin-bottom:8px;
      }

      p{
        margin-bottom:10px;
      }

      section{
        margin-bottom:22px;
      }

      ul{
        padding-left:22px;
      }
    </style>
  </head>

  <body>
    ${cvPreview.innerHTML}
  </body>
  </html>
  `

  const blob =
  new Blob([html], {
    type:"application/msword"
  })

  const link =
  document.createElement("a")

  link.href =
  URL.createObjectURL(blob)

  link.download =
  fileName

  document.body.appendChild(link)

  link.click()

  document.body.removeChild(link)

  URL.revokeObjectURL(link.href)
}

templateButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    applyTemplate(
      button.dataset.template
    )
  })
})

themeButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    applyTheme(
      button.dataset.theme
    )
  })
})

const allTextInputs = [
  nameInput,
  jobInput,
  summaryInput,
  skillsInput,
  experienceInput,
  educationInput,
  projectsInput,
  certificationsInput,
  volunteerInput,
  languagesInput,
  linksInput,
  jobDescriptionInput
].filter(Boolean)

allTextInputs.forEach((input)=>{
  input.addEventListener("input", updatePreview)
})

if(fontSelector){
  fontSelector.addEventListener("change", updateDesign)
  fontSizeSlider.addEventListener("input", updateDesign)
  lineSpacingSlider.addEventListener("input", updateDesign)
  sectionSpacingSlider.addEventListener("input", updateDesign)
  pagePaddingSlider.addEventListener("input", updateDesign)
  headerStyleSelector.addEventListener("change", updateDesign)
}

if(resetDesignBtn){
  resetDesignBtn.addEventListener("click", ()=>{
    designSettings = {
      font:"inter",
      fontSize:16,
      lineSpacing:1.6,
      sectionSpacing:22,
      pagePadding:36,
      headerStyle:"standard"
    }

    saveDesignSettings()
    syncDesignControls()
    updatePreview()
  })
}

analyseJobBtn.addEventListener("click", analyseJobMatch)
saveCvBtn.addEventListener("click", saveCV)
improveAiBtn.addEventListener("click", improveWithAI)
humaniseBtn.addEventListener("click", humaniseCV)
coverLetterBtn.addEventListener("click", generateCoverLetter)
downloadPdfBtn.addEventListener("click", downloadPDF)
advancedScoreBtn.addEventListener("click", advancedCVScore)
if(recruiterModeBtn){
  recruiterModeBtn.addEventListener(
    "click",
    runRecruiterMode
  )
}
if(downloadWordBtn){
  downloadWordBtn.addEventListener("click", downloadWord)
}
if(applicationPackageBtn){
  applicationPackageBtn.addEventListener("click", generateApplicationPackage)
}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

await protectPage()
await refreshPremiumState()
loadDesignSettings()
loadSectionSettings()
syncDesignControls()
renderSectionControls()
createIntelligenceExtras()
createSpellCheckerPanel()
loadImportedCv()
await loadTemplate()
updatePreview()