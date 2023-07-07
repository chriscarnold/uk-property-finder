const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');


async function rightmove() {
    let propArr =[];
    const browser = await puppeteer.launch({ headless: true}); 
  
    const page = await browser.newPage();
    await page.goto('https://www.rightmove.co.uk/property-to-rent/find.html?searchType=RENT&locationIdentifier=REGION%5E1231&insId=1&radius=0.0&minPrice=700&maxPrice=900&minBedrooms=1&maxBedrooms=&displayPropertyType=&maxDaysSinceAdded=1&sortByPriceDescending=&_includeLetAgreed=on&primaryDisplayPropertyType=&secondaryDisplayPropertyType=&oldDisplayPropertyType=&oldPrimaryDisplayPropertyType=&letType=&letFurnishType=&houseFlatShare=');
    
    // Handle cookie pop-up
    const acceptSelector = 'button#onetrust-accept-btn-handler';
    const acceptButton = await page.waitForSelector(acceptSelector);
    await acceptButton.click();
  
    const propertyLinks = await page.$$eval('a.propertyCard-link.property-card-updates', (links) => {
      return links.map((link) => link.href);
    });
    
    const pTitles = await page.$$eval('address.propertyCard-address.property-card-updates', (addresses) => {
      return addresses.map((address) => address.textContent.trim());
    });
  
    const pDescriptions = await page.$$eval('span[itemprop="description"]', (descriptionElements) => {
      return descriptionElements.map((element) => element.textContent.trim());
    });
  
    const pPrices = await page.$$eval('span.propertyCard-priceValue', (priceElements) => {
      return priceElements.map((element) => {
        const priceString = element.textContent.trim();
        const numericPart = priceString.replace(/\D/g, '');
        return parseInt(numericPart);
      });
    });
  
  
    
    for (let i = 0; i < propertyLinks.length; i++) {
      const property = new Property(pTitles[i], pDescriptions[i], propertyLinks[i], pPrices[i]);
      propArr.push(property);
    }
  
    propArr = propArr.filter((property) => property.price >= minPrice && property.price < maxPrice);
    
    /*propArr.forEach(async (property) => {
      console.log(property.link);
      console.log(property.title);
      console.log(property.price);
      console.log(property.description);
    });*/

    await browser.close();
    return propArr;
    
    
  }
//rightmove();
module.exports = { rightmove };
