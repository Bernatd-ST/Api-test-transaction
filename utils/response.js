const successResponse = (res, message, data = null) => {
    return res.json({
        status: 0, // status 0 untuk sukses
        message,
        data 
    });
};

const errorResponse = (res, statusCode, message, data = null) => {
    return res.status(getHttpStatus(statusCode)).json({
        status: statusCode,
        message,
        data
    });
};

// mapping status code ke http satus

const getHttpStatus = (apiStatus) => {

    switch (apiStatus) {
      case 102: // Validation error
      case 103: // Invalid credentials
        return 400;
      case 108: // Invalid/expired token
        return 401;
      default:
        return 500;
    }
};

module.exports = {
    successResponse,
    errorResponse
};
