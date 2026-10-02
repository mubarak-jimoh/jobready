const resourcesGrid =
document.getElementById("resourcesGrid")

const resourceSearchInput =
document.getElementById("resourceSearchInput")

const filterButtons =
document.querySelectorAll(".template-filter")

const resourceReaderPanel =
document.getElementById("resourceReaderPanel")

const readerTitle =
document.getElementById("readerTitle")

const readerSubtitle =
document.getElementById("readerSubtitle")

const readerContent =
document.getElementById("readerContent")

const copyGuideBtn =
document.getElementById("copyGuideBtn")

const featuredGuideBtns =
document.querySelectorAll(".featured-guide-btn")

let activeFilter =
"all"

let selectedGuideText =
""

const guides = [
  {
    id:"cv-mistakes",
    title:"Why Your CV Is Not Getting Interviews",
    category:"cv job-search ats",
    readTime:"7 min read",
    level:"Essential",
    summary:"A recruiter-style breakdown of the most common CV problems stopping candidates from getting interviews.",
    content:`
# Why Your CV Is Not Getting Interviews

Most CVs fail because they are not specific enough. Recruiters do not spend long trying to understand your value. Your CV needs to make the target role, relevant skills and evidence clear within seconds.

## 1. Your CV is too generic

A weak CV says things like:

- hardworking
- motivated
- good team player
- excellent communication

Those are not bad qualities, but they are too common. A stronger CV connects your skills to the role.

Instead of:

"I am a hardworking individual looking for an opportunity."

Use:

"Customer-focused candidate with experience supporting busy service environments, handling enquiries and working reliably as part of a team."

## 2. You are missing role keywords

If the job advert mentions Excel, customer service, stock control, admin, SQL, safeguarding or stakeholder communication, your CV should naturally include the relevant terms.

Do not keyword-stuff. Use the words properly in your summary, skills and experience.

## 3. Your experience has no impact

Weak bullet:

"Worked in a shop."

Stronger bullet:

"Supported customers during busy trading periods, answered product queries and helped maintain organised stock presentation."

Best bullet:

"Served 50+ customers per shift while maintaining accurate transactions, professional service and strong store standards."

## 4. Your CV is hard to scan

Recruiters prefer:

- clear headings
- short sections
- bullet points
- consistent spacing
- readable fonts
- no huge paragraphs

If your CV feels tiring to read, it loses.

## 5. You are not tailoring it

A CV for retail should not look the same as a CV for data, finance, admin or software. The structure can stay similar, but the keywords and achievements should change.

## Quick Fix Checklist

- Add the target job title near the top.
- Rewrite your summary for the role.
- Add 8-12 relevant skills.
- Turn duties into achievements.
- Add numbers where truthful.
- Keep the layout clean and recruiter-friendly.
- Paste the job advert into JobReady and tailor your CV before applying.
`
  },
  {
    id:"ats-guide",
    title:"How To Beat ATS Systems Without Ruining Your CV",
    category:"cv ats job-search",
    readTime:"6 min read",
    level:"CV Strategy",
    summary:"Learn how applicant tracking systems work and how to optimise your CV without making it robotic.",
    content:`
# How To Beat ATS Systems Without Ruining Your CV

ATS systems scan CVs for structure, keywords and relevance. But humans still make hiring decisions. Your goal is to satisfy both.

## What ATS systems usually look for

- job title match
- relevant skills
- qualifications
- years or type of experience
- keywords from the advert
- clean formatting

## What to avoid

- text inside images
- complicated tables
- unreadable fonts
- random icons replacing headings
- keyword stuffing
- fake claims

## Best ATS-safe structure

Use simple sections:

1. Name and target role
2. Professional summary
3. Core skills
4. Experience
5. Education
6. Projects or certifications

## Keyword method

Take the job advert and highlight:

- tools
- duties
- soft skills
- qualifications
- industry terms

Then add the truthful ones into your CV.

## Example

If the job advert says:

"Customer service, cash handling, stock rotation, teamwork"

Your CV should include those exact phrases if they are true.

## Final rule

ATS gets your CV seen. Recruiter readability gets you shortlisted.
`
  },
  {
    id:"interview-star",
    title:"How To Answer Interview Questions Using STAR",
    category:"interview",
    readTime:"5 min read",
    level:"Interview Prep",
    summary:"A simple structure for giving clear interview answers that sound confident and evidence-based.",
    content:`
# How To Answer Interview Questions Using STAR

STAR stands for:

- Situation
- Task
- Action
- Result

It helps you answer competency questions clearly.

## Example question

"Tell me about a time you worked in a team."

## Weak answer

"I work well in teams and like helping people."

## Strong STAR answer

**Situation:** During a group project at college, my team had to complete a presentation under a short deadline.

**Task:** I was responsible for organising the research and helping the group stay on track.

**Action:** I split the work into sections, checked progress with each person and helped combine the final slides.

**Result:** We finished before the deadline and delivered a clear presentation that received positive feedback.

## What recruiters want

They want evidence. Not just claims.

## STAR checklist

- Keep it relevant.
- Explain what you personally did.
- Include a result.
- Do not ramble.
- Practise out loud.
`
  },
  {
    id:"apprenticeship-guide",
    title:"How To Get An Apprenticeship In The UK",
    category:"apprenticeship job-search",
    readTime:"8 min read",
    level:"Students",
    summary:"A practical guide for finding apprenticeships, applying properly and standing out without lots of experience.",
    content:`
# How To Get An Apprenticeship In The UK

Apprenticeships are competitive, but you can stand out with the right preparation.

## Where to search

Use:

- GOV.UK Find an Apprenticeship
- UCAS Apprenticeships
- GetMyFirstJob
- company career pages
- local council and NHS career pages
- LinkedIn jobs

## What employers look for

For early-career apprenticeships, employers often care about:

- reliability
- willingness to learn
- communication
- basic organisation
- interest in the industry
- evidence of effort

## What to put on your CV

Even without experience, include:

- school projects
- volunteering
- part-time work
- coursework
- online learning
- personal projects
- clubs or responsibilities

## How to stand out

- Tailor your CV to each apprenticeship.
- Mention why that industry interests you.
- Show proof you have researched the company.
- Practise interview answers.
- Message recruiters politely if appropriate.

## Application checklist

- Create a clean apprenticeship CV.
- Prepare a short cover letter.
- Track every application.
- Follow up professionally.
- Practise common interview questions.
`
  },
  {
    id:"linkedin-headline",
    title:"LinkedIn Headline Examples That Recruiters Understand",
    category:"linkedin job-search",
    readTime:"5 min read",
    level:"LinkedIn",
    summary:"Improve your LinkedIn headline so recruiters instantly understand your target role and strengths.",
    content:`
# LinkedIn Headline Examples That Recruiters Understand

Your headline should make your direction clear.

## Weak headline

"Student looking for opportunities"

## Stronger headline

"Business Student | Aspiring Data Analyst | Excel, SQL & Power BI Projects"

## Formula

Current identity + target role + useful skills

## Examples

**Data:**
"Junior Data Analyst | Excel, SQL & Power BI | Turning Data Into Insights"

**Cybersecurity:**
"Cybersecurity Student | Networking, Linux & Security Fundamentals | Seeking Apprenticeship"

**Retail:**
"Customer Service Assistant | Retail, Communication & Teamwork | Reliable Frontline Support"

**Marketing:**
"Marketing Graduate | Content Creation, Social Media & Campaign Support"

## Tips

- Do not overclaim.
- Include your target role.
- Add 2-4 relevant skills.
- Keep it clear and searchable.
`
  },
  {
    id:"salary-growth",
    title:"How To Increase Your Salary Faster",
    category:"salary job-search career",
    readTime:"7 min read",
    level:"Career Growth",
    summary:"A clear framework for moving from low-paid roles into higher-value skills and better opportunities.",
    content:`
# How To Increase Your Salary Faster

Salary growth usually comes from increasing your market value.

## 1. Choose a direction

Do not only say "I want more money." Choose a role path:

- data analyst
- software engineer
- cybersecurity analyst
- finance analyst
- project coordinator
- digital marketer
- operations manager

## 2. Learn higher-value skills

Examples:

- Excel to Power BI
- basic IT to cybersecurity
- admin to project coordination
- customer service to sales/account management
- HTML/CSS to JavaScript and React

## 3. Build evidence

Employers pay more when you can prove value.

Build:

- projects
- certifications
- case studies
- dashboards
- portfolios
- before/after examples

## 4. Apply before you feel perfect

Many people wait too long. Once your CV, LinkedIn and projects are strong enough, start applying.

## 5. Track your numbers

Track:

- applications sent
- replies
- interviews
- offers
- salary ranges

If you are getting no replies, fix the CV. If you are getting interviews but no offers, fix interview performance.
`
  },
  {
    id:"cover-letter-guide",
    title:"How To Write A Cover Letter That Does Not Sound Generic",
    category:"cv job-search",
    readTime:"6 min read",
    level:"Applications",
    summary:"Write cover letters that sound specific, professional and useful instead of copied from the internet.",
    content:`
# How To Write A Cover Letter That Does Not Sound Generic

A strong cover letter connects you to the role quickly.

## Structure

1. Say what role you are applying for.
2. Explain why the company or role interests you.
3. Match your skills to the job advert.
4. Give 1-2 evidence points.
5. End politely and confidently.

## Avoid

- "I am writing to express my sincere interest..."
- long paragraphs
- fake passion
- repeating your whole CV
- sounding desperate

## Strong opening

"I am applying for the Customer Service Assistant role because I have experience supporting customers in busy environments and enjoy helping people solve problems clearly and professionally."

## Best tip

Use the job advert. Match the employer's needs directly.
`
  },
  {
    id:"first-job",
    title:"How To Get Your First Job With No Experience",
    category:"job-search apprenticeship customer graduate",
    readTime:"7 min read",
    level:"Beginner",
    summary:"A practical guide for building evidence when you do not yet have formal work experience.",
    content:`
# How To Get Your First Job With No Experience

No experience does not mean no value.

## What you can use instead

- school projects
- volunteering
- family responsibilities
- sports teams
- clubs
- online courses
- personal projects
- part-time informal work

## Skills employers still value

- reliability
- communication
- teamwork
- time management
- willingness to learn
- basic digital skills
- customer service attitude

## CV structure

1. Profile
2. Key skills
3. Education
4. Projects / volunteering / responsibilities
5. Work experience if any

## How to stand out

- Apply consistently.
- Tailor your CV.
- Practise interview questions.
- Follow up politely.
- Build small proof of skill.

## Final advice

Your first job is about proving attitude and reliability. Make that obvious.
`
  }
]

