import {
  apiFetch,
  supabase,
  protectPage
}
from "/js/premium.js"

const logoutBtn =
document.getElementById("logoutBtn")

const planStatus =
document.getElementById("planStatus")

const planDescription =
document.getElementById("planDescription")

const upgradeBtn =
document.getElementById("upgradeBtn")

const billingBtn =
document.getElementById("billingBtn")

const rewriteUsage =
document.getElementById("rewriteUsage")

const humaniseUsage =
document.getElementById("humaniseUsage")

const coverUsage =
document.getElementById("coverUsage")

const interviewUsage =
document.getElementById("interviewUsage")

const coachUsage =
document.getElementById("coachUsage")

let currentUser = null

function formatUsage(item){

  if(!item){
    return "0/-"
  }

  if(item.limit === "unlimited"){
    return `${item.used}/Unlimited`
  }

  return `${item.used}/${item.limit}`

}

async function loadAccount(){

  try{

    currentUser =
    await protectPage()

    const response =
    await apiFetch("/api/my-usage", {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId:currentUser.id
      })
    })

    const data =
    await response.json()

    if(data.error){
      console.error(data.error)

      planStatus.textContent =
      "Unable to load"

      planDescription.textContent =
      data.error

      return
    }

    if(data.premium){

      planStatus.textContent =
      "Premium"

      planDescription.textContent =
      "Unlimited AI tools, premium templates, advanced scoring, salary intelligence and career coaching."

      upgradeBtn.style.display =
      "none"

      billingBtn.style.display =
      "block"

    }else{

      planStatus.textContent =
      "Free Plan"

      planDescription.textContent =
      "Limited monthly AI usage. Upgrade to unlock unlimited tools and premium templates."

      upgradeBtn.style.display =
      "block"

      billingBtn.style.display =
      "none"

    }

    rewriteUsage.textContent =
    formatUsage(data.usage.rewrite_cv)

    humaniseUsage.textContent =
    formatUsage(data.usage.humanise_cv)

    coverUsage.textContent =
    formatUsage(data.usage.cover_letter)

    interviewUsage.textContent =
    formatUsage(data.usage.interview_prep)

    coachUsage.textContent =
    formatUsage(data.usage.career_coach)

  }catch(error){

    console.error(error)

    planStatus.textContent =
    "Connection error"

    planDescription.textContent =
    "Could not connect to the backend. Make sure npm start is running."

  }

}

upgradeBtn.addEventListener("click", ()=>{
  window.location.href =
  "pricing.html"
})

billingBtn.addEventListener("click", async ()=>{

  if(!currentUser){
    currentUser =
    await protectPage()
  }

  try{

    billingBtn.textContent =
    "Opening Billing..."

    billingBtn.classList.add(
      "loading-state"
    )

    const response =
    await apiFetch("/api/create-billing-portal-session",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          userId:currentUser.id
        })
      }
    )

    const data =
    await response.json()

    if(data.error){
      alert(data.error)
      return
    }

    window.location.href =
    data.url

  }catch(error){

    console.error(error)

    alert(
      "Billing portal failed. Make sure backend is running."
    )

  }finally{

    billingBtn.textContent =
    "Manage Billing"

    billingBtn.classList.remove(
      "loading-state"
    )

  }

})

logoutBtn.addEventListener("click", async ()=>{

  await supabase.auth.signOut()

  window.location.href =
  "login.html"

})

await loadAccount()