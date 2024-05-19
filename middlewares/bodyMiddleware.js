exports.bestCheap = (req, res, next) => {
    req.query.sort = '-ratingsAverage,price';
    req.query.limit = Number(req.query.limit) || 5
    next()
    
}