export const errorHandler = (err, req, res, next) => {
    console.error(err); // log dev

    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // lỗi không xác định
    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};
