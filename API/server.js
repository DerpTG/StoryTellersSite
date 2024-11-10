const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "StoryTellers";

app.use(cors());
app.use(express.json());

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
}
connectToDatabase();

/* -------------------- Shopper Routes -------------------- */

app.get('/api/shoppers', async (req, res) => {
    const db = client.db(dbName);
    const shoppers = await db.collection('Shoppers').find().toArray();
    res.json(shoppers);
});

app.get('/api/shoppers/:username', async (req, res) => {
    const db = client.db(dbName);
    const shopper = await db.collection('Shoppers').findOne({ _id: req.params.username });
    if (shopper) {
        res.json(shopper);
    } else {
        res.status(404).json({ message: 'Shopper not found' });
    }
});

app.post('/api/shoppers', async (req, res) => {
    const db = client.db(dbName);
    const { username, email, phone, age, address } = req.body;

    const existingShopper = await db.collection('Shoppers').findOne({ _id: username });
    if (existingShopper) {
        return res.status(400).json({ message: 'Shopper already exists' });
    }

    const newShopper = {
        _id: username,
        email,
        phone,
        age,
        address
    };

    await db.collection('Shoppers').insertOne(newShopper);
    res.status(201).json(newShopper);
});

app.put('/api/shoppers/:username', async (req, res) => {
    const db = client.db(dbName);
    const { email, phone, age, address } = req.body;

    try {
        const updatedShopper = await db.collection('Shoppers').findOneAndUpdate(
            { _id: req.params.username }, 
            { $set: { email, phone, age, address } },
            { returnDocument: 'after' } 
        );

        if (updatedShopper && updatedShopper.value) {
            res.json(updatedShopper.value);
        } else {
            res.status(404).json({ message: 'Shopper not found' });
        }
    } catch (error) {
        console.error("Error during update:", error);
        res.status(500).json({ message: "An error occurred while updating the shopper." });
    }
});


/* -------------------- Product Routes -------------------- */

app.get('/api/products', async (req, res) => {
    const db = client.db(dbName);
    const products = await db.collection('Products').find().toArray();
    res.json(products);
});

app.get('/api/products/:productId', async (req, res) => {
    const db = client.db(dbName);
    const product = await db.collection('Products').findOne({ _id: req.params.productId });
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

app.post('/api/products', async (req, res) => {
    const db = client.db(dbName);
    const { productId, productDescription, productCategory, productUOM, productPrice, productWeight } = req.body;

    const existingProduct = await db.collection('Products').findOne({ _id: productId });
    if (existingProduct) {
        return res.status(400).json({ message: 'Product already exists' });
    }

    const newProduct = {
        _id: productId,  // Use productId as the MongoDB _id field
        productDescription,
        productCategory,
        productUOM,
        productPrice,
        productWeight
    };

    await db.collection('Products').insertOne(newProduct);
    res.status(201).json(newProduct);
});

app.put('/api/products/:productId', async (req, res) => {
    const db = client.db(dbName);
    const { productDescription, productCategory, productUOM, productPrice, productWeight } = req.body;

    try {
        const updatedProduct = await db.collection('Products').findOneAndUpdate(
            { _id: req.params.productId },
            { $set: { productDescription, productCategory, productUOM, productPrice, productWeight } },
            { returnDocument: 'after' } // Returns the updated document after the update
        );

        if (updatedProduct && updatedProduct.value) {
            res.json(updatedProduct.value);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error during product update:", error);
        res.status(500).json({ message: "An error occurred while updating the product." });
    }
});

/* -------------------- Order Routes -------------------- */

app.post('/api/orders', async (req, res) => {
    const db = client.db(dbName);
    const ordersCollection = db.collection('Orders');

    const latestOrder = await ordersCollection.find().sort({ id: -1 }).limit(1).toArray();
    const newOrderId = latestOrder.length ? latestOrder[0].id + 1 : 1;

    const newOrder = {
        id: newOrderId,
        ...req.body,
        orderDate: new Date().toISOString()
    };

    await ordersCollection.insertOne(newOrder);
    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrderId });
});

app.get('/api/orders/:orderId', async (req, res) => {
    const db = client.db(dbName);
    const order = await db.collection('Orders').findOne({ id: parseInt(req.params.orderId) });

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

/* -------------------- Return Routes -------------------- */

app.post('/api/ReturnedItems', async (req, res) => {
    const db = client.db(dbName);
    const returnsCollection = db.collection('ReturnedItems');

    const newReturn = {
        orderId: req.body.orderId,
        returnItems: req.body.returnItems,
        returnDate: new Date().toISOString()
    };

    await returnsCollection.insertOne(newReturn);
    res.status(201).json({ message: 'Return submitted successfully!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
