const puppeteer = require('puppeteer');
const Property = require('./property');
const { minPrice, maxPrice } = require('./vars');

async function nestor() {
    let propArr = [];
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.nestoria.co.uk/southampton/property/rent/bedroom-1?price_max=865&price_min=700&sort=newest');

const pLinks = await page.$$eval(
    '.results__link[data-href]',
    (elements) =>
      elements
        .filter((element) =>
          element
            .querySelector('.text--active')
            .textContent.includes('New')
        )
        .map((element) =>
          'https://www.nestoria.co.uk' + element.getAttribute('data-href')
        )
  );

//console.log(pLinks);


const pTitles = await page.$$eval('.listing__title__text', (elements) =>
    elements
      .filter((element) => {
        const textActiveElement = element.closest('.listing_list__content')?.querySelector('.text--active');
        return textActiveElement && textActiveElement.textContent.includes('New');
      })
      .map((element) => element.textContent.trim())
  );

//console.log(pTitles);

const pDescriptions = await page.$$eval('.listing__description', (elements) =>
elements
  .filter((element) => {
    const textActiveElement = element.closest('.listing_list__content')?.querySelector('.text--active');
    return textActiveElement && textActiveElement.textContent.includes('New');
  })
  .map((element) => element.textContent.trim())
);

//console.log(pDescriptions);


const pPrices = await page.$$eval('.result__details__price.price_click_origin', (elements) =>
  elements
    .map((element) => {
      const priceElement = element.querySelector('span');
      const listingDatasourceElement = element
        .closest('li.rating__new')
        .querySelector('.listing__datasource');
      const isActive =
        listingDatasourceElement &&
        listingDatasourceElement
          .querySelector('.text--active')
          .textContent.includes('New');
      if (isActive) {
        const price = priceElement?.textContent.trim();
        return price;
      }
      return null;
    })
    .filter(price => price !== null)
    .map((price) => {
        const priceString = price.trim();
        const numericPart = priceString.replace(/\D/g, '');
        return parseInt(numericPart);
    })
);

//console.log(pPrices);
// Create Property instances and add them to propArr
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


};
//nestor()
module.exports = { nestor };
