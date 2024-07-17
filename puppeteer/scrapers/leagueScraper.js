/* const { postLeague } = require("../../api/postLeague"); */
const teamScraper = require("./teamScraper");
const db = require("../../database/db");

async function leagueScraper(browser, page, competition) {
  const allowedTiers = [
    "FIRST TIER",
    "SECOND TIER",
    "THIRD TIER",
    "FOURTH TIER",
    "FIFTH TIER",
    "SIXTH TIER",
  ];

  try {
    await page.goto(`https://www.transfermarkt.com/wettbewerbe/europa?page=1`);
    // Wait for pagination element to get page count
    await page.waitForSelector(".responsive-table > .grid-view");
    const pagesElement = await page.$(
      "#yw1 > div.pager > ul > li.tm-pagination__list-item.tm-pagination__list-item--icon-last-page"
    );
    const pageCount = await pagesElement.evaluate((el) =>
      parseInt(el.querySelector("a").getAttribute("href").split("=").pop())
    );

    for (let i = 2; i < pageCount; i++) {
      // Navigate to each page

      await page.waitForSelector("td.extrarow");

      // Get the league name for current page
      const leagueNameElement = await page.$("td.extrarow");
      const leagueName = await leagueNameElement.evaluate((el) =>
        el.textContent.trim()
      );
      if (!leagueName.toUpperCase().includes("TIER")) continue;

      // Scrape data for current page
      const data = await page.evaluate(async () => {
        await new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });
        const rows = document.querySelectorAll("#yw1 > table > tbody > tr");
        const leagues = [];
        rows.forEach((row) => {
          const extraRow = row.querySelector("td.extrarow");
          if (extraRow) {
            tier = extraRow.textContent.trim();
          } else {
            const _id = row
              .querySelector(
                "td.hauptlink > table > tbody > tr > td:nth-child(1) > a"
              )
              ?.getAttribute("href")
              .split("/")
              .pop();
            const name = row.querySelector("td.hauptlink").textContent.trim();
            const link = row
              .querySelector(
                "td.hauptlink > table > tbody > tr > td:nth-child(1) > a"
              )
              .getAttribute("href");
            const logo = row
              .querySelector(
                "td.hauptlink > table > tbody > tr > td:nth-child(1) > a > img"
              )
              .getAttribute("src");
            const country = {
              id: row
                .querySelector("td:nth-child(2) > img")
                .getAttribute("src")
                .split(".png")[0]
                .split("/")
                .pop(),
              name: row
                .querySelector("td:nth-child(2) > img")
                .getAttribute("title"),
              flag: row
                .querySelector("td:nth-child(2) > img")
                .getAttribute("src"),
            };
            const clubs = parseInt(
              row.querySelector("td:nth-child(3)").textContent.trim()
            );
            const players = row
              .querySelector("td:nth-child(4)")
              .textContent.trim();

            const averageAge = parseFloat(
              row.querySelector("td:nth-child(5)").textContent.trim()
            );
            const foreigners = parseFloat(
              row
                .querySelector("td:nth-child(6) > a")
                .textContent.trim()
                .split(" %")[0]
            );
            const totalValue = row
              .querySelector("td:nth-child(8)")
              .textContent.trim();
            leagues.push({
              _id,
              name,
              logo,
              link,
              country,
              clubs,
              players,
              averageAge,
              foreigners,
              totalValue,
              tier, //tear_id autoincrement olduüu için tier name ile yaparız bunu
            });
          }
        });

        return leagues;
      });

      for (const league of data) {
        if (allowedTiers.includes(league.tier.toUpperCase())) {
          try {
            league.competition = competition;
            //await db.insert("leagues", league);

            await teamScraper(browser, league.link, league._id, 1);
          } catch (error) {
            console.error("File writing error", error);
          }
        }
      }
      const nextPage = await page.$(
        "#yw1 > div.pager > ul > li.tm-pagination__list-item.tm-pagination__list-item--icon-next-page > a"
      );
      await nextPage.evaluate((b) => b.click());
      await page.waitForSelector(".responsive-table > .grid-view-loading");
      await page.waitForFunction(
        () =>
          !document
            .querySelector("#yw1")
            .classList.contains("grid-view-loading")
      );
    }
  } catch (error) {
    console.error("Error occured", error);
  }
}

module.exports = leagueScraper;
