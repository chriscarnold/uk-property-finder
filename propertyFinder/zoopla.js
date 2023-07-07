const Property = require('./property');
const puppeteer = require('puppeteer');
const { minPrice, maxPrice } = require('./vars');

async function zoopla() {
    let otmArr = [];
    const browser = await puppeteer.launch({ headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.zoopla.co.uk/to-rent/property/southampton/?added=24_hours&beds_min=1&is_retirement_home=false&is_shared_accommodation=false&price_frequency=per_month&price_max=900&price_min=700&q=Southampton&radius=0.25&results_sort=newest_listings&search_source=to-rent');

    const links = await page.$$eval('a._1maljyt1', (elements) => {
        const regex = /(SO15|SO14|SO16)/;
        return elements
          .filter((element) => regex.test(element.innerText))
          .map((element) => element.href);
      });
    
    //console.log(links);

    const titles = await page.$$eval('a._1maljyt1', (elements) => {
        const regex = /(SO15|SO14|SO16)/;
        return elements
          .filter((element) => regex.test(element.innerText))
          .map((element) => element.querySelector('h3._1ankud52._16fktr9').innerText);
      });
    
    //console.log(titles);

    const descriptions = await page.$$eval('a._1maljyt1', (elements) => {
        const regex = /(SO15|SO14|SO16)/;
        return elements
          .filter((element) => regex.test(element.innerText))
          .map((element) => {
            const h3Element = element.querySelector('h3._1ankud52._16fktr9');
            const descriptionElement = h3Element.nextElementSibling;
            return descriptionElement.textContent;
          });
      });
      
    //console.log(descriptions);

    const prices = await page.$$eval('a._1maljyt1', (elements) => {
        const regex = /(SO15|SO14|SO16)/;
        return elements
          .filter((element) => regex.test(element.innerText))
          .map((element) => {
            const priceElement = element.querySelector('p._170k6632._16fktr6[data-testid="listing-price"]');
            if (priceElement) {
              const priceText = priceElement.textContent.trim();
              const numericPart = priceText.replace(/\D/g, '');
              return parseInt(numericPart);
            } else {
              return NaN; // Indicates price not available
            }
          });
      });
      
    //console.log(prices);

    for (let i = 0; i < links.length; i++) {
        const property = new Property(titles[i], descriptions[i], links[i], prices[i]);
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
//zoopla();
module.exports = { zoopla };