const { connect, insertProperty, fetchProperties, cleanDatabase, disconnect } = require('./db');
const Property = require('./property');
const { sendEmail } = require('./mailer');
const { rightmove } = require('./rightMove');
const { nestor } = require('./nestoria');
const { onTheMarket } = require('./onTheMarket');
const { spareRoom } = require('./spareRoom');
const { gumTree } = require('./gumTree');
const { charters } = require('./chartersEstate');
const { century } = require('./century21');
const { zoopla } = require('./zoopla');


async function main() {
    await connect();
    await cleanDatabase();
    let oldProps = await fetchProperties();
    let newProps = await rightmove();
    const nestorProps = await nestor();
    const otmProps = await onTheMarket();
    const spareProps = await spareRoom();
    const gumProps = await gumTree();
    const charProps = await charters();
    const centuryProps = await century();
    const zoopProps = await zoopla();

    newProps = newProps.concat(nestorProps);
    newProps = newProps.concat(otmProps);
    newProps = newProps.concat(spareProps);
    newProps = newProps.concat(gumProps);
    newProps = newProps.concat(charProps);
    newProps = newProps.concat(centuryProps);
    newProps = newProps.concat(zoopProps);
    
    newProps = newProps.filter((newProperty) => {
        const duplicateIndex = oldProps.findIndex((prop) =>
            //prop.link === newProperty.link && nestoria links change
            prop.title === newProperty.title &&
            prop.description === newProperty.description &&
            prop.price === newProperty.price
        );

        return duplicateIndex === -1;
    });

    newProps.forEach(async (property) => {
        console.log(property.link);
        console.log(property.title);
        console.log(property.price);
        console.log(property.description);
        });
    

    for (const property of newProps) {
        let emailSent;
        try {
            await sendEmail(property);
            emailSent = true;
        } catch (error) {
            console.error('something went wrong:', error);
        }

        if (emailSent) {
            await insertProperty(property);
        }
    };
    await disconnect();
}

main();


