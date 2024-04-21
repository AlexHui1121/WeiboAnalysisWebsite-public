import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.js';
const connect_uri1 = config.CONNECTION_STR1;
const connect_uri2 = config.CONNECTION_STR2;

const client1 = new MongoClient(connect_uri1, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const client2 = new MongoClient(connect_uri2, {
  connectTimeoutMS: 2000,
  serverSelectionTimeoutMS: 2000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function connect() {
  try {
    await client1.connect();
    // Test the connection using client.db().command()
    await client1.db('weibodataset1').command({ ping: 1 });
    console.log('Successfully connected to the database1!');

    await client2.connect();
    // Test the connection using client.db().command()
    await client2.db('weibodataset2').command({ ping: 1 });
    console.log('Successfully connected to the database2!');
  } catch (error) {
    console.error(error + 'Unable to establish connection to the database!');
    process.exit(1);
  }
}
connect().catch(console.dir);
export default { client1, client2 };
