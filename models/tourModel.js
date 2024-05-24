const mongoose = require('mongoose');


const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      minLength: [6, 'A tour name must contain at least 6 Characters'],
      maxLength: [40, 'A tour name must contain less than 41 characters'],
      unique: true
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maximum Group Size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty Level'],
      enum: {
        values: ['easy', 'difficult', 'medium'],
        message: 'Tour must have a difficulty of either: Easy, Medium or Difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      required: [true, 'A tour must have a Rating Average'],
      min: [1, 'A rating must have a minimum of 1'],
      max: [5, 'A rating must have a maximum of 5']
    },
    ratingsQuantity: {
      type: Number,
      required: [true, 'A tour nust have a rating Quantity'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    summary: {
      type: String,
      required: [true, 'A summary is required'],
    },
    description: {
      type: String,
      required: [true, 'Tour Description is required'],
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required: [true, 'A tour must have at least one guide'],
      }
    ],
    imageCover: {
      type: String,
      default: 'default-img.jpg',
    },
    images: {
      type: Array,
      default: [],
    },
    startDates: [Date],
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function(val){
          return val <= this.price
        },
        message: 'Discount price ({VALUE}) cannot be greater than price'
      }
    },
    locations: {
      type: [
        {
          coordinates: [Number],
          address: String,
          description: String,
          day: {
            type: Date,
            default: Date.now(),
          },
        }
      ],
      required: [true, 'A tour must have at least one location'],
    },
    slug: String,
    secret: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});
// Document Middleware. runs before the .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase();
  next();
});

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

module.exports = mongoose.model('Tours', tourSchema);
