const { MongoClient, ServerApiVersion } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

console.log(process.env.USER);

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
  try {
    const db = await connect();
    const collection = db.collection(entityName);
    const existingDocument = await collection.findOne({ _id: data._id });
    if (existingDocument) {
      console.log(
        `Document with _id: ${
          data._id
        } already exists in ${entityName.toUpperCase()} collection`
      );
      await update(data._id, data, entityName).then(() =>
        console.log("updated")
      );
      return;
    }
    await collection.insertOne(data);
    console.log(`${data.name} added to ${entityName.toUpperCase()} collection`);
  } catch (error) {
    console.log("Database'e aktarım yaparken hata oluştu:", data.name, error);
  }
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

async function update(id, dat, type) {
  try {
    const db = await connect();
    const { _id, ...data } = dat;
    const collection = db.collection(type);
    const query = { _id: id };
    const update = {
      $set: { ...data },
    };
    console.log("data set");
    await collection.updateOne(query, update);
  } catch (error) {
    console.log("An error occured while updating data: ", error);
  }
}

module.exports = {
  insert,
  update,
  setCaptain,
};
