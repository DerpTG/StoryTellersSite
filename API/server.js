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

        if (updatedShopper) {
            res.json(updatedShopper.value);
        } else {
            res.status(404).json({ message: 'Shopper not found' });
        }
    } catch (error) {
        console.error("Error during update:", error);
        res.status(500).json({ message: "An error occurred while updating the shopper." });
    }
});

app.delete('/api/shoppers/:username', async (req, res) => {
    const db = client.db(dbName);
    const username = req.params.username;

    try {
        const result = await db.collection('Shoppers').deleteOne({ _id: username });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Shopper deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Shopper not found' });
        }
    } catch (error) {
        console.error("Error deleting shopper:", error);
        res.status(500).json({ message: "An error occurred while deleting the shopper." });
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
        _id: productId, 
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
            { returnDocument: 'after' }
        );

        if (updatedProduct) {
            res.json(updatedProduct.value);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error during product update:", error);
        res.status(500).json({ message: "An error occurred while updating the product." });
    }
});

app.delete('/api/products/:productId', async (req, res) => {
    const db = client.db(dbName);
    const productId = req.params.productId;

    try {
        const result = await db.collection('Products').deleteOne({ _id: productId });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Product deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "An error occurred while deleting the product." });
    }
});


/* -------------------- Shopping Cart Routes -------------------- */

app.get('/api/shoppingcartitems', async (req, res) => {
    const db = client.db(dbName);
    const cartItems = await db.collection('ShoppingCartItems').find().toArray();
    res.json(cartItems);
});

app.post('/api/shoppingcartitems/checkout', async (req, res) => {
    const db = client.db(dbName);
    const cartData = req.body;
	
	if (!Array.isArray(cartData)) {
        return res.status(400).json({ message: 'Invalid cart data format. Expected an array.' });
    }

    try {
        await db.collection('ShoppingCartItems').deleteMany({});
        await db.collection('ShoppingCartItems').insertMany(cartData.map(item => ({
            _id: item.productId,
            quantity: item.quantity
        })));

        res.status(200).json({ message: 'Cart data saved successfully!' });
    } catch (error) {
        console.error("Error saving cart data:", error);
        res.status(500).json({ message: 'Error saving cart data' });
    }
});

/* -------------------- Order Routes -------------------- */

app.post('/api/orders', async (req, res) => {
    const db = client.db(dbName);
    const ordersCollection = db.collection('Orders');

    try {
        const { _id, ...orderDetails } = req.body;

        if (_id) {
            const updatedOrder = {
                ...orderDetails,
                orderDate: new Date().toISOString(),
            };

            const result = await ordersCollection.updateOne(
                { _id: parseInt(_id) },
                { $set: updatedOrder },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                res.status(201).json({ message: 'Order created successfully!', orderId: _id });
            } else {
                res.status(200).json({ message: 'Order updated successfully!', orderId: _id });
            }
        } else {
            const latestOrder = await ordersCollection.find().sort({ _id: -1 }).limit(1).toArray();
            const newOrderId = latestOrder.length ? latestOrder[0]._id + 1 : 1;

            const newOrder = {
                _id: newOrderId,
                ...orderDetails,
                orderDate: new Date().toISOString()
            };

            await ordersCollection.insertOne(newOrder);
            res.status(201).json({ message: 'Order placed successfully!', orderId: newOrderId });
        }
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({ message: 'Error processing order' });
    }
});

app.get('/api/orders/:orderId', async (req, res) => {
    const db = client.db(dbName);
    const ordersCollection = db.collection('Orders');
    const orderId = parseInt(req.params.orderId);

    try {
        const order = await ordersCollection.findOne({ _id: orderId });

        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error retrieving order:", error);
        res.status(500).json({ message: 'Error retrieving order' });
    }
});

app.delete('/api/orders/:orderId', async (req, res) => {
    const db = client.db(dbName);
    const orderId = parseInt(req.params.orderId);
    
    try {
        const result = await db.collection('Orders').deleteOne({ _id: orderId });

        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Order deleted successfully!' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({ message: 'Error deleting order' });
    }
});


/* -------------------- Return Routes -------------------- */

app.post('/api/returns', async (req, res) => {
    const db = client.db(dbName);
    const returnsCollection = db.collection('ReturnedItems');

    const orderId = req.body.orderId;

    const newReturn = {
        _id: orderId,
        returnItems: req.body.returnItems,
        returnDate: new Date().toISOString()
    };

    try {
        const result = await returnsCollection.updateOne(
            { _id: orderId },
            { $set: newReturn },
            { upsert: true }
        );

        res.status(201).json({ message: 'Return submitted successfully!', returnId: orderId });
    } catch (error) {
        console.error("Error submitting return:", error);
        res.status(500).json({ message: 'Error submitting return' });
    }
});

app.get('/api/returns/:id', async (req, res) => {
    const db = client.db(dbName);
    const returnsCollection = db.collection('ReturnedItems');

    const returnId = req.params.id;

    try {
        const returnData = await returnsCollection.findOne({ _id: returnId });

        if (returnData) {
            res.json(returnData);
        } else {
            res.status(404).json({ message: "Return not found" });
        }
    } catch (error) {
        console.error("Error retrieving return:", error);
        res.status(500).json({ message: 'Error retrieving return' });
    }
});

app.delete('/api/returns/:id', async (req, res) => {
    const db = client.db(dbName);
    const returnsCollection = db.collection('ReturnedItems');

    const returnId = req.params.id;

    try {
        const result = await returnsCollection.deleteOne({ _id: returnId });

        if (result.deletedCount > 0) {
            res.json({ message: "Return deleted successfully" });
        } else {
            res.status(404).json({ message: "Return not found" });
        }
    } catch (error) {
        console.error("Error deleting return:", error);
        res.status(500).json({ message: 'Error deleting return' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
