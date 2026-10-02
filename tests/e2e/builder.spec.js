import { test, expect } from "@playwright/test"

const baseUrl =
"http://127.0.0.1:3000"

test("Builder page either loads form or protects logged-out user", async ({ page }) => {
  await page.goto(`${baseUrl}/pages/builder.html`, {
    waitUntil:"domcontentloaded"
  })

  await page.waitForTimeout(1500)

  const currentUrl =
  page.url()

  if(
    currentUrl.includes("login.html") ||
    currentUrl.includes("signup.html") ||
    currentUrl.includes("index.html")
  ){
    await expect(page).toHaveURL(/login|signup|index/)
    return
  }

  const nameInput =
  page.locator("#nameInput")

  const loginText =
  page.getByText(/login|sign in|start free/i)

  const hasNameInput =
  await nameInput.count()

  if(hasNameInput > 0){
    await expect(nameInput).toBeVisible()
    return
  }

  await expect(loginText.first()).toBeVisible()
})
