const examplesGrid =
document.getElementById("examplesGrid")

const exampleSearchInput =
document.getElementById("exampleSearchInput")

const filterButtons =
document.querySelectorAll(".template-filter")

const examplePreviewPanel =
document.getElementById("examplePreviewPanel")

const previewTitle =
document.getElementById("previewTitle")

const previewSubtitle =
document.getElementById("previewSubtitle")

const exampleCvDocument =
document.getElementById("exampleCvDocument")

const recruiterNotes =
document.getElementById("recruiterNotes")

const keywordChips =
document.getElementById("keywordChips")

const recommendedTemplate =
document.getElementById("recommendedTemplate")

const standoutTips =
document.getElementById("standoutTips")

const useExampleBtn =
document.getElementById("useExampleBtn")

const copyExampleBtn =
document.getElementById("copyExampleBtn")

const showBestExampleBtn =
document.getElementById("showBestExampleBtn")

let activeFilter =
"all"

let selectedExample =
null

const examples = [
  {
    id:"data-analyst",
    title:"Data Analyst CV Example",
    category:"tech business graduate",
    level:"Graduate / Junior",
    role:"Junior Data Analyst",
    ats:91,
    template:"Finance Elite",
    templateKey:"finance",
    summary:"Analytical and detail-focused junior data analyst with experience using Excel, SQL and Power BI to clean data, identify trends and support better business decisions.",
    skills:"Excel, SQL, Power BI, data cleaning, dashboard reporting, communication, attention to detail, problem solving",
    experience:"Data Analytics Project\n- Cleaned and analysed a sample sales dataset using Excel and SQL.\n- Built a Power BI dashboard to show revenue, customer trends and product performance.\n- Presented insights clearly with recommendations for improving reporting accuracy.",
    education:"Level 3 qualification / A Levels / relevant online data analytics training.",
    notes:[
      "Strong because it shows tools, projects and business impact.",
      "Good for entry-level users without years of experience.",
      "The project section gives the recruiter evidence instead of vague claims."
    ],
    tips:[
      "Add a dashboard link if you have one.",
      "Mention the size of the dataset if truthful.",
      "Use job advert keywords such as SQL, reporting and stakeholder."
    ],
    keywords:["Excel","SQL","Power BI","dashboard","analysis","reporting","data cleaning"]
  },
  {
    id:"software-engineer",
    title:"Software Engineer CV Example",
    category:"tech graduate",
    level:"Junior",
    role:"Junior Software Engineer",
    ats:89,
    template:"Silicon Dark",
    templateKey:"silicon",
    summary:"Motivated junior software engineer with practical experience building responsive web applications using JavaScript, HTML, CSS and backend APIs. Strong interest in clean code, problem solving and continuous learning.",
    skills:"JavaScript, HTML, CSS, Git, APIs, React basics, debugging, problem solving, responsive design",
    experience:"Portfolio Project\n- Built a responsive web application with authentication, dashboard pages and reusable components.\n- Used JavaScript to manage user interactions and dynamic page updates.\n- Improved layout consistency and user experience through structured CSS and testing.",
    education:"Computer Science course, software development bootcamp or self-directed learning portfolio.",
    notes:[
      "Shows projects clearly instead of only listing tools.",
      "Good for junior developers and career switchers.",
      "Mentions Git, APIs and debugging, which recruiters expect."
    ],
    tips:[
      "Add GitHub and live project links.",
      "Mention specific features you built.",
      "Add testing, accessibility or performance improvements if you did them."
    ],
    keywords:["JavaScript","Git","API","React","debugging","responsive design","portfolio"]
  },
  {
    id:"cybersecurity",
    title:"Cybersecurity CV Example",
    category:"tech apprenticeship graduate",
    level:"Entry-level",
    role:"Cybersecurity Analyst",
    ats:88,
    template:"Silicon Dark",
    templateKey:"silicon",
    summary:"Entry-level cybersecurity candidate with a strong interest in network security, threat awareness and risk reduction. Developing practical knowledge of security principles, incident response and system monitoring.",
    skills:"Cybersecurity fundamentals, networking, risk awareness, Linux basics, incident response, communication, problem solving",
    experience:"Cybersecurity Learning Project\n- Completed practical labs covering basic network security, password safety and threat detection concepts.\n- Researched common phishing techniques and produced user awareness guidance.\n- Built understanding of confidentiality, integrity and availability principles.",
    education:"Cybersecurity course, CompTIA preparation, IT qualification or relevant self-study.",
    notes:[
      "Works well for apprenticeships and junior cyber applications.",
      "Shows awareness of real security principles.",
      "Can be strengthened by adding labs, certifications or TryHackMe projects."
    ],
    tips:[
      "Add lab platforms, certifications or cyber projects.",
      "Mention security principles and practical tools.",
      "Avoid exaggerating experience; show learning evidence."
    ],
    keywords:["networking","risk","incident response","Linux","phishing","security","CIA triad"]
  },
  {
    id:"retail-assistant",
    title:"Retail Assistant CV Example",
    category:"customer apprenticeship",
    level:"Entry-level",
    role:"Retail Assistant",
    ats:86,
    template:"Modern Pro",
    templateKey:"modern",
    summary:"Reliable and customer-focused retail candidate with strong communication, teamwork and organisation skills. Confident supporting customers, handling busy environments and maintaining a positive store experience.",
    skills:"Customer service, teamwork, communication, cash handling, stock control, reliability, time management, problem solving",
    experience:"Retail / Customer Service Experience\n- Supported customers with product queries and helped create a positive shopping experience.\n- Worked as part of a team during busy periods while staying organised and reliable.\n- Assisted with stock presentation, store standards and daily operational tasks.",
    education:"GCSEs, college course or relevant school qualifications.",
    notes:[
      "Clear and practical for entry-level retail applications.",
      "Uses keywords employers expect in retail roles.",
      "Can be improved with numbers such as customers served or sales targets."
    ],
    tips:[
      "Add examples of busy shifts, customer support or stock work.",
      "Mention punctuality and reliability.",
      "Use numbers where truthful, such as customers helped or tills balanced."
    ],
    keywords:["customer service","cash handling","stock","teamwork","reliability","communication"]
  },
  {
    id:"finance-graduate",
    title:"Finance Graduate CV Example",
    category:"business graduate finance",
    level:"Graduate",
    role:"Finance Graduate",
    ats:90,
    template:"Finance Elite",
    templateKey:"finance",
    summary:"Detail-oriented finance graduate with strong numerical ability, commercial awareness and interest in financial analysis. Confident working with spreadsheets, reporting information clearly and learning fast in professional environments.",
    skills:"Excel, financial analysis, numeracy, commercial awareness, reporting, attention to detail, communication",
    experience:"Finance Project\n- Analysed sample financial data to identify cost trends and performance changes.\n- Built spreadsheet models to compare income, expenses and projected outcomes.\n- Summarised findings clearly for a non-technical audience.",
    education:"Finance, Business, Economics or Accounting degree / A Levels.",
    notes:[
      "Strong for finance, accounting and graduate scheme applications.",
      "Shows commercial thinking and reporting skills.",
      "Best improved with internships, societies or finance-related projects."
    ],
    tips:[
      "Mention Excel formulas, models or reporting outputs.",
      "Add commercial awareness examples.",
      "Include internships, societies or finance competitions."
    ],
    keywords:["Excel","financial analysis","commercial awareness","reporting","numeracy"]
  },
  {
    id:"nhs-admin",
    title:"NHS Admin CV Example",
    category:"healthcare business customer",
    level:"Entry-level / Experienced",
    role:"NHS Administrator",
    ats:87,
    template:"Corporate Pro",
    templateKey:"corporate",
    summary:"Organised and professional administrator with strong communication, attention to detail and data entry skills. Confident handling information accurately and supporting smooth service delivery in busy environments.",
    skills:"Administration, data entry, confidentiality, Microsoft Office, communication, organisation, attention to detail, customer service",
    experience:"Administrative Experience\n- Managed information accurately while maintaining confidentiality and professionalism.\n- Communicated clearly with colleagues, customers or service users.\n- Supported daily admin tasks including document handling, scheduling and record updates.",
    education:"GCSEs, college qualification, business administration training or relevant experience.",
    notes:[
      "Good for NHS admin, reception and office support roles.",
      "Confidentiality and accuracy are important keywords.",
      "Can be strengthened by adding systems used and examples of workload."
    ],
    tips:[
      "Mention confidentiality, accuracy and record keeping.",
      "Add systems used if you know them.",
      "Show calm communication in busy environments."
    ],
    keywords:["administration","data entry","confidentiality","Microsoft Office","records","communication"]
  },
  {
    id:"apprenticeship",
    title:"Apprenticeship CV Example",
    category:"apprenticeship graduate customer",
    level:"Beginner",
    role:"Business Administration Apprentice",
    ats:85,
    template:"Graduate Plus",
    templateKey:"graduate",
    summary:"Motivated apprenticeship candidate with strong willingness to learn, good communication skills and a reliable approach to work. Interested in developing professional skills while contributing positively to an employer.",
    skills:"Communication, teamwork, organisation, reliability, Microsoft Office, willingness to learn, time management",
    experience:"School / Volunteering / Part-Time Experience\n- Developed teamwork and communication skills through school projects, volunteering or part-time work.\n- Managed responsibilities reliably and completed tasks on time.\n- Demonstrated motivation to learn new skills and improve professionally.",
    education:"GCSEs or current college studies.",
    notes:[
      "Perfect for candidates with limited experience.",
      "Focuses on attitude, reliability and learning potential.",
      "Should be tailored to each apprenticeship standard."
    ],
    tips:[
      "Mention why you want the apprenticeship.",
      "Use school, volunteering or part-time experience as proof.",
      "Show reliability, learning attitude and communication."
    ],
    keywords:["apprenticeship","willingness to learn","communication","teamwork","organisation"]
  },
  {
    id:"marketing",
    title:"Marketing CV Example",
    category:"creative business graduate",
    level:"Junior",
    role:"Marketing Assistant",
    ats:88,
    template:"Creative Edge",
    templateKey:"creative",
    summary:"Creative and organised marketing candidate with interest in content creation, social media, campaign support and brand communication. Confident writing clearly and using digital platforms to engage audiences.",
    skills:"Social media, content creation, Canva, copywriting, communication, organisation, campaign support, creativity",
    experience:"Marketing Project\n- Created sample social media content for a brand campaign across multiple platforms.\n- Used Canva to design simple visual assets aligned with brand style.\n- Reviewed engagement data to understand what content performed best.",
    education:"Marketing, business, media qualification or relevant self-directed projects.",
    notes:[
      "Good for marketing assistant and content roles.",
      "Shows creative output and basic performance thinking.",
      "Can be improved with portfolio links and campaign results."
    ],
    tips:[
      "Add portfolio links or social media examples.",
      "Mention campaigns, content and audience results.",
      "Use keywords such as SEO, Canva, analytics or copywriting when relevant."
    ],
    keywords:["social media","content","Canva","campaign","copywriting","brand"]
  }
]

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function exampleAsText(example){
  return `
${example.title}

Target Role:
${example.role}

Professional Summary:
${example.summary}

Core Skills:
${example.skills}

Experience:
${example.experience}

Education:
${example.education}

ATS Keywords:
${example.keywords.join(", ")}

Recruiter Notes:
${example.notes.join("\n")}
`.trim()
}

