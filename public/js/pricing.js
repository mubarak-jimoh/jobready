import { supabaseUrl, supabaseKey }
from "/js/config.js"

import { apiFetch }
from "/js/premium.js"

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase =
createClient(
  supabaseUrl,
  supabaseKey
)

const upgradeButtons =
document.querySelectorAll(".upgrade-button")

const paymentSuccessBox =
document.getElementById("paymentSuccessBox")

const paymentCancelBox =
document.getElementById("paymentCancelBox")

const premiumActiveBox =
document.getElementById("premiumActiveBox")

let isRedirecting =
false

async function getCurrentUser(){

  const {
    data:{ user }
  } =
  await supabase.auth.getUser()

  return user

}

function setUpgradeButtons({
  text,
  disabled = false,
  opacity = "1"
}){

  upgradeButtons.forEach((button)=>{

    button.textContent =
    text

    button.disabled =
    disabled

    button.style.opacity =
    opacity

  })

}

async function checkPremium(){

  const user =
  await getCurrentUser()

  if(!user){
    localStorage.removeItem(
      "jobready_premium"
    )

    return false
  }

  const { data, error } =
  await supabase
  .from("subscriptions")
  .select("*")
  .eq("user_id", user.id)
  .eq("plan", "premium")
  .in("status", ["active", "trialing"])
  .maybeSingle()

  if(error){
    console.error("Premium check failed:", error)

    return localStorage.getItem(
      "jobready_premium"
    ) === "true"
  }

  if(data){
    localStorage.setItem(
      "jobready_premium",
      "true"
    )

    return true
  }

  localStorage.removeItem(
    "jobready_premium"
  )

  return false

}

function showSuccess(){

  if(paymentSuccessBox){
    paymentSuccessBox.style.display =
    "block"
  }

  if(paymentCancelBox){
    paymentCancelBox.style.display =
    "none"
  }

}

function showCancel(){

  if(paymentCancelBox){
    paymentCancelBox.style.display =
    "block"
  }

  if(paymentSuccessBox){
    paymentSuccessBox.style.display =
    "none"
  }

}

async function updatePricingUI(){

  const params =
  new URLSearchParams(
    window.location.search
  )

  if(params.get("success") === "true"){

    localStorage.setItem(
      "jobready_premium",
      "true"
    )

    showSuccess()

  }

  if(params.get("cancelled") === "true" || params.get("canceled") === "true"){

    showCancel()

  }

  const premium =
  await checkPremium()

  if(premium){

    if(premiumActiveBox){
      premiumActiveBox.style.display =
      "block"
    }

    setUpgradeButtons({
      text:"Premium Active",
      disabled:true,
      opacity:"0.75"
    })

    return

  }

  setUpgradeButtons({
    text:"Upgrade to Premium",
    disabled:false,
    opacity:"1"
  })

}

async function startCheckout(){

  if(isRedirecting){
    return
  }

  try{

    const user =
    await getCurrentUser()

    if(!user){

      alert(
        "Please log in before upgrading."
      )

      window.location.href =
      "login.html"

      return

    }

    isRedirecting =
    true

    setUpgradeButtons({
      text:"Redirecting...",
      disabled:true,
      opacity:"0.75"
    })

    const response =
    await apiFetch("/api/create-checkout-session",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          userId:user.id,
          email:user.email
        })
      }
    )

    const data =
    await response.json()

    if(!response.ok || data.error){

      alert(
        data.error || "Could not create checkout session."
      )

      isRedirecting =
      false

      setUpgradeButtons({
        text:"Upgrade to Premium",
        disabled:false,
        opacity:"1"
      })

      return

    }

    if(!data.url){

      alert(
        "Stripe did not return a checkout link."
      )

      isRedirecting =
      false

      setUpgradeButtons({
        text:"Upgrade to Premium",
        disabled:false,
        opacity:"1"
      })

      return

    }

    window.location.href =
    data.url

  }catch(error){

    console.error(error)

    alert(
      "Stripe checkout failed. Make sure your backend is running."
    )

    isRedirecting =
    false

    setUpgradeButtons({
      text:"Upgrade to Premium",
      disabled:false,
      opacity:"1"
    })

  }

}

upgradeButtons.forEach((button)=>{

  button.addEventListener(
    "click",
    startCheckout
  )

})

await updatePricingUI()