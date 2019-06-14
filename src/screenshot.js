const puppeteer = require('puppeteer');

/**
 * Finds and click the selector
 * @param page
 * @param {string} selector (css selector)
 * @returns {Promise<void>}
 */
async function findAndClick(page, selector) {
    try {
        await page.$eval(selector, el => el);
        await page.click(selector)
    } catch (err) {
        console.log('Can not click ', selector);
    }
}

/**
 * Finds the input element using "selector" param and enters "entry" into it.
 * @param page
 * @param {string} entry
 * @param {string} selector (css selector)
 * @returns {Promise<void>}
 */
async function findandEnter(page, entry, selector = 'input.kuiLocalSearchInput') {
    try {
        await page.waitFor(selector);
        await page.$eval(selector, (el, value) => el.value = value, entry);
    } catch (e) {
        console.log('Can not type: ', selector);
    }
}

/**
 * Takes number in milliseconds and delays the execution.
 * @param {number} ms
 * @returns {Promise<any>}
 */
function sleep(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class screenshot {
    /**
     * Opens "url" in puppeteer(headless chrome)
     * Captures screenshots and saves in "filename"
     * @param url
     * @param filename
     * @param params
     * @returns {Promise<any>}
     */
    take(url, filename, params) {
        const docTypeFilter = {
            day: 1,
            week: 2,
            month: 3
        };
        return new Promise(function (resolve, reject) {
            puppeteer.launch({
                headless: true,
                // for docker containers
                args: ['--disable-dev-shm-usage', '--no-sandbox'],
            }).then(async browser => {
                console.log('[puppetter] link opened to capture.');
                const page = await browser.newPage();
                await page.setViewport({
                    width: 1280,
                    height: 800
                });
                await page.goto(url, {
                    waitUntil: 'networkidle0',
                    Referer: 'www.nobroker.in/admin/reports',
                    referrer: 'www.nobroker.in/admin/reports'
                });
                if (params && params.doc_type) {
                    // collapse sidebars
                    await findAndClick(page, 'button.sidebar-collapser > span.kuiIcon.fa-chevron-circle-left');
                    await findAndClick(page, 'div.global-nav-link--close > a.global-nav-link__anchor');
                    // set rule and type filter
                    await page.type('input.kuiLocalSearchInput', `type: ${params.doc_type} AND rule_id: ${params.rule_id}`);
                    await findAndClick(page, 'button[type=submit].kuiLocalSearchButton span');
                    // select time filter
                    await findAndClick(page, 'button[data-test-subj=globalTimepickerButton]');
                    await findAndClick(page, `div.kuiLocalDropdown ul.list-unstyled>li:nth-child(${docTypeFilter[params.doc_type]})>a`);
                } else {
                    await findAndClick(page, 'div.collapsible-sidebar:not(.closed) > div.sidebar-collapser > div');
                    await findAndClick(page, 'a.kuiMicroButton');
                }
                await sleep();
                let payload = {};
                await function f() {payload.kibanaLink = page.url()}();
                await page.screenshot({
                    path: filename,
                    fullPage: true
                });
                await browser.close();
                console.log('[Screenshot] captured successfully');
                payload.params = params;
                payload.filename = filename;
                resolve(payload);
            }).catch(err => reject(err));
        })
    }

}


module.exports = new screenshot();