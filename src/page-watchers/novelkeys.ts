import puppeteer from 'puppeteer';
import {isEqual} from 'lodash';
import {WebhookClient} from 'discord.js';

let existingProductList: string[][] = []

export const novelkeysCheck = async (webhookClient: WebhookClient) => {
    const url = 'https://novelkeys.xyz/collections/extras-group-buy'
    const browser = await puppeteer.launch()
    try {
        const page = await browser.newPage()
        await page.setViewport({
            width: 2560,
            height: 1440
        })
        await page.goto(url, {waitUntil: 'networkidle0'})
        const newProductList: string[][] = await page.evaluate(() => {
            const products: string[][] = []
            document
                .querySelectorAll('#Collection > ul > li')
                .forEach((element: Element) => {
                    const product: string[] = [element.querySelector('div > div.one-whole > div').textContent, element.querySelector('#overlay_text')?.textContent]
                    products.push(product)
                })
            return products.sort()
        })
        if (!isEqual(existingProductList, newProductList)) {
            existingProductList = newProductList
            await webhookClient.send(`<@${process.env.ME_ID}> <@${process.env.LUKE_ID}> Page change detected <${url}>`, {
                files: [await page.screenshot()]
            })
        }
    } catch (e) {
        console.log(e)
        await webhookClient.send(`Encountered an error\n${e}`)
    } finally {
        await browser.close()
    }
    setTimeout(() => {
        novelkeysCheck(webhookClient)
    }, 1000 * 60 * 5)
}