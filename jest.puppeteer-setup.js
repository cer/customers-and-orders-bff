const puppeteer = require('puppeteer');

beforeAll(async () => {
  global.browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
});

afterAll(async () => {
  await global.browser.close();
}); 