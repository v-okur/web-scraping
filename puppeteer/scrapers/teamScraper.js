/* const { postTeam } = require("../../api/postTeam"); */
const db = require("../../database/db");
const playerScraper = require("./playerScraper");

async function teamScraper(browser, leagueLink, leagueID, competition_id) {
  console.log("tema enter");
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  try {
    await page.goto(`https://www.transfermarkt.com${leagueLink}`);

    await page.waitForSelector("#yw1 > table > tbody > tr");
    console.log("before eval");
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll("#yw1 > table > tbody > tr");
      const teams = [];
      rows.forEach((row) => {
        const name = row
          .querySelector("td.hauptlink > a:nth-child(1)")
          .getAttribute("title");
        const link = row
          .querySelector("td.hauptlink > a:nth-child(1)")
          .getAttribute("href");
        const _id = link.split("/").slice(-3, -2)[0];
        const logo = row
          .querySelector("td.zentriert.no-border-rechts > a > img")
          .getAttribute("src");
        const squad = parseInt(
          row.querySelector("td:nth-child(3)").textContent.trim()
        );
        const avarageAge = parseFloat(
          row.querySelector("td:nth-child(4)").textContent.trim()
        );
        const foreigners = parseInt(
          row.querySelector("td:nth-child(5)")?.textContent.trim()
        );
        const totalValue =
          row?.querySelector("td:nth-child(7) > a")?.textContent?.trim() ??
          null;
        if (name) {
          teams.push({
            _id,
            name,
            link,
            logo,
            squad,
            avarageAge,
            foreigners,
            totalValue,
          });
        }
      });
      return teams;
    });
    for (team of data) {
      team.captain_id = null;
      team.league_id = leagueID;

      await db.insert("teams", team);
      console.log(team);
      await playerScraper(page, team);
      console.log(team);
    }
  } catch (err) {
    console.error("Hata:", err);
  } finally {
    await page.close();
  }
}

module.exports = teamScraper;
