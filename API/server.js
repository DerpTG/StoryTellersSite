const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const shoppersFilePath = path.join(__dirname, 'Shoppers.json');
const productsFilePath = path.join(__dirname, 'Products.json');
const cartFilePath = path.join(__dirname, 'ShoppingCartItems.json');

function readJsonFile(filePath) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    res.send('API is working!');
});

/* -------------------- Shopper Routes -------------------- */

app.get('/api/shoppers', (req, res) => {
    const shoppers = readJsonFile(shoppersFilePath);
    res.json(shoppers);
});

app.get('/api/shoppers/:username', (req, res) => {
    const shoppers = readJsonFile(shoppersFilePath);
    const shopper = shoppers[req.params.username];
    if (shopper) {
        res.json(shopper);
    } else {
        res.status(404).json({ message: 'Shopper not found' });
    }
});

app.post('/api/shoppers', (req, res) => {
    const shoppers = readJsonFile(shoppersFilePath);
    const { username, email, phone, age, address } = req.body;

    if (shoppers[username]) {
        return res.status(400).json({ message: 'Shopper already exists' });
    }

    shoppers[username] = { username, email, phone, age, address };
    writeJsonFile(shoppersFilePath, shoppers);
    res.status(201).json(shoppers[username]);
});

app.put('/api/shoppers/:username', (req, res) => {
    const shoppers = readJsonFile(shoppersFilePath);
    const { username, email, phone, age, address } = req.body;

    if (!shoppers[req.params.username]) {
        return res.status(404).json({ message: 'Shopper not found' });
    }

    shoppers[req.params.username] = { username, email, phone, age, address };
    writeJsonFile(shoppersFilePath, shoppers);
    res.json(shoppers[req.params.username]);
});

app.delete('/api/shoppers/:username', (req, res) => {
    const shoppers = readJsonFile(shoppersFilePath);

    if (!shoppers[req.params.username]) {
        return res.status(404).json({ message: 'Shopper not found' });
    }

    delete shoppers[req.params.username];
    writeJsonFile(shoppersFilePath, shoppers);
    res.status(204).end();
});

/* -------------------- Product Routes -------------------- */

app.get('/api/products', (req, res) => {
    const products = readJsonFile(productsFilePath);
    res.json(products);
});

app.get('/api/products/:productId', (req, res) => {
    const products = readJsonFile(productsFilePath);
    const product = products[req.params.productId];
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.post('/api/products', (req, res) => {
    const products = readJsonFile(productsFilePath);
    const { productId, productDescription, productCategory, productUOM, productPrice, productWeight } = req.body;

    if (products[productId]) {
        return res.status(400).json({ message: 'Product already exists' });
    }

    products[productId] = { productId, productDescription, productCategory, productUOM, productPrice, productWeight };
    writeJsonFile(productsFilePath, products);
    res.status(201).json(products[productId]);
});

app.put('/api/products/:productId', (req, res) => {
    const products = readJsonFile(productsFilePath);
    const { productId, productDescription, productCategory, productUOM, productPrice, productWeight } = req.body;

    if (!products[req.params.productId]) {
        return res.status(404).json({ message: 'Product not found' });
    }

    products[req.params.productId] = { productId, productDescription, productCategory, productUOM, productPrice, productWeight };
    writeJsonFile(productsFilePath, products);
    res.json(products[req.params.productId]);
});

app.delete('/api/products/:productId', (req, res) => {
    const products = readJsonFile(productsFilePath);

    if (!products[req.params.productId]) {
        return res.status(404).json({ message: 'Product not found' });
    }

    delete products[req.params.productId];
    writeJsonFile(productsFilePath, products);
    res.status(204).end();
});

/* -------------------- Shopping Cart Routes -------------------- */

// Retrieve all items in the shopping cart
app.get('/api/shopping-cart', (req, res) => {
    const cart = readJsonFile(cartFilePath);
    res.json(cart);
});

// Add or update an item in the shopping cart
app.post('/api/shopping-cart', (req, res) => {
    const cart = readJsonFile(cartFilePath);
    const { productId, quantity, product } = req.body;

    if (cart[productId]) {
        cart[productId].quantity += quantity;
    } else {
        cart[productId] = { product, quantity };
    }

    writeJsonFile(cartFilePath, cart);
    res.status(201).json(cart);
});

// Update the quantity of an item in the shopping cart
app.put('/api/shopping-cart/:productId', (req, res) => {
    const cart = readJsonFile(cartFilePath);
    const { quantity } = req.body;

    if (!cart[req.params.productId]) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }

    cart[req.params.productId].quantity = quantity;
    writeJsonFile(cartFilePath, cart);
    res.json(cart);
});

// Remove an item from the shopping cart
app.delete('/api/shopping-cart/:productId', (req, res) => {
    const cart = readJsonFile(cartFilePath);

    if (!cart[req.params.productId]) {
        return res.status(404).json({ message: 'Product not found in cart' });
    }

    delete cart[req.params.productId];
    writeJsonFile(cartFilePath, cart);
    res.status(204).end();
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
