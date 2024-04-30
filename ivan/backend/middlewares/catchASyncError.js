// module.exports = func => (req, res, next) =>
//     Promise.resolve(func(req, res, next))
//            .catch(next);

const catchASyncErrors = (func) => (req, res, next) => Promise.resolve(func(req, res, next)).catch(next);

module.exports = catchASyncErrors;