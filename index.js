const escpos = require('escpos');
const pg = require('pg');

const client = new pg.Client({
    user:'postgres',
    host:'postgres',
    database:'pos',
    password:'password',
    port:5432
});

const device = new escpos.Serial('', { baudRate: 9600});

async function generateReceipt(){
    try {
        await client.connect();

        const { rows } = await client.query('SELECT * FROM items');

        const printer = new escpos.Printer(device);

        printer
            .align('center')
            .image('','s8')
            .text('JOSS TENAN')
            .text('Jl. Raya Jend. Sudirman KM 11 - Bumiayu')
            .text('081234347')
            .text('Receipt')
            .text('---------------------------------------')
            .text('Item                   Price         Qty    Subtotal');

        rows.forEach(({name, price, quantity, subtotal}) => {
            printer.text(`${name} ${price} ${quantity} ${subtotal}`);
        });

        printer
            .text('..........................')
            .text('Total: ')
            .text('..........................')
            .cut();
        await printer.execute();
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

generateReceipt();