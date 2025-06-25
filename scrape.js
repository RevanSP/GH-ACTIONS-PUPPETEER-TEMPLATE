const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const today = new Date();
const isEvenDay = today.getDate() % 2 === 0;
const pageUrl = isEvenDay 
  ? 'https://quotes.toscrape.com/page/2/' 
  : 'https://quotes.toscrape.com/';

console.log(`📅 Hari ini: ${today.toDateString()} | 📄 URL: ${pageUrl}`);

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

  fs.writeFileSync(path.join(outputDir, 'data.json'), JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Data scraped and saved to ${path.join(outputDir, 'data.json')}`);
})();