function getFilteredExamples(){
  const query =
  exampleSearchInput.value.toLowerCase().trim()

  return examples.filter((example)=>{
    const searchable =
    `${example.title} ${example.category} ${example.role} ${example.skills} ${example.level} ${example.keywords.join(" ")}`.toLowerCase()

    const matchesFilter =
    activeFilter === "all" ||
    searchable.includes(activeFilter)

    const matchesSearch =
    !query ||
    searchable.includes(query)

    return matchesFilter && matchesSearch
  })
}

function renderCards(){
  examplesGrid.innerHTML =
  ""

  const filtered =
  getFilteredExamples()

  if(filtered.length === 0){
    examplesGrid.innerHTML =
    `<div class="panel-card"><p>No examples found. Try another role or filter.</p></div>`
    return
  }

  filtered.forEach((example)=>{
    const card =
    document.createElement("div")

    card.className =
    "cv-card example-card"

    card.innerHTML =
    `
      <div class="cv-score">${example.ats}% ATS</div>

      <div class="example-mini-document">
        <h3>${safeText(example.role)}</h3>
        <span>${safeText(example.template)}</span>
        <div></div><div></div><div></div>
      </div>

      <p class="insight-label">${safeText(example.level)}</p>

      <h2>${safeText(example.title)}</h2>
      <p>${safeText(example.summary)}</p>

      <div class="template-meta-row">
        ${example.keywords.slice(0,3).map(keyword => `<span>${safeText(keyword)}</span>`).join("")}
      </div>

      <button class="generate-btn">View Example</button>
    `

    card.querySelector("button").addEventListener("click", ()=>{
      selectExample(example)
    })

    examplesGrid.appendChild(card)
  })
}

