import {
  apiFetch,
  supabase,
  protectPage,
  checkPremium,
  requirePremium
}
from "/js/premium.js"

const logoutBtn = document.getElementById("logoutBtn")
const jobTitleInput = document.getElementById("jobTitleInput")
const jobDescriptionInput = document.getElementById("jobDescriptionInput")
const cvSummaryInput = document.getElementById("cvSummaryInput")
const generateInterviewBtn = document.getElementById("generateInterviewBtn")
const questionsContainer = document.getElementById("questionsContainer")
const questionInput = document.getElementById("questionInput")
const answerInput = document.getElementById("answerInput")
const analyseAnswerBtn = document.getElementById("analyseAnswerBtn")
const interviewScore = document.getElementById("interviewScore")
const hiringSignal = document.getElementById("hiringSignal")
const wouldProgress = document.getElementById("wouldProgress")
const feedbackContainer = document.getElementById("feedbackContainer")

let premiumActive =
await checkPremium()

function updateButtons(){

  generateInterviewBtn.textContent =
  premiumActive
  ? "Generate Interview Prep"
  : "Generate Interview Prep · Premium"

  analyseAnswerBtn.textContent =
  premiumActive
  ? "Analyse My Answer"
  : "Analyse My Answer · Premium"

}

generateInterviewBtn.addEventListener("click", async ()=>{

  const user =
  await protectPage()

  try{

    generateInterviewBtn.textContent = "Generating..."
    generateInterviewBtn.classList.add("loading-state")

    const response =
    await apiFetch("/api/interview-prep", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        jobTitle:jobTitleInput.value,
        jobDescription:jobDescriptionInput.value,
        cvSummary:cvSummaryInput.value,
        skills:"",
        experience:cvSummaryInput.value
      })
    })

    const data = await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    questionsContainer.innerHTML = ""

    data.questions.forEach((item, index)=>{

      const questionCard =
      document.createElement("div")

      questionCard.className =
      "question-card"

      questionCard.innerHTML =
      `
        <h4>Question ${index + 1}</h4>
        <p><strong>${item.question}</strong></p>

        <p><strong>Why they ask:</strong> ${item.whyTheyAsk}</p>
        <p><strong>Answer strategy:</strong> ${item.answerStrategy}</p>
        <p><strong>Strong example:</strong> ${item.strongExample}</p>

        <button class="small-btn view-btn use-question-btn">
          Practise this question
        </button>
      `

      questionCard
      .querySelector(".use-question-btn")
      .addEventListener("click", ()=>{

        questionInput.value =
        item.question

        window.scrollTo({
          top:0,
          behavior:"smooth"
        })

      })

      questionsContainer.appendChild(questionCard)

    })

    if(data.overallAdvice){

      const advice =
      document.createElement("div")

      advice.className =
      "question-card"

      advice.innerHTML =
      `
        <h4>Overall Interview Advice</h4>
        <p>${data.overallAdvice}</p>
      `

      questionsContainer.appendChild(advice)

    }

  }catch(error){

    console.error(error)
    alert("Interview prep failed. Make sure backend is running.")

  }finally{

    premiumActive =
    await checkPremium()

    updateButtons()

    generateInterviewBtn.classList.remove("loading-state")

  }

})

analyseAnswerBtn.addEventListener("click", async ()=>{

  const user =
  await protectPage()

  try{

    analyseAnswerBtn.textContent = "Analysing..."
    analyseAnswerBtn.classList.add("loading-state")

    const response =
    await apiFetch("/api/interview-feedback", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        userId:user.id,
        jobTitle:jobTitleInput.value,
        question:questionInput.value,
        answer:answerInput.value
      })
    })

    const data = await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    interviewScore.textContent =
    `${data.score}/100`

    hiringSignal.textContent =
    data.hiringSignal || "No signal returned."

    wouldProgress.textContent =
    data.wouldProgress || "-"

    feedbackContainer.innerHTML =
    `
      <div class="question-card">
        <h4>Strengths</h4>
        <p>${data.strengths}</p>

        <h4>Weaknesses</h4>
        <p>${data.weaknesses}</p>

        <h4>Improved Answer</h4>
        <p>${data.improvedAnswer}</p>
      </div>
    `

  }catch(error){

    console.error(error)
    alert("Interview feedback failed. Make sure backend is running.")

  }finally{

    premiumActive =
    await checkPremium()

    updateButtons()

    analyseAnswerBtn.classList.remove("loading-state")

  }

})

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

await protectPage()
updateButtons()