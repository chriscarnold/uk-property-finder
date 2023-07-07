const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');

async function gumTree() {
    let propArr = [];
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.gumtree.com/flats-houses/property-to-rent/uk/southampton');

    const pLinks = await page.$$eval('a.listing-link', links => {
        // Filter links based on the presence of 'hours' 
        return links
          .filter(link => {
            const adAge = link.querySelector('span.truncate-line.txt-tertiary[data-q="listing-adAge"]');
            return adAge && adAge.textContent.includes('hours');
          })
          .map(link => {
            const href = link.getAttribute('href');
            const url = 'https://www.gumtree.com/' + href;
            return url;
          });
      });
      
    //console.log(pLinks);

    const pTitles = await page.$$eval('h2.listing-title', titles => {
        return titles.map(title => {
          const adAgeElement = title.parentElement.querySelector('.listing-posted-date [data-q="listing-adAge"]');
          if (adAgeElement && adAgeElement.textContent.includes('hours')) {
            return title.textContent.trim();
          }
          return null;
        }).filter(title => title !== null);
      });

    //console.log(pTitles);
      
    const pDescriptions = await page.$$eval('p.listing-description', descriptions => {
        return descriptions.map(description => {
          const adAgeElement = description.parentElement.querySelector('[data-q="listing-adAge"]');
          if (adAgeElement && adAgeElement.textContent.includes('hours')) {
            return description.textContent.trim();
          }
          return null;
        }).filter(description => description !== null);
    });
      
    //console.log(pDescriptions);

    const pPrices = await page.$$eval('strong.h3-responsive', priceElements => {
        return priceElements.map(priceElement => {
          const adAgeElement = priceElement.parentElement.parentElement.querySelector('[data-q="listing-adAge"]');
          if (adAgeElement && adAgeElement.textContent.includes('hours')) {
            const priceText = priceElement.textContent.trim();
            const numericPrice = parseInt(priceText.substring(1).replace(/,/g, ''), 10);
            return numericPrice;
          }
          return null;
        }).filter(price => price !== null);
    });
      
    //console.log(pPrices);

    for (let i = 0; i < pLinks.length; i++) {
        const property = new Property(pTitles[i], pDescriptions[i], pLinks[i], pPrices[i]);
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
module.exports = { gumTree }
//gumTree();