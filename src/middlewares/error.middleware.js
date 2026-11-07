const ApiError = require("../errors/api-error");

function notFound(req, res, next) {
    next(new ApiError(404, "Resource not found"));
}

function errorHandler(err, req, res, _next) {
    const status = err.statusCode || err.status || 500;
    res.status(status).json({
        message: status === 500 ? "Internal Server Error" : err.message,
    });
}

module.exports = { notFound, errorHandler };
