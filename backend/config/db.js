const mongoose = require("mongoose");

exports.connectDB = () => {
  mongoose
    .connect(process.env.MONGO_DB_URI, {
      useNewUrlParser: true,
    })
    .then((con) => {
      console.log(`MongoDB connected with HOST: ${con.connection.host}`);
    })
    .catch((err) => {
      console.log(err);
    });
};
