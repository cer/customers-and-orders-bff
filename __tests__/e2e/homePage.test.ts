import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';

describe('Home Page', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    // await page.setRequestInterception(true);
    //
    // page.on('request', (request) => {
    //   console.log('Request:', request.url());
    //   request.continue();
    // });
    //
    // page.on('response', (response) => {
    //   console.log('Response:', response.url(), response.status());
    // });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should display the home page', async () => {
    await page.goto('http://localhost:3000'); 
    
    await page.waitForSelector('#welcome-greeting');

    const h1Text = await page.$eval('h1', (el: Element) => el.textContent);
    expect(h1Text).toBe('Welcome to Next.js!');

    const signinStatusText = await page.$eval('#signin-status', (el: Element) => el.textContent);
    expect(signinStatusText).toBe('Not signed in');
  
  });

  it('should sign in and display signed in status', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#welcome-greeting');

    await page.waitForSelector('button[data-provider="oauth2-pkce"]');
    await page.click('button[data-provider="oauth2-pkce"]');
    
    await page.waitForSelector('form.login-form', { timeout: 10000 });
    await page.type('input#username', 'user1');
    await page.type('input#password', 'password');
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('form[name="consent_form"]', { timeout: 10000 });
    await page.click('input#profile');
    await page.click('button#submit-consent');
        
    await page.waitForSelector('#signin-status', { timeout: 10000 });
    const signinStatusText = await page.$eval('#signin-status', (el: Element) => el.textContent);
    expect(signinStatusText).toBe('Signed in as user1');

  });
  


});