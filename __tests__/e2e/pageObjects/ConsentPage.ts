import { Page } from 'puppeteer';

export class ConsentPage {
    private page: Page;

    // Selectors
    private readonly consentFormSelector = 'form[name="consent_form"]';
    private readonly profileCheckboxSelector = 'input#profile';
    private readonly submitConsentButtonSelector = 'button#submit-consent';

    constructor(page: Page) {
        this.page = page;
    }

    async waitForConsentForm(): Promise<void> {
        await this.page.waitForSelector(this.consentFormSelector, { timeout: 10000 });
    }

    async giveConsent(): Promise<void> {
        await this.waitForConsentForm();
        await this.page.click(this.profileCheckboxSelector);
        await this.page.click(this.submitConsentButtonSelector);
    }

}