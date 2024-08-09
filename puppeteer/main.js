const puppeteer = require("puppeteer");
const leagueScraper = require("./scrapers/leagueScraper");

async function main() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  const competition = "europa";
  console.log(competition);
  await leagueScraper(browser, page, competition);
}
main();
