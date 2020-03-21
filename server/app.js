const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const io = require('./socket');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}-puhqm.gcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

//Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Extra-Headers Configuration
app.use(helmet());

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );
  next();
});

// Routes
app.use(messageRoutes);
app.use(groupRoutes);
app.use(authRoutes);
app.use(userRoutes);

// Universal Error Handling
app.use((error, req, res) => {
  const status = error.statusCode || 500;
  res.status(status).json({error});
});

// Server And Database Configuration
mongoose.connect(MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => {
  const server = app.listen(process.env.PORT || 3000);
  io.init(server);
  io.initSocket();
}).catch(err => {throw err});