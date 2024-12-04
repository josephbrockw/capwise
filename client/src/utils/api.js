class ApiError extends Error {
  constructor(message, type = 'API_ERROR', statusCode = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

export const handleApiResponse = async (response) => {
  if (!response) {
    throw new ApiError('Network error occurred', 'NETWORK_ERROR');
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new ApiError('Invalid response format', 'PARSE_ERROR');
  }

  if (!response.ok || data.error) {
    throw new ApiError(
      data.error || `Request failed with status ${response.status}`,
      'API_ERROR',
      response.status
    );
  }

  return data;
};

export const makeApiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 'NETWORK_ERROR');
  }
};

export { ApiError };
