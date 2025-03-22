import { test, Page } from "@playwright/test";

import { chromium } from "playwright";

function getDateAndWeekday() {
  const esWeekdayFirstThreeLetters = [
    "dom",
    "lun",
    "mar",
    "mié",
    "jue",
    "vie",
    "sáb",
  ];
  const now = new Date();
  return {
    date: now.getDate() + 1,
    weekday: esWeekdayFirstThreeLetters[(now.getDay() + 1) % 7],
  };
}

async function tryToFindCourt(page: Page, retries = 4) {
  const mappings = {
    4: 4,
    3: 1,
    2: 2,
    1: 3,
  };
  for (let i = retries; i >= 1; i--) {
    try {
      await page
        .getByText(`Cancha ${mappings[retries]}`)
        .click({ timeout: 1500 });
      break;
    } catch (error) {
      continue;
    }
  }
}

test("book my fucking court", async ({ page }) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    geolocation: { latitude: 4.60971, longitude: -74.08175 },
    permissions: ["geolocation"],
  });

  await page.goto("https://www.easycancha.com/profile/countries");
  await page.getByRole("link", { name: "Colombia" }).click();
  await page.getByRole("button", { name: "Ok" }).click();

  await page.goto("https://www.easycancha.com/login");
  await page.getByRole("textbox", { name: "Email" }).click();

  const email = process.env.EMAIL || "";
  const password = process.env.PASSWORD || "";

  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Clave" }).click();
  await page.getByRole("textbox", { name: "Clave" }).fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  await page
    .locator("#book-views div")
    .filter({ hasText: "Deportes Clubes" })
    .locator("div")
    .nth(3)
    .click();
  await page.getByRole("textbox", { name: "Buscar" }).click();
  await page.getByRole("textbox", { name: "Buscar" }).fill("bosque");
  await page.locator("#club-497").getByText("RESERVA AQUI").click();

  const { date, weekday } = getDateAndWeekday();
  await page.getByText(`${date} ${weekday}.`).click();
  await page.getByText("60 min.").click();
  await page.locator("div").filter({ hasText: "9:" }).nth(3).click();
  await page.getByRole("link", { name: "Siguiente" }).click();

  await tryToFindCourt(page);

  await page
    .getByRole("button", { name: "Agregar / Quitar jugadores" })
    .click();
  await page.getByText("Mariana Jaramillo").click();
  await page.getByRole("button", { name: "Seleccionar" }).click();
  await page.getByRole("button", { name: "Reservar" }).click();
  await page
    .getByRole("heading", { name: "¡ Juan Jacobo Tu reserva ya" })
    .click();

  await context.close();
  await browser.close();
});
