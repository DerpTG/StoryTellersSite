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
const ordersFilePath = path.join(__dirname, 'Orders.json');
const returnsFilePath = path.join(__dirname, 'ReturnedItems.json');


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

app.get('/api/shoppingcartitems', (req, res) => {
    const cart = readJsonFile(cartFilePath);
    res.json(cart);
});

app.post('/api/shoppingcartitems/checkout', (req, res) => {
    const cartData = req.body;
    writeJsonFile(cartFilePath, cartData);
    res.status(200).json({ message: 'Cart data saved successfully!' });
});

/* -------------------- Order Routes -------------------- */

function getNextOrderId(orders) {
    let id = 1;
    while (orders[id]) {
        id++;
    }
    return id;
}

app.post('/api/orders', (req, res) => {
    const orders = readJsonFile(ordersFilePath);
    const newOrderId = getNextOrderId(orders);
    const newOrder = {
        id: newOrderId,
        ...req.body,
        orderDate: new Date().toISOString()
    };

    orders[newOrderId] = newOrder;
    writeJsonFile(ordersFilePath, orders);
    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrderId });
});

app.get('/api/orders/:orderId', (req, res) => {
    const orders = readJsonFile(ordersFilePath);
    const orderId = req.params.orderId;

    if (orders[orderId]) {
        res.json(orders[orderId]);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

/* -------------------- Return Routes -------------------- */
app.post('/api/ReturnedItems', (req, res) => {
    const returns = readJsonFile(returnsFilePath);
    const newReturn = {
        orderId: req.body.orderId,
        returnItems: req.body.returnItems,
        returnDate: new Date().toISOString()
    };

    returns.push(newReturn);
    writeJsonFile(returnsFilePath, returns);
    res.status(201).json({ message: 'Return submitted successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
