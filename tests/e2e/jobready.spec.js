import { test, expect } from "@playwright/test"

const baseUrl = "http://127.0.0.1:3000"

async function checkPage(browser, path) {
  const page = await browser.newPage()

  await page.goto(`${baseUrl}${path}`, {
    waitUntil: "domcontentloaded"
  })

  await expect(page.locator("body")).toBeVisible()

  await page.close()
}

test("JobReady public pages load without crashing", async ({ browser }) => {
  const pages = [
    "/index.html",
    "/pages/login.html",
    "/pages/signup.html",
    "/pages/pricing.html",
    "/pages/templates.html",
    "/pages/resume-examples.html",
    "/pages/resources.html"
  ]

  for (const path of pages) {
    await checkPage(browser, path)
  }
})

test("JobReady app pages load without crashing", async ({ browser }) => {
  const pages = [
    "/pages/dashboard.html",
    "/pages/builder.html",
    "/pages/my-cvs.html",
    "/pages/resume-upload.html",
    "/pages/resume-tailor.html",
    "/pages/interview-simulator.html",
    "/pages/linkedin-optimiser.html",
    "/pages/pricing.html"
  ]

  for (const path of pages) {
    await checkPage(browser, path)
  }
})