/**
 * Centralized API Response Format
 */

class ApiResponse {
  static success(res, statusCode = 200, message = 'Success', data = null, meta = null) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;

    return res.status(statusCode).json(response);
  }

  static error(res, statusCode = 500, message = 'Internal Server Error', errors = null) {
    const response = {
      success: false,
      message,
    };

    if (errors !== null) response.errors = errors;

    return res.status(statusCode).json(response);
  }

  static paginated(res, message, data, page, limit, total) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
