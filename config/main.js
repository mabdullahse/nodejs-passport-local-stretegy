 
module.exports = {

  mongoose: {
    url: process.env.DB_STRING,
    port: process.env.PORT,
    options: { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

};

