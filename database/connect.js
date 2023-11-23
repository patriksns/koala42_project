const dotenv = require("dotenv");
dotenv.config();

const { Client } = require('pg');

// klient pro připojení k databázi
const client = new Client({
  connectionString: process.env.DB_CONNECT,
});

client.connect()
  .then(() => {
    console.log('Úspěšně připojeno k DB');

    // return client.query('SELECT * FROM character');

  })

  .catch((err) => {
    console.error('Chyba při připojování k DB:', err);
  })

module.exports = client