function selectExample(example){
  selectedExample =
  example

  examplePreviewPanel.style.display =
  "block"

  previewTitle.textContent =
  example.title

  previewSubtitle.textContent =
  `${example.role} · ${example.ats}% ATS example · Best with ${example.template}`

  recommendedTemplate.textContent =
  example.template

  exampleCvDocument.innerHTML =
  `
    <div class="example-doc-header">
      <h1>Your Name</h1>
      <span>${safeText(example.role)}</span>
    </div>

    <section>
      <h3>Professional Summary</h3>
      <p>${safeText(example.summary)}</p>
    </section>

    <section>
      <h3>Core Skills</h3>
      <p>${safeText(example.skills)}</p>
    </section>

    <section>
      <h3>Experience</h3>
      <p>${safeText(example.experience).replace(/\n/g, "<br>")}</p>
    </section>

    <section>
      <h3>Education</h3>
      <p>${safeText(example.education)}</p>
    </section>
  `

  recruiterNotes.innerHTML =
  `
    <ul>
      ${example.notes.map(note => `<li>${safeText(note)}</li>`).join("")}
    </ul>
  `

  keywordChips.innerHTML =
  example.keywords
  .map(keyword => `<span class="keyword-chip">${safeText(keyword)}</span>`)
  .join("")

  standoutTips.innerHTML =
  `
    <ul>
      ${example.tips.map(tip => `<li>${safeText(tip)}</li>`).join("")}
    </ul>
  `

  examplePreviewPanel.scrollIntoView({
    behavior:"smooth",
    block:"start"
  })
}

