const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const shoppersFilePath = path.join(__dirname, 'shoppers.json');

function readShoppersFile() {
    const data = fs.readFileSync(shoppersFilePath);
    return JSON.parse(data);
}

function writeShoppersFile(data) {
    fs.writeFileSync(shoppersFilePath, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    res.send('API is working!');
});

app.get('/api/shoppers', (req, res) => {
    const shoppers = readShoppersFile();
    res.json(shoppers);
});

app.get('/api/shoppers/:username', (req, res) => {
    const shoppers = readShoppersFile();
    const shopper = shoppers[req.params.username];
    if (shopper) {
        res.json(shopper);
    } else {
        res.status(404).json({ message: 'Shopper not found' });
    }
});

// create a new shopper
app.post('/api/shoppers', (req, res) => {
    const shoppers = readShoppersFile();
    const { username, email, phone, age, address } = req.body;

    if (shoppers[username]) {
        return res.status(400).json({ message: 'Shopper already exists' });
    }

    shoppers[username] = { username, email, phone, age, address };
    writeShoppersFile(shoppers);
    res.status(201).json(shoppers[username]);
});

// update an existing shopper
app.put('/api/shoppers/:username', (req, res) => {
    const shoppers = readShoppersFile();
    const { username, email, phone, age, address } = req.body;

    if (!shoppers[req.params.username]) {
        return res.status(404).json({ message: 'Shopper not found' });
    }

    shoppers[req.params.username] = { username, email, phone, age, address };
    writeShoppersFile(shoppers);
    res.json(shoppers[req.params.username]);
});

// delete a shopper
app.delete('/api/shoppers/:username', (req, res) => {
    const shoppers = readShoppersFile();

    if (!shoppers[req.params.username]) {
        return res.status(404).json({ message: 'Shopper not found' });
    }

    delete shoppers[req.params.username];
    writeShoppersFile(shoppers);
    res.status(204).end();
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
