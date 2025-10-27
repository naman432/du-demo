const jwt = require("jsonwebtoken");
const { error } = require("../ApiResponse/apiResponse");
const User = require("../Models/User/user");
async function tokenUserAuthorisation(req, res, next) {
  const token = req.header("x-auth-token-user");
  if (!token)
    return res
      .status(401)
      .json(error("Access Denied. No token provided.", res.statusCode));
  try {
    const decoded = jwt.verify(token, "ultra-security");
    req.user = decoded;
    const user = await User.findById(req.user._id);
    if (!user.status) {
      return res
        .status(401)
        .json(error("You are not authorized", res.statusCode));
    }
    next();
  } catch (ex) {
    console.log(ex);
    return res
      .status(401)
      .json(error("You are not Authenticated", res.statusCode));
  }
}
module.exports = tokenUserAuthorisation;