function safeText(text){
  return String(text || "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
}

function markdownToHtml(markdown){
  let html =
  safeText(markdown)

  html = html.replace(/^# (.*)$/gm, "<h1>$1</h1>")
  html = html.replace(/^## (.*)$/gm, "<h2>$1</h2>")
  html = html.replace(/^### (.*)$/gm, "<h3>$1</h3>")
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/^- (.*)$/gm, "<li>$1</li>")
  html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
  html = html.replace(/\n\n/g, "</p><p>")
  html = `<p>${html}</p>`
  html = html.replace(/<p><h/g, "<h")
  html = html.replace(/<\/h([1-3])><\/p>/g, "</h$1>")
  html = html.replace(/<p><ul>/g, "<ul>")
  html = html.replace(/<\/ul><\/p>/g, "</ul>")

  return html
}

function renderGuides(){
  const query =
  resourceSearchInput.value.toLowerCase().trim()

  resourcesGrid.innerHTML =
  ""

  const filtered =
  guides.filter((guide)=>{
    const searchable =
    `${guide.title} ${guide.category} ${guide.summary} ${guide.level}`.toLowerCase()

    const matchesFilter =
    activeFilter === "all" ||
    searchable.includes(activeFilter)

    const matchesSearch =
    !query ||
    searchable.includes(query)

    return matchesFilter && matchesSearch
  })

  if(filtered.length === 0){
    resourcesGrid.innerHTML =
    `<div class="panel-card"><p>No guides found.</p></div>`
    return
  }

  filtered.forEach((guide)=>{

    const card =
    document.createElement("div")

    card.className =
    "cv-card resource-card"

    card.innerHTML =
    `
      <div class="resource-card-top">
        <div class="template-badge premium-badge">${safeText(guide.level)}</div>
        <span>${safeText(guide.readTime)}</span>
      </div>

      <h2>${safeText(guide.title)}</h2>
      <p>${safeText(guide.summary)}</p>

      <div class="template-meta-row">
        ${guide.category.split(" ").slice(0,3).map(item => `<span>${safeText(item)}</span>`).join("")}
      </div>

      <button class="generate-btn">Read Guide</button>
    `

    card.querySelector("button").addEventListener("click", ()=>{
      openGuide(guide.id)
    })

    resourcesGrid.appendChild(card)

  })
}

function openGuide(id){
  const guide =
  guides.find(item => item.id === id)

  if(!guide){
    return
  }

  selectedGuideText =
  guide.content

  resourceReaderPanel.style.display =
  "block"

  readerTitle.textContent =
  guide.title

  readerSubtitle.textContent =
  `${guide.level} · ${guide.readTime}`

  readerContent.innerHTML =
  markdownToHtml(guide.content)

  resourceReaderPanel.scrollIntoView({
    behavior:"smooth",
    block:"start"
  })
}

filterButtons.forEach((button)=>{
  button.addEventListener("click", ()=>{
    filterButtons.forEach(item => item.classList.remove("active-filter"))

    button.classList.add("active-filter")

    activeFilter =
    button.dataset.filter || "all"

    renderGuides()
  })
})

featuredGuideBtns.forEach((button)=>{
  button.addEventListener("click", ()=>{
    openGuide(button.dataset.guide)
  })
})

resourceSearchInput.addEventListener(
  "input",
  renderGuides
)

copyGuideBtn.addEventListener("click", async ()=>{
  await navigator.clipboard.writeText(
    selectedGuideText || readerContent.innerText
  )

  copyGuideBtn.textContent =
  "Copied!"

  setTimeout(()=>{
    copyGuideBtn.textContent =
    "Copy Guide"
  }, 1500)
})

renderGuides()