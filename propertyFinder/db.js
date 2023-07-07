const { Client } = require('pg');
const Property = require('./property');
const { dbName, dbPass } = require('./vars');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: dbName,
  password: dbPass,
  port: 5432,
});

async function connect() {
    await client.connect();
  }


async function insertProperty(property) {
  const query = {
    text: 'INSERT INTO properties (title, link, description, date_added, price) VALUES ($1, $2, $3, $4, $5)',
    values: [property.title, property.link, property.description, new Date(), property.price],
  };

  try {
    await client.query(query);
    console.log('Property inserted successfully:', property.title);
  } catch (error) {
    console.error('Error inserting property:', error);
  }
}


async function fetchProperties() {
    const result = await client.query('SELECT * FROM properties');
    const propArr = [];
  
    result.rows.forEach((row) => {
      const newProp = new Property(
        row.title,
        row.description,
        row.link,
        row.price
      );
      propArr.push(newProp);
    });
  
    return propArr;
  }

  async function cleanDatabase() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 3);
  
    const query = {
      text: 'DELETE FROM properties WHERE date_added < $1',
      values: [thresholdDate.toISOString()],
    };
  
    try {
      const result = await client.query(query);
      console.log(`Deleted ${result.rowCount} rows from the properties table.`);
    } catch (error) {
      console.error('Error cleaning the database:', error);
      throw error;
    }
}

async function disconnect() {
  await client.end();
}

module.exports = { connect, insertProperty, fetchProperties, cleanDatabase, disconnect };
