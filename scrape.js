const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

function getExecutablePath() {
  if (process.env.GITHUB_ACTIONS) {
    return process.env.CHROME_BIN || '/usr/bin/google-chrome'; // Github Actions Browser path
  }

  const candidates = [
    process.env.CHROME_BIN,
    String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`, // Your path to Browser
    null
  ];

  return candidates.find(p => p && fs.existsSync(p));
}

const today = new Date();
const pageUrl = today.getDate() % 2 === 0
  ? 'https://quotes.toscrape.com/page/2/'
  : 'https://quotes.toscrape.com/';

console.log(`📅 ${today.toDateString()} | 📄 ${pageUrl}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: true, // true = hidden browser, false = visible browser
    executablePath: getExecutablePath(),
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }); 45

  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() =>
    [...document.querySelectorAll('.quote')].slice(0, 10).map(q => ({
      text: q.querySelector('.text').innerText,
      author: q.querySelector('.author').innerText
    }))
  );

  await browser.close();

  const outputDir = path.join(__dirname, 'public');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputPath = path.join(outputDir, 'data.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`✅ Data scraped and saved to ${outputPath}`);
})();