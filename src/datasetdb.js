import fs from 'fs';
import clients from './dbclient.js';
import { ObjectId } from 'mongodb';
import { start } from 'repl';
const { client1, client2 } = clients;

var collectiondb;
async function getAllCollections() {
  try {
    collectiondb = {};
    const collections1 = await client1.db('weibodataset1').listCollections().toArray();
    const collectionNames1 = collections1.map((collection) => collection.name);
    collectiondb['weibodataset1'] = collectionNames1;
    const collections2 = await client2.db('weibodataset2').listCollections().toArray();
    const collectionNames2 = collections2.map((collection) => collection.name);
    collectiondb['weibodataset2'] = collectionNames2;
    return collectionNames1.concat(collectionNames2);
  } catch (error) {
    console.error('Unable to get collections:', error);
    return [];
  }
}

async function getCollectionData(collectionName, year, month) {
  try {
    var db;
    for (let dbName in collectiondb) {
      if (collectiondb[dbName].includes(collectionName)) {
        db = dbName;
        break;
      }
    }
    var data;
    if (db == 'weibodataset1') {
      data = client1.db(db).collection(collectionName);
    } else if (db == 'weibodataset2') {
      data = client2.db(db).collection(collectionName);
    }
    // Find all objects in the collection
    var dataArray;
    var startDate;
    var endDate;
    if (year === 'undefined' && month === 'undefined') {
      dataArray = await data.find().toArray();
      return dataArray;
    } else if (year != 'undefined' && month === 'undefined') {
      startDate = new Date(`${year}-01-01T00:00:00Z`);
      endDate = new Date(`${year}-12-31T23:59:59Z`);
    } else if (year != 'undefined' && month != 'undefined') {
      let formatedStartMonth = month.toString().padStart(2, '0');
      let endMonth = Number(month) + 1;
      let formatedEndMonth = endMonth.toString().padStart(2, '0');

      if (endMonth == 13) {
        startDate = new Date(`${year}-${formatedStartMonth}-01T00:00:00Z`);
        endDate = new Date(`${Number(year) + 1}-01-01T00:00:00Z`);
      } else {
        startDate = new Date(`${year}-${formatedStartMonth}-01T00:00:00Z`);
        endDate = new Date(`${year}-${formatedEndMonth}-01T00:00:00Z`);
      }
    }
    dataArray = await data
      .find({
        created_at: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();
    return dataArray;
  } catch (error) {
    console.error('Unable to get the database!', error);
    return false;
  }
}

async function getLdaData(topic, year, month) {
  try {
    const result = await client1
      .db('weibodataset1')
      .collection('lda_json')
      .findOne({ _id: `${topic}_${year}_${month}` });
    if (result) {
      // console.log('Found document:', result);
      return result;
    } else {
      console.log('Document not found.');
      return false;
    }
  } catch (error) {
    console.error('Unable to get the database!', error);
    return false;
  }
}

export default { getCollectionData, getAllCollections, getLdaData };
