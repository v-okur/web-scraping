/* const { postPlayer } = require("../../api/postPlayer"); */
const db = require("../../api/db");

async function playerScraper(page, team) {
  try {
    await page.goto(`https://www.transfermarkt.com${team.link}`);
    await page.waitForSelector("div.tm-tabs > a:nth-child(2)");
    const detailedTab = await page.$("div.tm-tabs > a:nth-child(2)");
    await detailedTab.evaluate((el) => el.click());
    await page.waitForSelector("#yw1_c8");

    // Oyuncu verilerini çekme
    let players = await page.evaluate((el) => {
      const rows = document.querySelectorAll(
        ".items tbody .odd, .items tbody .even"
      );
      const playerData = [];

      rows.forEach((row) => {
        const _id = row
          .querySelector(
            "td.posrela > table > tbody > tr:nth-child(1) > td.hauptlink > a"
          )
          .getAttribute("href")
          .split("/")
          .pop();

        const numberElement = row.querySelector("td.zentriert > div");
        let number = null;
        if (numberElement) {
          const numberText = numberElement?.textContent.trim();
          if (numberText !== "-") {
            number = numberText;
          }
        }

        const image = row
          .querySelector(
            "td.posrela > table > tbody > tr:nth-child(1) > td:nth-child(1) > img"
          )
          .getAttribute("data-src");

        const captainElement = row.querySelector(
          "td.posrela > table > tbody > tr:nth-child(1) > td.hauptlink > a > span"
        );

        let captain;
        captainElement?.getAttribute("title") === "Team captain"
          ? (captain = true)
          : (captain = false);

        const name = row
          .querySelector(
            "td.posrela > table > tbody > tr:nth-child(1) > td.hauptlink > a"
          )
          .textContent.trim();

        const position = row
          .querySelector("td.posrela > table > tbody > tr:nth-child(2) > td")
          ?.textContent.trim();

        const date_of_birth = row
          .querySelector("td:nth-child(3)")
          ?.textContent.trim()
          .split(" (")[0];

        const transferStatusElement = row.querySelector("td.posrela > a");
        let transfer_status = null;
        if (transferStatusElement) {
          transfer_status = transferStatusElement?.getAttribute("title");
        }

        const nationalitiesList = row.querySelectorAll("td.zentriert > img");
        const nationalities = [];
        nationalitiesList.forEach((nation) => {
          const nationalityName = nation?.getAttribute("title");
          const nationalityImg = nation?.getAttribute("src");
          nationalities.push({ name: nationalityName, flag: nationalityImg });
        });

        const height = row
          .querySelector("td:nth-child(5)")
          ?.textContent.trim()
          .replace(",", ".")
          .split("m")[0];

        const foot = row.querySelector("td:nth-child(6)")?.textContent.trim();

        const contractStart = row
          .querySelector("td:nth-child(7)")
          ?.textContent.trim();

        const contractEnd = row
          .querySelector("td:nth-child(9)")
          ?.textContent.trim();

        const contract = { start: contractStart, end: contractEnd };
        const previous_team_id = row
          .querySelector("td:nth-child(8) > a")
          ?.getAttribute("href")
          .split("/")
          .slice(-3, -2)[0];
        const previous_team_name = row
          .querySelector("td:nth-child(8) > a > img")
          ?.getAttribute("title");
        const previous_team_logo = row
          .querySelector("td:nth-child(8) > a > img")
          ?.getAttribute("src");
        const marketValueElement = row.querySelector("td.rechts.hauptlink");
        const currentValue = marketValueElement
          .querySelector("a")
          ?.textContent.trim();
        const previousValue = marketValueElement.querySelector("span")
          ? marketValueElement
              .querySelector("span")
              ?.getAttribute("title")
              .split(": ")[1]
          : marketValueElement.querySelector("a")?.textContent.trim();

        // Oyuncu verilerini playerData array'ine ekle

        playerData.push({
          _id: _id,
          number: number || null,
          image: image || null,
          name: name,
          date_of_birth: date_of_birth || null,
          captain: captain || false,
          position: position || null,
          transfer_status: transfer_status || null,
          nationalities: nationalities || null,
          height: height || null,
          foot: foot || null,
          contract: contract || null,
          team_id: null,
          previous_team_id: previous_team_id || null,
          previous_team_name: previous_team_name || null,
          previous_team_logo: previous_team_logo || null,
          currentValue: currentValue || null,
          previousValue: previousValue || null,
        });
      });

      return playerData;
    });

    players.map(async (player) => {
      player.team_id = team._id;
      //TODO: implement same logic for mongoDB
      if (player.captain) {
        db.setCaptain(team._id, player._id);
      }

      await db.insert("players", player);

      /* const previous_team = {
        id: player.previous_team_id,
        name: player.previous_team_name,
        logo: player.previous_team_logo,
        league_id: 1,
      };
      await createTeam(previous_team); */
    });
  } catch (error) {
    console.error("Error occured", error);
  }
}

module.exports = playerScraper;
