const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
const requestedVolunteerCollection = client
  .db("VolunteerCollection")
  .collection("Be-volunteers");

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
    // set all requested volunteers
    app.post("/requested-volunteer", async (req, res) => {
      const requestvolunteerData = req.body;
      //if a user placed a bid alrady in this jo
      const query = {
        volunteerEmail: requestvolunteerData.volunteerEmail,
        volunteerPostId: requestvolunteerData.volunteerPostId,
      };
      const alreadyExist = await requestedVolunteerCollection.findOne(query);
      if (alreadyExist) return res.status(400).send("You Allready Requested");

      const result = await requestedVolunteerCollection.insertOne(
        requestvolunteerData
      );

      // Update Volunteer Needed
      const filter = {
        _id: new ObjectId(requestvolunteerData.volunteerPostId),
      };
      const update = {
        $inc: {
          volunteersNeeded: -1,
        },
      };
      const UpadateVolunteersNeeded = await volunteerCollection.updateOne(
        filter,
        update
      );
      res.send(result);
    });

    // get volunteers using sort and limits

    app.get("/limited-volunteers", async (req, res) => {
      try {
        const result = await volunteerCollection
          .find()
          .sort({ deadline: 1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching limited volunteers:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // get all volunteer need posts
    app.get("/all-volunteers", async (req, res) => {
      const search = req.query.search;
      let query = {
        postTitle: {
          $regex: search,
          $options: "i",
        },
      };
      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    // get specific volunteer details for volunteer details page

    app.get("/volunteer-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    // get my Vlounteer need post data using email query

    app.get("/myvolunteer-needposts", async (req, res) => {
      const email = req.query.email;
      const query = { organizerEmail: email };
      const result = await volunteerCollection.find(query).toArray();
      res.send(result);
    });

    // get a specific data for update data
    app.get("/update-data/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.findOne(query);
      res.send(result);
    });

    // update a specific data

    app.put("/update-data/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const updated = {
        $set: updateData,
      };
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const result = await volunteerCollection.updateOne(
        query,
        updated,
        options
      );
      res.send(result);
    });
    // delete a data
    app.delete("/myvolunteer-needposts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await volunteerCollection.deleteOne(query);
      res.send(result);
    });

    // get data for my request for be a volunteer
    app.get("/my-request", async (req, res) => {
      const email = req.query.email;
      const query = {
        volunteerEmail: email,
      };
      const result = await requestedVolunteerCollection.find(query).toArray();
      res.send(result);
    });

    // cancel a request for manage be a volunteer
    app.delete("/my-request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestedVolunteerCollection.deleteOne(query);
      res.send(result);
    });

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
