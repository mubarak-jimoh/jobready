const searchInput =
document.getElementById("coverLetterSearchInput")

const cards =
document.querySelectorAll(".cover-template-card")

const filters =
document.querySelectorAll(".template-filter")

let activeFilter =
"all"

function filterCoverLetters(){
  const search =
  String(searchInput.value || "").toLowerCase()

  cards.forEach((card)=>{
    const text =
    card.textContent.toLowerCase()

    const category =
    card.dataset.category || ""

    const matchesSearch =
    text.includes(search)

    const matchesFilter =
    activeFilter === "all" ||
    category.includes(activeFilter) ||
    text.includes(activeFilter)

    card.style.display =
    matchesSearch && matchesFilter
    ? ""
    : "none"
  })
}

searchInput.addEventListener(
  "input",
  filterCoverLetters
)

filters.forEach((button)=>{
  button.addEventListener("click", ()=>{
    filters.forEach(item =>
      item.classList.remove("active-filter")
    )

    button.classList.add("active-filter")

    activeFilter =
    button.dataset.filter

    filterCoverLetters()
  })
})
