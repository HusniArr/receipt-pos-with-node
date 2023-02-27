const express = require('express');
const { Pool } = require('pg');
const escpos = require('escpos');
require('dotenv').config();

const app = express();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
});

app.use(express.json());

app.get('/', (req, res) =>{
    res.status(200).json({message:'hello world...'})
});

app.get('/items', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM items');
  res.json(rows);
});

app.post('/receipt', async (req, res) => {
  const { items } = req.body;

  // Connect to the printer
  const device = new escpos.Network('192.168.0.100');
  const printer = new escpos.Printer(device);

  device.open(async (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
      return;
    }

    // Set the character encoding to support special characters
    printer.characterSet('WINDOWS-1252');

    // Print the logo image
    const logo = escpos.Image.load('public/logo.png', { encoding: 'base64' });
    printer.image(logo);

    // Print the receipt header
    printer.align('center');
    printer.text('RECEIPT\n\n');

    // Print each item in the receipt
    for (const itemId of items) {
      const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
      const { name, price } = rows[0];
      printer.text(`${name} ${price}\n`);
    }

    // Print the receipt footer
    printer.text('\nThank you for shopping with us!\n');
    printer.cut();
    printer.close();
    res.sendStatus(200);
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
