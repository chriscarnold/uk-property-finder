const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');

async function charters() {
    let propArr = [];
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://chartersestateagents.co.uk/property-search/?new_homes=&address_keyword=Southampton&property_type=&commercial_property_type=&minimum_bedrooms=&officeID=&minimum_price=&maximum_price=&minimum_rent=600&maximum_rent=1000&view=&pgp=&department=residential-lettings&availability%5B%5D=2&availability%5B%5D=6');

    const links = await page.$$eval('a.work_box', linkElements => {
        return linkElements.map(linkElement => linkElement.getAttribute('href'));
      });
      
    //console.log(links);
    
    const titles = await page.$$eval('a.work_box', linkElements => {
        return linkElements.map(linkElement => {
          const titleElement = linkElement.querySelector('.property-name h5');
          const titleText = titleElement ? titleElement.lastChild.textContent.trim() : null;
          return titleText;
        }).filter(title => title !== null);
      });
      
    //console.log(titles);

    const descriptions = await page.$$eval('a.work_box', linkElements => {
        return linkElements.map(linkElement => {
          const descriptionElement = linkElement.querySelector('.property-name h5 span');
          return descriptionElement ? descriptionElement.textContent.trim() : null;
        }).filter(description => description !== null);
      });
      
    //console.log(descriptions);

    const prices = await page.$$eval('a.work_box', linkElements => {
        return linkElements.map(linkElement => {
          const priceElement = linkElement.querySelector('.property-price h6');
          if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const numericPrice = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
            return numericPrice;
          }
          return null;
        }).filter(price => price !== null);
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
module.exports = { charters };
//charters();