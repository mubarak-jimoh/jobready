import {
  checkPremium,
  requirePremium
}
from "/js/premium.js"

const templateGrid =
document.getElementById("templateGrid")

const templateSearchInput =
document.getElementById("templateSearchInput")

const filterButtons =
document.querySelectorAll(".template-filter")

let premiumActive =
await checkPremium()

let activeFilter =
"all"

const templates = [
  {
    key:"modern",
    name:"Modern Pro",
    badge:"Free",
    category:"ats free clean general professional",
    description:"Clean, polished and ATS-safe. Strong for entry-level, admin, retail, customer service and general roles.",
    tags:["ATS-safe","General","Free"],
    preview:"mini-modern",
    buttonClass:"generate-btn"
  },
  {
    key:"graduate",
    name:"Graduate Plus",
    badge:"Free",
    category:"graduate free apprenticeship student internship early career",
    description:"Built for students, apprenticeships, internships and early-career applicants who need to show potential clearly.",
    tags:["Graduate","Projects","Free"],
    preview:"mini-graduate",
    buttonClass:"generate-btn"
  },
  {
    key:"prime-ats",
    name:"Prime ATS",
    badge:"Free",
    category:"ats free clean professional recruiter simple",
    description:"A clean ATS-first layout with strong section hierarchy, ideal for job boards and recruiter systems.",
    tags:["ATS","Clean","Free"],
    preview:"mini-prime-ats",
    buttonClass:"generate-btn"
  },

  {
    key:"silicon",
    name:"Silicon Dark",
    badge:"Premium",
    category:"premium tech software data cyber digital startup",
    description:"Premium tech layout for software, data, cyber, engineering, digital and startup roles.",
    tags:["Tech","Dark","Premium"],
    preview:"mini-tech",
    buttonClass:"ai-btn"
  },
  {
    key:"developer",
    name:"Developer Grid",
    badge:"Premium",
    category:"premium tech software developer engineer portfolio github",
    description:"A developer-focused layout with project emphasis, technical skills and portfolio positioning.",
    tags:["Developer","Projects","Tech"],
    preview:"mini-developer",
    buttonClass:"ai-btn"
  },
  {
    key:"data",
    name:"Data Precision",
    badge:"Premium",
    category:"premium tech data analyst analytics power bi sql dashboard",
    description:"A sharp analytics layout for data analysts, BI analysts and reporting-focused roles.",
    tags:["Data","Analytics","ATS"],
    preview:"mini-data",
    buttonClass:"ai-btn"
  },
  {
    key:"cyber",
    name:"Cyber Sentinel",
    badge:"Premium",
    category:"premium tech cyber cybersecurity security networking",
    description:"Structured for cyber, IT support, networking and security-focused candidates.",
    tags:["Cyber","Security","Tech"],
    preview:"mini-cyber",
    buttonClass:"ai-btn"
  },

  {
    key:"executive",
    name:"Executive Noir",
    badge:"Premium",
    category:"premium executive leadership senior manager consultant",
    description:"Senior, elegant and high-trust. Best for managers, leaders, consultants and experienced professionals.",
    tags:["Executive","Leadership","Premium"],
    preview:"mini-executive",
    buttonClass:"ai-btn"
  },
  {
    key:"boardroom",
    name:"Boardroom Elite",
    badge:"Premium",
    category:"premium executive boardroom director leadership senior",
    description:"A boardroom-level layout for senior leaders, directors and high-responsibility roles.",
    tags:["Director","Senior","Elite"],
    preview:"mini-boardroom",
    buttonClass:"ai-btn"
  },
  {
    key:"consultant",
    name:"Consultant Sharp",
    badge:"Premium",
    category:"premium consulting business strategy corporate executive",
    description:"Clear, analytical and concise for consultants, analysts and strategy professionals.",
    tags:["Consulting","Sharp","Business"],
    preview:"mini-consultant",
    buttonClass:"ai-btn"
  },

  {
    key:"corporate",
    name:"Corporate Pro",
    badge:"Premium",
    category:"premium corporate finance law consulting business operations",
    description:"Sharp and structured for finance, law, consulting, operations, business and professional services.",
    tags:["Corporate","Formal","Premium"],
    preview:"mini-corporate",
    buttonClass:"ai-btn"
  },
  {
    key:"finance",
    name:"Finance Elite",
    badge:"Premium",
    category:"premium finance banking consulting analyst corporate",
    description:"Sharp analyst-style layout for finance, banking, accounting, consulting and business roles.",
    tags:["Finance","Analyst","Premium"],
    preview:"mini-finance",
    buttonClass:"ai-btn"
  },
  {
    key:"legal",
    name:"Legal Counsel",
    badge:"Premium",
    category:"premium law legal corporate professional formal",
    description:"A formal legal-style CV for law, compliance, paralegal and professional services candidates.",
    tags:["Legal","Formal","Corporate"],
    preview:"mini-legal",
    buttonClass:"ai-btn"
  },

  {
    key:"minimal",
    name:"Minimal Elite",
    badge:"Premium",
    category:"premium minimal clean modern simple ats",
    description:"Ultra-clean spacing and strong typography. Best for applicants who want a modern high-end look.",
    tags:["Minimal","Clean","Premium"],
    preview:"mini-minimal",
    buttonClass:"ai-btn"
  },
  {
    key:"pure",
    name:"Pure ATS",
    badge:"Premium",
    category:"premium ats minimal clean simple professional",
    description:"A stripped-back ATS-safe layout for conservative employers and high-volume applications.",
    tags:["ATS","Simple","Safe"],
    preview:"mini-pure",
    buttonClass:"ai-btn"
  },
  {
    key:"classic",
    name:"Classic Serif",
    badge:"Premium",
    category:"premium professional classic traditional ats formal",
    description:"Traditional serif-style layout for professional, academic and formal applications.",
    tags:["Classic","Formal","ATS"],
    preview:"mini-classic",
    buttonClass:"ai-btn"
  },
  {
    key:"oxford",
    name:"Oxford Classic",
    badge:"Premium",
    category:"premium ats academic university professional classic",
    description:"Traditional, structured and serious. Best for academic, formal, professional and trusted applications.",
    tags:["Academic","Classic","ATS"],
    preview:"mini-oxford",
    buttonClass:"ai-btn"
  },

  {
    key:"creative",
    name:"Creative Edge",
    badge:"Premium",
    category:"premium creative marketing design media brand",
    description:"Modern visual layout for marketing, design, content, media and brand-focused roles.",
    tags:["Creative","Marketing","Premium"],
    preview:"mini-creative",
    buttonClass:"ai-btn"
  },
  {
    key:"portfolio",
    name:"Portfolio Bold",
    badge:"Premium",
    category:"premium creative design portfolio media content marketing",
    description:"A visual portfolio-style layout for designers, content creators and creative professionals.",
    tags:["Portfolio","Bold","Creative"],
    preview:"mini-portfolio",
    buttonClass:"ai-btn"
  },
  {
    key:"marketing",
    name:"Marketing Pulse",
    badge:"Premium",
    category:"premium marketing creative social media brand campaigns",
    description:"Built for marketers, social media assistants, brand roles and campaign-focused candidates.",
    tags:["Marketing","Campaigns","Brand"],
    preview:"mini-marketing",
    buttonClass:"ai-btn"
  },

  {
    key:"apprentice",
    name:"Apprentice Start",
    badge:"Premium",
    category:"premium graduate apprenticeship student beginner entry level",
    description:"Designed for apprenticeships, school leavers and users with limited work experience.",
    tags:["Apprentice","Beginner","Student"],
    preview:"mini-apprentice",
    buttonClass:"ai-btn"
  },
  {
    key:"student",
    name:"Student Focus",
    badge:"Premium",
    category:"premium graduate student university internship placement",
    description:"A student-first layout that highlights education, projects, volunteering and potential.",
    tags:["Student","Education","Projects"],
    preview:"mini-student",
    buttonClass:"ai-btn"
  },
  {
    key:"career-switch",
    name:"Career Switch",
    badge:"Premium",
    category:"premium graduate career switch transferable skills professional",
    description:"Built for career changers who need to show transferable skills and practical evidence.",
    tags:["Career switch","Skills","Modern"],
    preview:"mini-career-switch",
    buttonClass:"ai-btn"
  },

  {
    key:"healthcare",
    name:"Healthcare Care",
    badge:"Premium",
    category:"premium healthcare nhs care clinical support",
    description:"Professional layout for healthcare, care assistant, NHS admin and support roles.",
    tags:["Healthcare","NHS","Care"],
    preview:"mini-healthcare",
    buttonClass:"ai-btn"
  },
  {
    key:"nhs",
    name:"NHS Admin",
    badge:"Premium",
    category:"premium healthcare nhs admin administration records",
    description:"Structured for NHS administrator, receptionist, healthcare support and records-based roles.",
    tags:["NHS","Admin","Records"],
    preview:"mini-nhs",
    buttonClass:"ai-btn"
  },

  {
    key:"retail",
    name:"Retail Ready",
    badge:"Premium",
    category:"premium customer retail sales hospitality service",
    description:"Clear layout for retail, hospitality, customer service and sales-focused applications.",
    tags:["Retail","Customer","Sales"],
    preview:"mini-retail",
    buttonClass:"ai-btn"
  },
  {
    key:"sales",
    name:"Sales Impact",
    badge:"Premium",
    category:"premium sales customer business targets account",
    description:"Designed for sales, business development, account management and target-driven roles.",
    tags:["Sales","Targets","Impact"],
    preview:"mini-sales",
    buttonClass:"ai-btn"
  },
  {
    key:"hospitality",
    name:"Hospitality Pro",
    badge:"Premium",
    category:"premium hospitality customer service retail events",
    description:"A friendly professional layout for hospitality, events, front-of-house and service roles.",
    tags:["Hospitality","Service","People"],
    preview:"mini-hospitality",
    buttonClass:"ai-btn"
  },

  {
    key:"international",
    name:"International Clean",
    badge:"Premium",
    category:"premium professional international clean modern ats",
    description:"A universal clean CV layout for broad professional applications across industries.",
    tags:["International","Clean","Professional"],
    preview:"mini-international",
    buttonClass:"ai-btn"
  },
  {
    key:"premium-pro",
    name:"Premium Pro",
    badge:"Premium",
    category:"premium professional modern executive corporate clean",
    description:"A high-end modern template designed to feel polished, confident and commercially strong.",
    tags:["Premium","Modern","Pro"],
    preview:"mini-premium-pro",
    buttonClass:"ai-btn"
  }
]

