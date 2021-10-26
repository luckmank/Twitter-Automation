//npm install minimist
//npm install puppeteer
//To Trigger the script --> node TwitterAutomateTweet.js --url="https://twitter.com/" --config="Config.json"

let minimist = require('minimist');
let pupeteer = require('puppeteer');
let fs = require('fs');

let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);


async function run() {
    let browser = await pupeteer.launch(
        {
            headless: false,
            args: ['--start-fullscreen'],
            defaultViewport: null
        }

    );
    let pages = await browser.pages();
    let page = pages[0];

    await page.goto(args.url);

    await page.waitForSelector("span.css-18t94o4.css-901oao.css-16my406.r-1cvl2hr.r-poiln3.r-bcqeeo.r-qvutc0", { timeout: 60000 });
    await page.click("span.css-18t94o4.css-901oao.css-16my406.r-1cvl2hr.r-poiln3.r-bcqeeo.r-qvutc0");

    //await page.waitFor(3000);

    await page.waitForSelector("a[href='/login']", { timeout: 60000 });
    await page.click("a[href='/login']");

    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.username, { delay: 50 });
    await page.keyboard.press("Enter");

    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, { delay: 50 });
    await page.keyboard.press("Enter");

    await page.waitForSelector("a[href='/explore']");
    await page.click("a[href='/explore']");

    await page.waitForSelector("a[href='/explore/tabs/trending']", {
        visible: false
    });
    await page.click("a[href='/explore/tabs/trending']");

    await page.waitForSelector("div[data-testid='trend']");
    let TrendingText = await page.$$eval("div[data-testid='trend']", function (atags) {
        console.log(atags);
        let trendingTags = []
        for (let i = 0; i < 3; i++) {
            let trendingTag = atags[i + 1].querySelector("span[dir='ltr']").textContent;
            trendingTags.push(trendingTag);

        }

        return trendingTags;
    });



    for (let i = 0; i < TrendingText.length; i++) {

        await page.click("a[href='/compose/tweet']");
        await page.waitForSelector("div[aria-label='Tweet text']");
        let existingText = page.waitForSelector("div[aria-label='Tweet text']");
        for(let j=0; j<existingText.length; j++)
        {
            await page.keyboard.press("backspace", {delay:10});
        }
        await page.type("div[aria-label='Tweet text']", TrendingText[i], { delay: 50 });
        await page.click("div[aria-label='Tweet text']");
        await page.click("div[data-testid='tweetButton']");
       // await page.waitForSelector("main[role='main']");
        //await page.click("main[role='main']");
        await page.waitFor(3000);
        await page.waitForSelector("a[href='/compose/tweet']");

    }






    await page.waitFor(2000);

    await page.close();

    await browser.close();


}

run();
console.log(args.url);

