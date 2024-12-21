const express = require("express");
const cors = require("cors");

// create app
const port = process.env.PORT || 7000;
const app = express();

// uses
app.use(cors());
app.use(express.json());

// basic server starting
app.get("/", (req, res) => {
  res.send("Hello from a11 Server....");
});

app.listen(port, () => console.log(`Server running on port ${port}`));
