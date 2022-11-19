/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const authMiddleware = require("./authMiddleware");

const express = require("express");
const app = express();
const db = admin.firestore();

const cors = require("cors");
app.use(cors({origin: true}));

// app.use(authMiddleware);


// Create
// Post
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      // eslint-disable-next-line max-len
      const dbref = db.collection("users").doc(req.body.email);
      dbref.update({
        savedShows: admin.firestore.FieldValue.arrayUnion({
          id: req.body.id,
          img: req.body.img,
          link: req.body.link,
          title: req.body.title,
        })});
      // eslint-disable-next-line max-len
      return res.status(201).send({status: "Success", msg: "Data Added Succesfully!"});
    } catch (error) {
      console.log(error);
      res.status(500).send({status: "Failed to add the Data!", msg: error});
    }
  })();
});

// Read
// Get
app.get("/read-data/:email", async (req, res) =>{
  const email = req.params.email;
  db.collection("users").doc(email).get().then((doc) => {
    if (doc.exists) {
      return res.status(200).send(doc.data());
    } else {
      return res.status(200).send("No such user exist!");
    }
  }).catch((error) => {
    return res.status(200).send("Failed to read the Data!");
  });
});


app.get("/read-data/", async (req, res) =>{
  const email = req.body.email;
  db.collection("users").doc(email).get().then((doc) => {
    if (doc.exists) {
      return res.status(200).send(doc.data());
    } else {
      return res.status(200).send("No such user exist!");
    }
  }).catch((error) => {
    return res.status(200).send("Failed to read the Data!");
  });
});
// Update
// Put
app.put("/api/update", (req, res) => {
  (async () => {
    try {
      // eslint-disable-next-line max-len
      const dbref = db.collection("users").doc(req.body.email);
      dbref.update({
        savedShows: admin.firestore.FieldValue.arrayRemove({
          id: req.body.id,
          img: req.body.img,
          link: req.body.link,
          title: req.body.title,
        })});
      // eslint-disable-next-line max-len
      return res.status(200).send({status: "Success", msg: "Data Updated Succesfully!"});
    } catch (error) {
      console.log(error);
      res.status(500).send({status: "Failed to update the Data!", msg: error});
    }
  })();
});

// Delete
// Delete
app.delete("/delete-data", (req, res) =>{
  const email = req.body.email;
  db.collection("users").doc(email).delete().then(() => {
    return res.status(200).send("Document Deleted Sucessfully!");
  }).catch((error) => {
    return res.status(200).send("Failed to delete the Data!");
  });
});

// Authotized Api

app.get("/:email", authMiddleware, async (req, res) => {
  const email = req.params.email;
  db.collection("users").doc(email).get().then((doc) => {
    if (doc.exists) {
      return res.status(200).send(doc.data());
    } else {
      return res.status(200).send("No such user exist!");
    }
  }).catch((error) => {
    return res.status(200).send("Failed to read the Data!");
  });
});

app.get("/:id", authMiddleware, async (req, res) => {
  const snapshot = await admin.firestore().collection("users").doc(req.params.id).get();

  const userId = snapshot.id;
  const userData = snapshot.data();

  res.status(200).send(JSON.stringify({id: userId, ...userData}));
});

app.post("/:email/:id/:img/:link/:title", authMiddleware, async (req, res) => {
  try {
    // eslint-disable-next-line max-len
    const dbref = db.collection("users").doc(req.params.email);
    dbref.update({
      savedShows: admin.firestore.FieldValue.arrayUnion({
        id: req.params.id,
        img: req.params.img,
        link: req.params.link,
        title: req.params.title,
      })});
    // eslint-disable-next-line max-len
    return res.status(201).send({status: "Success", msg: "Data Added Succesfully!"});
  } catch (error) {
    console.log(error);
    res.status(500).send({status: "Failed to add the Data!", msg: error});
  }
});

app.put("/:email/:id/:img/:link/:title", authMiddleware, async (req, res) => {
  try {
    // eslint-disable-next-line max-len
    const dbref = db.collection("users").doc(req.params.email);
    dbref.update({
      savedShows: admin.firestore.FieldValue.arrayRemove({
        id: req.params.id,
        img: req.params.img,
        link: req.params.link,
        title: req.params.title,
      })});
    // eslint-disable-next-line max-len
    return res.status(200).send({status: "Success", msg: "Data Updated Succesfully!"});
  } catch (error) {
    console.log(error);
    res.status(500).send({status: "Failed to update the Data!", msg: error});
  }
});

app.delete("/:email", authMiddleware, async (req, res) => {
  const email = req.params.email;
  db.collection("users").doc(email).delete().then(() => {
    return res.status(200).send("Document Deleted Sucessfully!");
  }).catch((error) => {
    return res.status(200).send("Failed to delete the Data!");
  });
});

// Export this api to to Firebase Cloud Functions.
exports.app = functions.https.onRequest(app);
