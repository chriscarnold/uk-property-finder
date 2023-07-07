const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');

async function century() {
    let propArr = [];
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    //replace url
    await page.goto('https://www.century21uk.com/property-search/?location=Southampton&lat=50.9105468&lng=-1.4049018&type=&min=750&rooms=1&radius=5.1&added=l24&max=1000&maxrooms=0&agentID=&ownership=lettings');


    const links = await page.$$eval('#property-results .column .property-tile a[href^="/property/"]', linkElements => {
        const linkSet = new Set();
        linkElements.forEach(linkElement => linkSet.add(linkElement.href));
        return Array.from(linkSet);
      });
      
    //console.log(links);

    const titles = await page.$$eval('#property-results .column .property-tile .title', titleElements => {
        return titleElements.map(titleElement => titleElement.textContent.trim());
      });
      
    //console.log(titles);

    const descriptions = await page.$$eval('#property-results .column .property-tile .description', descriptionElements => {
        return descriptionElements.map(descriptionElement => descriptionElement.textContent.trim());
      });
      
    //console.log(descriptions);

    const prices = await page.$$eval('#property-results .column .property-tile .price', priceElements => {
        return priceElements.map(priceElement => {
          const priceText = priceElement.textContent.trim();
          const numericValue = priceText.match(/\d+/); 
          return numericValue ? parseInt(numericValue[0]) : null; 
        });
      });
      
    //console.log(prices);

    for (let i = 0; i < links.length; i++) {
        const property = new Property(titles[i], descriptions[i], links[i], prices[i]);
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
module.exports = { century };
//century();