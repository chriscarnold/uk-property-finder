const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');



async function spareRoom() {
    let propArr = [];
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.spareroom.co.uk/flatshare/?search_id=1229221016&mode=list&');

    const pLinks = await page.$$eval('.desktop > a', (links) => {
        return links.reduce((filteredLinks, link) => {
            const locationElement = link.querySelector('.listingLocation');
            if (locationElement && locationElement.textContent.includes('Southampton')) {
                const href = link.getAttribute('href');
                const updatedHref = 'https://www.spareroom.co.uk/' + href;
                filteredLinks.push(updatedHref);
            }
            return filteredLinks;
        }, []);
    });
    //console.log(pLinks);

    const pTitles = await page.$$eval('.desktop > a', (links) => {
        return links.reduce((filteredTitles, link) => {
          const locationElement = link.querySelector('.listingLocation');
          if (locationElement && locationElement.textContent.includes('Southampton')) {
            const titleElement = link.querySelector('h2');
            if (titleElement) {
              const title = titleElement.textContent;
              filteredTitles.push(title);
            }
          }
          return filteredTitles;
        }, []);
    });

    //console.log(pTitles);

    
    const pDescriptions = await page.$$eval('.listing-result', (elements) => {
      return elements.reduce((filteredDescriptions, element) => {
        const locationElement = element.querySelector('.listingLocation');
        const locationText = locationElement.textContent.trim();
        if (locationText.includes('Southampton')) {
          const descriptionElement = element.querySelector('.description');
          const description = descriptionElement.textContent.trim();
          filteredDescriptions.push(description);
        }
        return filteredDescriptions;
      }, []);
    });
    
    //console.log(pDescriptions);

    const pPrices = await page.$$eval('.listing-result', (elements) => {
      return elements.reduce((filteredPrices, element) => {
        const locationElement = element.querySelector('.listingLocation');
        const locationText = locationElement.textContent.trim();
        if (locationText.includes('Southampton')) {
          const priceElement = element.querySelector('.listingPrice');
          const price = priceElement.textContent.trim().replace(/\D/g, '');
          filteredPrices.push(parseInt(price));
        }
        return filteredPrices;
      }, []);
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
module.exports = {spareRoom};
//spareRoom();