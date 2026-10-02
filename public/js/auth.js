import { supabaseUrl, supabaseKey }
from "/js/config.js"

import { createClient }
from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm"

const supabase =
createClient(supabaseUrl, supabaseKey)

/* =========================
   HELPERS
========================= */

function getRedirectUrl(){
  return `${window.location.origin}/pages/dashboard.html`
}

async function continueWithGoogle(button){

  try{

    if(button){
      button.textContent =
      "Redirecting to Google..."

      button.disabled =
      true
    }

    const { error } =
    await supabase.auth.signInWithOAuth({
      provider:"google",
      options:{
        redirectTo:getRedirectUrl()
      }
    })

    if(error){
      alert(error.message)

      if(button){
        button.textContent =
        "Continue with Google"

        button.disabled =
        false
      }
    }

  }catch(error){

    console.error(error)

    alert("Google sign in failed.")

    if(button){
      button.textContent =
      "Continue with Google"

      button.disabled =
      false
    }

  }

}

/* =========================
   GOOGLE AUTH
========================= */

const googleLoginBtn =
document.getElementById("googleLoginBtn")

const googleSignupBtn =
document.getElementById("googleSignupBtn")

if(googleLoginBtn){

  googleLoginBtn.addEventListener("click", async ()=>{
    await continueWithGoogle(googleLoginBtn)
  })

}

if(googleSignupBtn){

  googleSignupBtn.addEventListener("click", async ()=>{
    await continueWithGoogle(googleSignupBtn)
  })

}

/* =========================
   SIGN UP
========================= */

const signupForm =
document.getElementById("signupForm")

if(signupForm){

  signupForm.addEventListener(
    "submit",
    async (e)=>{

      e.preventDefault()

      const email =
      document.getElementById("signupEmail").value.trim()

      const password =
      document.getElementById("signupPassword").value

      if(password.length < 6){
        alert("Password must be at least 6 characters.")
        return
      }

      const button =
      signupForm.querySelector("button[type='submit']")

      if(button){
        button.textContent =
        "Creating account..."

        button.disabled =
        true
      }

      const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options:{
          emailRedirectTo:getRedirectUrl()
        }
      })

      if(error){

        alert(error.message)

        if(button){
          button.textContent =
          "Create Account"

          button.disabled =
          false
        }

      }else{

        alert("Account created successfully! Check your email if confirmation is required.")

        window.location.href =
        "login.html"

      }

    }
  )

}

/* =========================
   LOGIN
========================= */

const loginForm =
document.getElementById("loginForm")

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async (e)=>{

      e.preventDefault()

      const email =
      document.getElementById("loginEmail").value.trim()

      const password =
      document.getElementById("loginPassword").value

      const button =
      loginForm.querySelector("button[type='submit']")

      if(button){
        button.textContent =
        "Logging in..."

        button.disabled =
        true
      }

      const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      })

      if(error){

        alert(error.message)

        if(button){
          button.textContent =
          "Login"

          button.disabled =
          false
        }

      }else{

        window.location.href =
        "dashboard.html"

      }

    }
  )

}