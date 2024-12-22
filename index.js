const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

// create app
const port = process.env.PORT || 7000;
const app = express();

// uses
app.use(cors());
app.use(express.json());

// setup mongo db

//
const uri = `mongodb+srv://${process.env.MONGO_ID}:${process.env.MONGO_PASS}@cluster0.faqkm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const volunteerCollection = client
  .db("VolunteerCollection")
  .collection("volunteers");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });

    // set all volunteers
    app.post("/all-volunteers", async (req, res) => {
      const volunteerData = req.body;
      const result = await volunteerCollection.insertOne(volunteerData);
      res.send(result);
    });

    // get volunteers using sort and limits

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// basic server starting
app.get("/", (req, res) => {
  res.send("Hello from a11 Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
