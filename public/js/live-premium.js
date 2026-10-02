(function(){

  const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const isSmallDevice =
  window.innerWidth < 768

  if(prefersReducedMotion || isSmallDevice){
    document.documentElement.classList.add(
      "jr-premium-motion-reduced"
    )

    return
  }

  if(document.querySelector(".jr-live-light")){
    return
  }

  const light =
  document.createElement("div")

  light.className =
  "jr-live-light"

  document.body.appendChild(light)

  const aura =
  document.createElement("div")

  aura.className =
  "jr-live-aura"

  document.body.appendChild(aura)

  const glow =
  document.createElement("div")

  glow.className =
  "jr-page-glow"

  document.body.appendChild(glow)

  let mouseX =
  window.innerWidth / 2

  let mouseY =
  window.innerHeight / 2

  let lightX =
  mouseX

  let lightY =
  mouseY

  let auraX =
  mouseX

  let auraY =
  mouseY

  let glowX =
  mouseX

  let glowY =
  mouseY

  let ticking =
  true

  function moveTo(x, y){
    mouseX =
    x

    mouseY =
    y
  }

  window.addEventListener("mousemove", (event)=>{
    moveTo(
      event.clientX,
      event.clientY
    )
  }, {
    passive:true
  })

  window.addEventListener("touchmove", (event)=>{
    const touch =
    event.touches[0]

    if(!touch){
      return
    }

    moveTo(
      touch.clientX,
      touch.clientY
    )
  }, {
    passive:true
  })

  document.addEventListener("visibilitychange", ()=>{
    ticking =
    !document.hidden

    if(ticking){
      animatePremiumLight()
    }
  })

  function animatePremiumLight(){
    if(!ticking){
      return
    }

    lightX +=
    (mouseX - lightX) * 0.32

    lightY +=
    (mouseY - lightY) * 0.32

    auraX +=
    (mouseX - auraX) * 0.075

    auraY +=
    (mouseY - auraY) * 0.075

    glowX +=
    (mouseX - glowX) * 0.025

    glowY +=
    (mouseY - glowY) * 0.025

    light.style.transform =
    `translate3d(${lightX}px, ${lightY}px, 0) translate(-50%, -50%)`

    aura.style.transform =
    `translate3d(${auraX}px, ${auraY}px, 0) translate(-50%, -50%)`

    glow.style.transform =
    `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`

    requestAnimationFrame(
      animatePremiumLight
    )
  }

  window.addEventListener("resize", ()=>{
    mouseX =
    window.innerWidth / 2

    mouseY =
    window.innerHeight / 2
  }, {
    passive:true
  })

  animatePremiumLight()

})()