const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@footballdb.s2poutx.mongodb.net/?retryWrites=true&w=majority&appName=FootballDB`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let database;

async function connect() {
  if (!database) {
    await client.connect();
    console.log("Connected to MongoDB");
    database = client.db("Football");
  }
  return database;
}

connect();

async function insert(entityName, data) {
  const db = await connect();
  const collection = db.collection(entityName);
  await collection.insertOne(data);
  console.log(
    `${entityName.slice(0, -1)} added to ${entityName.toUpperCase()} collection`
  );
}

async function setCaptain(team_id, player_id) {
  const db = await connect();
  const collection = db.collection("teams");
  const query = { _id: team_id };

  const update = {
    $set: { captain_id: player_id },
  };

  await collection.updateOne(query, update);
}

module.exports = {
  insert,
  setCaptain,
};
