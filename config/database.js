const mongoose=require("mongoose");

const MONGO_URI= process.env.MONGO_URI;

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(process.env.MONGO_URI, {
    //   useNewUrlParser: true,
      useUnifiedTopology: true,
    //   useCreateIndex: true,
    //   useFindAndModify: false,
    })
    .then(() => {
      console.log("Successfully connected to database MONGOSE"+ MONGO_URI);
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};