function useExample(){
  if(!selectedExample){
    alert("Choose an example first.")
    return
  }

  const payload = {
    fullName:"",
    jobTitle:selectedExample.role,
    summary:selectedExample.summary,
    skills:selectedExample.skills,
    experience:selectedExample.experience,
    education:selectedExample.education
  }

  localStorage.setItem(
    "jobready_imported_cv",
    JSON.stringify(payload)
  )

  localStorage.setItem(
    "jobready_template",
    selectedExample.templateKey
  )

  window.location.href =
  "builder.html"
}

async function copyExample(){
  if(!selectedExample){
    alert("Choose an example first.")
    return
  }

  await navigator.clipboard.writeText(
    exampleAsText(selectedExample)
  )

  copyExampleBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyExampleBtn.textContent =
    "Copy Sections"
  }, 1500)
}

filterButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    filterButtons.forEach(item => item.classList.remove("active-filter"))

    button.classList.add("active-filter")

    activeFilter =
    button.dataset.filter || "all"

    renderCards()
  })
})

exampleSearchInput.addEventListener(
  "input",
  renderCards
)

useExampleBtn.addEventListener(
  "click",
  useExample
)

copyExampleBtn.addEventListener(
  "click",
  copyExample
)

showBestExampleBtn.addEventListener("click", ()=>{
  const filtered =
  getFilteredExamples()

  const best =
  filtered.sort((a,b)=> b.ats - a.ats)[0] ||
  examples[0]

  selectExample(best)
})

renderCards()