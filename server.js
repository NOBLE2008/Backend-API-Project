const dotenv = require('dotenv');

dotenv.config();
const app = require('./index');
const dbConnect = require('./config/dbConnect');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err);
  process.exit(1);
});

//Always store sensitive info like Secret key, Database Password, API Keys in the environment variables
const connectionString = process.env.MONGODB.replace('<password>', process.env.MONGO_PASSWORD).replace('<username>', process.env.MONGO_USER);
dbConnect(connectionString)

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
