const AppError = require('./appError');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['sort', 'page', 'fields', 'limit'];
    excludedFields.map((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|regex)\b/g,
      (match) => `$${match}`,
    );

    if (this.queryString.slug) {
      this.queryString.slug['regex'] =
        this.queryString.slug.regex.toLowerCase();
    }

    this.query = this.query.find(JSON.parse(queryString));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const { sort } = this.queryString;
      let sortString = JSON.stringify(sort);
      sortString = sortString.replace(/\b(,)\b/g, (match) => ' ');
      this.query = this.query.sort(JSON.parse(sortString));
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = 3;
    if (isNaN(page)) {
      const err = new AppError('The page must be a number', 400);
      next(err);
    }
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const { fields } = this.queryString;
      let sortString = JSON.stringify(sort);
      sortString = sortString.replace(/\b(,)\b/g, (match) => ' ');
      this.query = this.query.sort(JSON.parse(sortString));
    }

    return this;
  }

  alias(next) {
    if (this.queryString.limit) {
      const { limit } = this.queryString;
      const number = Number(limit);
      if (isNaN(number)) {
        const err = new AppError(
          'The product limit must be a number',
          400,
        );
        next(err);
      }
      this.query = this.query.skip(0).limit(number);
    }

    return this;
  }

  aggregateDifficulty() {
    this.query = this.query.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$ratingsAverage' },
          numTours: { $sum: 1 },
          totalPrice: { $sum: '$price' },
        },
      },
    ]);

    return this;
  }

  aggregateMonthly() {
    this.query = this.query.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${this.queryString.year}-01-01`),
            $lte: new Date(`${this.queryString.year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          tourNumber: { $sum: 1 },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          tourNumber: 1,
        },
      },
    ]);
    return this;
  }
}

module.exports = APIFeatures;
