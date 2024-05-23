const mongoose = require('mongoose');


const sessionSchema = new mongoose.Schema(
  {
    jtok: {
      type: String,
      required: [true, 'A Session must have a JWT'],
    },
    ip: {
      type: String,
      required: [true, 'A Session must have an IP Address'],
    },
    valid: {
      type: Boolean,
      default: true,
    },
    device: {
      type: String,
      required: [true, 'A Session must have a Device'],
    },
    email: {
      type: String,
      required: [true, 'A Session must have an Email'],
    },
    date: {
      type: Date,
      default: Date.now(),
    }
  },
);

sessionSchema.pre(/^find/, function (next) {
  this.find({ valid: true });
  next();
})

module.exports = mongoose.model('Sessions', sessionSchema);
