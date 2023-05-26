const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");

const app = express();
const port = 3000;
require("dotenv").config();
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

const cors = require("cors");

app.use(cors(corsConfig));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//mongo db started

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fe7sj7v.mongodb.net/?retryWrites=true&w=majority`;

// const uri ='mongodb://localhost:27017/content'

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toysCollection = client.db("zooPlayDB").collection("toys");

    //For Products
    //get a All Data
    app.get("/toys", async (req, res) => {
      const sortBy = req.query.sortBy || "price"; //
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      let query = {};
      if (req.query?.sellerEmail || req.query?.category) {
        query = req.query;
      }

      const result = await toysCollection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .toArray();

      res.send(result);
    });
    //get a single Data
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.findOne(query);
      res.send(result);
    });
    //post single products
    app.post("/toys/", async (req, res) => {
      const data = req.body;

      const result = await toysCollection.insertOne(data);
      res.send(result);
    });
    //post Delete products
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    //update data
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = {
        $set: {
          price: data.price,
          quantityAvailable: data.quantityAvailable,
          description: data.description,
        },
      };
      const result = await toysCollection.updateOne(query, updatedToy, options);
      res.send(result);
    });
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
