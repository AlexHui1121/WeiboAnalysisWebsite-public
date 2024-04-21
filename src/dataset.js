import express from 'express';
import multer from 'multer';
import dataset1fucntions from './datasetdb.js';
import { Collection } from 'mongodb';
const { getCollectionData, getAllCollections, getLdaData } = dataset1fucntions;

const router = express();
const form = multer();

router.get('/collectionslist', async (req, res) => {
  try {
    const collections = await getAllCollections();
    res.json(collections);
  } catch (error) {
    console.error('Error retrieving collections:', error);
    res.status(500).json({ error: 'Unable to retrieve collections' });
  }
});

router.get('/topicdata/:topic/:year/:month', async (req, res) => {
  const topicName = req.params.topic;
  const year = req.params.year;
  const month = req.params.month;
  if (!topicName) {
    res.status(400).json({
      status: 'failed',
      message: 'Topic name is required!',
    });
    return;
  }
  const data = await getCollectionData(topicName, year, month);
  if (data) {
    res.json({
      status: 'success',
      data,
    });
  } else {
    res.status(400).json({
      status: 'failed',
      message: 'Unable to get the database!',
    });
  }
});

router.get('/ldaresult/:topic/:year/:month', async (req, res) => {
  const topicName = req.params.topic;
  const year = req.params.year;
  const month = req.params.month;
  if (!topicName) {
    res.status(400).json({
      status: 'failed',
      message: 'Collection name is required!',
    });
    return;
  }
  const data = await getLdaData(topicName, year, month);
  // console.log(data);
  if (data) {
    res.json({
      status: 'success',
      data,
    });
  } else {
    res.status(400).json({
      status: 'failed',
      message: 'Unable to get the database!',
    });
  }
});

export default router;
