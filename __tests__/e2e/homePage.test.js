// This file should be moved to the `__tests__/e2e/` directory for Puppeteer testing.

const puppeteer = require('puppeteer');

describe('Home Page', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      console.log('Request:', request.url());
      request.continue();
    });

    page.on('response', (response) => {
      console.log('Response:', response.url(), response.status());
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display the home page', async () => {
    await page.goto('http://localhost:3000'); // Adjust the URL if your app runs on a different port
    const h1Text = await page.$eval('h1', el => el.textContent);
    expect(h1Text).toBe('Welcome to Next.js!');
  });
}); 