const puppeteer = require('puppeteer');
const Property = require('./property');
const { maxPrice, minPrice } = require('./vars');


let otmArr =[];

async function onTheMarket() {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.onthemarket.com/to-rent/property/southampton/?max-price=900&min-bedrooms=1&min-price=700&recently-added=24-hours&shared=false&view=grid');
    
    const pLinks = await page.$$eval('.otm-Price  > a', (links) => {
        return links.map((link) => link.href);
    });

    //console.log(pLinks);

    const pTitles = await page.$$eval('.address  > a', (titles) => {
        return titles.map((title) => title.textContent);
    });
    //console.log(pTitles);

    const pDescriptions = await page.$$eval('.title  > a', (titles) => {
        return titles.map((title) => title.textContent);
    });
    //console.log(pDescriptions);

    const pPrices = await page.$$eval('.otm-Price > a', (prices) => {
        return prices.map((price) => {
          const priceString = price.textContent;
          const numericPart = priceString.match(/\d+/)[0];
          return parseInt(numericPart);
        });
    });

    //console.log(pPrices);

    for (let i = 0; i < pLinks.length; i++) {
        const property = new Property(pTitles[i], pDescriptions[i], pLinks[i], pPrices[i]);
        otmArr.push(property);
      }

    otmArr = otmArr.filter((property) => property.price >= minPrice && property.price < maxPrice);
    
    const { rightmove } = require('./rightMove');
    const rmProps = await rightmove();
    otmArr = otmArr.filter((prop) => {
        return !rmProps.some((rmProp) => rmProp.title === prop.title && rmProp.price === prop.price);
    });

    /*otmArr.forEach(async (property) => {
    console.log(property.link);
    console.log(property.title);
    console.log(property.price);
    console.log(property.description);
    });*/


    await browser.close();
    return otmArr;
}
//onTheMarket();
module.exports = { onTheMarket };