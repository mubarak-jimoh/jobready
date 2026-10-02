import {
  supabase,
  protectPage
}
from "/js/premium.js"

const coverLetterList =
document.getElementById("coverLetterList")

const logoutBtn =
document.getElementById("logoutBtn")

async function loadCoverLetters(){

  const user =
  await protectPage()

  const { data, error } =
  await supabase
  .from("cover_letters")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending:false })

  if(error){
    console.error(error)
    coverLetterList.innerHTML =
    "<p>Failed to load cover letters.</p>"
    return
  }

  if(!data || data.length === 0){
    coverLetterList.innerHTML =
    `
      <div class="cv-card">
        <h2>No cover letters yet</h2>
        <p>Generate a job-specific cover letter from the Builder page.</p>
        <div class="cv-card-actions">
          <a href="builder.html" class="dashboard-btn">Go to Builder</a>
        </div>
      </div>
    `
    return
  }

  coverLetterList.innerHTML = ""

  data.forEach((letter)=>{

    const card =
    document.createElement("div")

    card.className =
    "cv-card"

    card.innerHTML =
    `
      <div class="cv-card-top">
        <div>
          <h3>${letter.title || "Cover Letter"}</h3>
          <p>${letter.job_title || "Job role not provided"}</p>
        </div>

        <div class="cv-score">
          Saved
        </div>
      </div>

      <p class="cover-preview">
        ${(letter.content || "").slice(0, 220)}${letter.content && letter.content.length > 220 ? "..." : ""}
      </p>

      <div class="cv-card-actions">
        <button class="small-btn view-btn view-letter-btn">View</button>
        <button class="small-btn view-btn copy-letter-btn">Copy</button>
        <button class="small-btn danger-btn delete-letter-btn">Delete</button>
      </div>
    `

    card.querySelector(".view-letter-btn")
    .addEventListener("click", ()=>{
      alert(letter.content)
    })

    card.querySelector(".copy-letter-btn")
    .addEventListener("click", async ()=>{
      await navigator.clipboard.writeText(letter.content || "")
      alert("Cover letter copied.")
    })

    card.querySelector(".delete-letter-btn")
    .addEventListener("click", async ()=>{

      const confirmDelete =
      confirm("Delete this cover letter?")

      if(!confirmDelete){
        return
      }

      const { error } =
      await supabase
      .from("cover_letters")
      .delete()
      .eq("id", letter.id)

      if(error){
        console.error(error)
        alert("Failed to delete cover letter.")
        return
      }

      loadCoverLetters()

    })

    coverLetterList.appendChild(card)

  })

}

logoutBtn.addEventListener("click", async ()=>{
  await supabase.auth.signOut()
  window.location.href = "login.html"
})

loadCoverLetters()