const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const multer = require('multer');

const io = require('./socket');
const messageRoutes = require('./routes/message');
const groupRoutes = require('./routes/group');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const meetingRoutes = require('./routes/meeting');
const commentRoutes = require('./routes/comment');
const issueRoutes = require('./routes/issue');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}-puhqm.gcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const storage = multer.diskStorage({
  destination: 'files',
  filename: (req, file, cb) => {
    cb(null, `${new Date().getTime().toString()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Files Parser
app.use(multer({
  storage,
  fileFilter,
  limits: { fieldSize: 5 * 1024 * 1024 }
}).array('files', 4));

app.use('/files', express.static(path.join(__dirname, 'files')));

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
app.use(meetingRoutes);
app.use(commentRoutes);
app.use(issueRoutes);

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
