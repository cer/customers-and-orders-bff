import { Browser, Page } from 'puppeteer';
import puppeteer from 'puppeteer';

describe('Protected API', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();

    await page.setRequestInterception(true);

    page.on('request', (request) => {
      console.log('[DEBUG_LOG] Request:', request.url());
      request.continue();
    });

    page.on('response', (response) => {
      console.log('[DEBUG_LOG] Response:', response.url(), response.status());
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should reject unauthenticated requests to protected API', async () => {
    await page.goto('http://localhost:3000');
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/secure/data', {
        method: 'GET',
        credentials: 'include',
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });

    expect(response.status).toBe(401);
    expect(response.data.error).toBe('Unauthorized: Please sign in to access this resource');
  });

  it('should return protected data for authenticated requests', async () => {
    // First sign in
    await page.goto('http://localhost:3000');
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

    console.log("!!!!!!!!!!!!!!!!!! ACCESSING API")

    // Now try to access the protected API
    const response = await page.evaluate(async () => {
      const res = await fetch('/api/secure/data', {
        method: 'GET',
        credentials: 'include',
      });
      return {
        status: res.status,
        data: await res.json()
      };
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message', 'Successfully retrieved protected data');
    expect(response.data).toHaveProperty('timestamp');
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBe(3);
  });
});
