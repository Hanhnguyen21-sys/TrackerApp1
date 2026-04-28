export const sendSuccess = (res, payload = {}, message = "Success", status = 200) => {
  const body = { success: true, message, ...payload };
  return res.status(status).json(body);
};

export const sendError = (res, message = "Server error", status = 500, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};
