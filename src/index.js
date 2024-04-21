import express from 'express';
import multer from 'multer';
import session from 'express-session';
import db from './dataset.js';
import MongoStore from 'connect-mongo';
const app = express();
const store = new MongoStore({
  mongoUrl: 'mongodb+srv://user:user@session.sm93rev.mongodb.net/?retryWrites=true&w=majority&appName=session',
  dbName: 'session',
  collectionName: 'session',
});
app.use(
  session({
    secret: 'weiboanalysiswebsite',
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // maxAge: 60 * 60 * 1000, // Set the idle timeout (60 minutes in this example)
      maxAge: 24 * 60 * 60 * 1000, // Set the idle timeout (60 minutes in this example)
    },
  })
);

app.use('/', express.static('static'));

app.use('/db', db);

app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

app.listen(8080, () => {
  const currentDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Hong_Kong',
    hour12: false,
  });
  console.log(currentDate);
  console.log('Server started at http://127.0.0.1:8080');
});
