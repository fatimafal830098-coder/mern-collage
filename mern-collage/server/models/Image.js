const  mongoose = require ('mongoose');

const imageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 80,
  },
  description: {
    type: String,
    default: "",
    trim: true,
    maxlength:240,
  },
  tags: {
    type: [String],
    default: [],
    validate: [
      function (val) {
        return val.length <= 5;
      },
      "Tags limit is 5",
    ],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports= mongoose.model('Image', imageSchema);