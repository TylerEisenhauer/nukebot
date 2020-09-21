import puppeteer from 'puppeteer';
import {isEqual} from 'lodash';
import {WebhookClient} from 'discord.js';

let existingProduct: string

export const nvidiaCheck = async (webhookClient: WebhookClient) => {

    const url = 'https://www.nvidia.com/en-us/shop/geforce/?page=1&limit=9&locale=en-us'
    const browser = await puppeteer.launch()
    try {
        const page = await browser.newPage()
        await page.setViewport({
            width: 2560,
            height: 1440
        })
        await page.goto(url)
        await sleep(5000)
        const newProduct: string = await page.evaluate(() => {
            return document.querySelector('#mainCont > featured-product > div > div')?.outerHTML
        })
        if (!isEqual(existingProduct, newProduct)) {
            existingProduct = newProduct
            await webhookClient.send(`<@${process.env.ME_ID}> <@${process.env.SANDY_ID}> <@${process.env.HOANG_ID}> Page change detected <${url}>`, {
                files: [await page.screenshot()]
            })
        }
    } catch (e) {
        console.log(e)
        await webhookClient.send(`Encountered an error\n${e}`)
    } finally {
        console.log('closing browser')
        await browser.close()
        console.log('browser closed')
    }
    setTimeout(() => {
        nvidiaCheck(webhookClient)
    }, 1000 * 30)
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}