import { Page } from 'puppeteer';

export class HomePage {
    private page: Page;
    private readonly url = 'http://localhost:3000';

    // Selectors
    private readonly welcomeGreetingSelector = '#welcome-greeting';
    private readonly signinStatusSelector = '#signin-status';
    private readonly signInButtonSelector = 'button[data-provider="oauth2-pkce"]';

    constructor(page: Page) {
        this.page = page;
    }

    async navigate(): Promise<void> {
        await this.page.goto(this.url);
        await this.page.waitForSelector(this.welcomeGreetingSelector);
    }

    async getWelcomeText(): Promise<string> {
        const element = await this.page.$('h1');
        return element ? (await element.evaluate(el => el.textContent)) || '' : '';
    }

    async waitForSignInStatus(): Promise<void> {
        await this.page.waitForSelector(this.signinStatusSelector, { timeout: 10000 });
    }

    async getSignInStatus(): Promise<string> {
        await this.waitForSignInStatus();
        const element = await this.page.$(this.signinStatusSelector);
        return element ? (await element.evaluate(el => el.textContent)) || '' : '';
    }

    async clickSignIn(): Promise<void> {
        await this.page.waitForSelector(this.signInButtonSelector);
        await this.page.click(this.signInButtonSelector);
    }

    async isSignedIn(): Promise<boolean> {
        const status = await this.getSignInStatus();
        return status.includes('Signed in as');
    }

    async expectWelcomeTextToBe(expectedText: string): Promise<void> {
        const welcomeText = await this.getWelcomeText();
        expect(welcomeText).toBe(expectedText);
    }

    async expectSignInStatusToBe(expectedStatus: string): Promise<void> {
        const signinStatus = await this.getSignInStatus();
        expect(signinStatus).toBe(expectedStatus);
    }
}