const premiumTemplates =
templates
.filter(template => template.badge === "Premium")
.map(template => template.key)

const templateNames =
Object.fromEntries(
  templates.map(template => [template.key, template.name])
)

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function renderTemplates(){
  const query =
  templateSearchInput.value.toLowerCase().trim()

  templateGrid.innerHTML =
  ""

  const filtered =
  templates.filter((template)=>{
    const searchable =
    `${template.name} ${template.category} ${template.description} ${template.tags.join(" ")}`.toLowerCase()

    const matchesFilter =
    activeFilter === "all" ||
    searchable.includes(activeFilter)

    const matchesSearch =
    !query ||
    searchable.includes(query)

    return matchesFilter && matchesSearch
  })

  if(filtered.length === 0){
    templateGrid.innerHTML =
    `<div class="panel-card"><p>No templates found. Try another search.</p></div>`
    return
  }

  filtered.forEach((template)=>{
    const card =
    document.createElement("div")

    card.className =
    `cv-card template-choice premium-template-choice ${template.badge === "Premium" ? "premium-template" : ""}`

    card.dataset.template =
    template.key

    card.dataset.category =
    template.category

    card.innerHTML =
    `
      <div class="template-badge ${template.badge === "Premium" ? "premium-badge" : "free-badge"}">
        ${safeText(template.badge)}
      </div>

      <div class="premium-template-preview ${template.preview} premium-mini-preview">
        <div class="mini-header-line"></div>
        <h3>Your Name</h3>
        <span>${safeText(template.name)}</span>
        <div></div><div></div><div></div>
      </div>

      <h2>${safeText(template.name)}</h2>

      <p>${safeText(template.description)}</p>

      <div class="template-meta-row">
        ${template.tags.map(tag => `<span>${safeText(tag)}</span>`).join("")}
      </div>

      <button class="${template.buttonClass} use-template-btn">
        Use ${safeText(template.name)}
      </button>
    `

    card.addEventListener("click", (event)=>{
      if(event.target.tagName.toLowerCase() === "button"){
        return
      }

      setSelectedCard(template.key)
    })

    card
    .querySelector(".use-template-btn")
    .addEventListener("click", async ()=>{
      await chooseTemplate(template.key)
    })

    templateGrid.appendChild(card)
  })

  const savedTemplate =
  localStorage.getItem("jobready_template") ||
  "modern"

  setSelectedCard(savedTemplate)
  updateTemplateButtons()
}

function setSelectedCard(template){
  document.querySelectorAll(".template-choice").forEach((card)=>{
    card.classList.remove("selected-template-card")

    if(card.dataset.template === template){
      card.classList.add("selected-template-card")
    }
  })
}

function updateTemplateButtons(){
  document.querySelectorAll(".template-choice").forEach((card)=>{
    const button =
    card.querySelector(".use-template-btn")

    const template =
    card.dataset.template

    if(!button){
      return
    }

    if(
      premiumTemplates.includes(template) &&
      !premiumActive
    ){
      button.textContent =
      `Unlock ${templateNames[template]}`
    }else{
      button.textContent =
      `Use ${templateNames[template]}`
    }
  })
}

async function chooseTemplate(template){
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

  localStorage.setItem(
    "jobready_template",
    template
  )

  setSelectedCard(
    template
  )

  window.location.href =
  "builder.html"
}

filterButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    filterButtons.forEach(item =>
      item.classList.remove("active-filter")
    )

    button.classList.add("active-filter")

    activeFilter =
    button.dataset.filter || "all"

    renderTemplates()
  })
})

templateSearchInput.addEventListener(
  "input",
  renderTemplates
)

renderTemplates()