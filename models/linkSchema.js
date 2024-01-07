const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  url: String,
  type: String,
  userHistory: [String], 
});

const Link = mongoose.model('Link', linkSchema);

module.exports = { Link };
