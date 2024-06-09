const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');  // Import the cors middleware
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const port = 3000;

app.use(cors());  // Enable CORS for all routes
app.use(bodyParser.json());

let vouchers = [];

// Load vouchers from CSV
function loadVouchers() {
    vouchers = [];  // Reset vouchers array
    fs.createReadStream('vouchers.csv')
        .pipe(csv())
        .on('data', (row) => {
            vouchers.push(row);
        });
}

loadVouchers();

// Validate Voucher
app.post('/validate', (req, res) => {
    const { code } = req.body;
    const voucherIndex = vouchers.findIndex(voucher => voucher.code === code && voucher.active === 'true');

    if (voucherIndex > -1) {
        vouchers[voucherIndex].active = 'false';
        vouchers[voucherIndex].useDate = new Date().toISOString();
        fs.writeFile('vouchers.csv', "code,active,useDate\n" + vouchers.map(v => `${v.code},${v.active},${v.useDate}`).join('\n'), (err) => {
            if (err) {
                return res.status(500).json({ valid: false });
            }
            res.json({ valid: true });
        });
    } else {
        res.json({ valid: false });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
