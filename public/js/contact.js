const contactForm =
document.getElementById("contactForm")

// The form is not connected to an inbox yet, so say so honestly
// instead of pretending the message was sent.
contactForm.addEventListener("submit", (event)=>{
  event.preventDefault()

  alert("This form is not connected to an inbox yet.")
})
