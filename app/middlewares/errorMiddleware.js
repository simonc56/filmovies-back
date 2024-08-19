// eslint-disable-next-line no-unused-vars
export default (err, req, res, next) => {
  let { status, message } = err;
  const { code } = err;
  if (code === "23505") {
    status = 400;
    message = "Resource already exists";
  }
  if (!status) {
    status = 500;
  }
  if (status === 500) {
    console.error(err);
    message = "Internal Server Error";
  }
  if (res.format === "html") {
    return res.status(status).render("error", {
      httpStatus: status,
      message,
    });
  }
  // TokenExpiredError from jsonwebtoken
  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }
  // return the error message in json format
  return res.status(status).json({ status: "fail", error: message });
};
