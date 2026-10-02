import { supabaseUrl, supabaseKey }
from "/js/config.js"

import { createClient }
from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabase =
createClient(
supabaseUrl,
supabaseKey,
{
auth:{
persistSession:true,
autoRefreshToken:true,
detectSessionInUrl:true
}
}
)

export async function getCurrentUser(){

  try{

    const {
      data:{ user }
    } =
    await supabase.auth.getUser()

    return user || null

  }catch(error){

    console.error(
      "User lookup failed:",
      error
    )

    return null
  }
}

/* Call the JobReady API as the signed-in user.
   The server checks this token, so it never has to trust a user ID
   sent in the request body. */
export async function apiFetch(path, options = {}){

  const {
    data:{ session }
  } =
  await supabase.auth.getSession()

  const headers = {
    ...(options.headers || {})
  }

  if(session){
    headers.Authorization =
    `Bearer ${session.access_token}`
  }

  return fetch(path, {
    ...options,
    headers
  })
}

export async function checkPremium(){

  try{

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
    .select("plan,status")
    .eq("user_id", user.id)
    .eq("plan", "premium")
    .in(
      "status",
      ["active","trialing"]
    )
    .maybeSingle()

    if(error){

      console.error(
        "Premium check failed:",
        error
      )

      localStorage.removeItem(
        "jobready_premium"
      )

      return false
    }

    const premium = !!data

    if(premium){

      localStorage.setItem(
        "jobready_premium",
        "true"
      )

    }else{

      localStorage.removeItem(
        "jobready_premium"
      )
    }

    return premium

  }catch(error){

    console.error(
      "Premium validation error:",
      error
    )

    return false
  }
}

export async function isPremium(){
  return await checkPremium()
}

export async function requirePremium(
featureName = "This feature"
){

  const premium =
  await checkPremium()

  if(premium){
    return true
  }

  const upgrade =
  confirm(
`${featureName} is part of JobReady Premium.

Unlock:
• Unlimited AI tools
• Advanced CV scoring
• Resume tailoring
• Salary intelligence
• Career coaching
• Premium templates

Upgrade now?`
  )

  if(upgrade){

    window.location.href =
    "pricing.html"
  }

  return false
}

export async function protectPage(){

  const user =
  await getCurrentUser()

  if(!user){

    window.location.href =
    "login.html"

    return null
  }

  return user
}

export async function syncPremiumUI(){

  const premium =
  await checkPremium()

  document.body.dataset.premium =
  premium
  ? "true"
  : "false"

  return premium
}

export async function signOut(){

  try{

    localStorage.removeItem(
      "jobready_premium"
    )

    await supabase.auth.signOut()

    window.location.href =
    "login.html"

  }catch(error){

    console.error(
      "Sign out failed:",
      error
    )
  }
}
