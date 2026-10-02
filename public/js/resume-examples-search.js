const exampleSearchInput =
document.getElementById("exampleSearchInput")

const exampleCards =
document.querySelectorAll(".resume-example-card")

const exampleFilters =
document.querySelectorAll(".template-filter")

let activeExampleFilter =
"all"

function filterExamples(){
  const search =
  String(exampleSearchInput.value || "").toLowerCase()

  exampleCards.forEach((card)=>{
    const text =
    card.textContent.toLowerCase()

    const category =
    card.dataset.category || ""

    const matchesSearch =
    text.includes(search)

    const matchesFilter =
    activeExampleFilter === "all" ||
    category.includes(activeExampleFilter) ||
    text.includes(activeExampleFilter)

    card.style.display =
    matchesSearch && matchesFilter
    ? ""
    : "none"
  })
}

exampleSearchInput.addEventListener(
  "input",
  filterExamples
)

exampleFilters.forEach((button)=>{
  button.addEventListener("click", ()=>{
    exampleFilters.forEach(item =>
      item.classList.remove("active-filter")
    )

    button.classList.add("active-filter")

    activeExampleFilter =
    button.dataset.filter

    filterExamples()
  })
})
