var jwt=require('jsonwebtoken');

const verifyToken = (req, res, next) => {

console.log("TOKEN SECRET KEY ==> "+ process.env.TOKEN_KEY);
  const token =
    req.body.token || req.query.token || req.headers["x-api-key"];

console.log("Accesstoken==> "+ token);

  if (!token) {
    return res.status(403).json({"error":"Access token is required for authentication"});
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({"error":"Invalid Token====> "+err});
  }
  return next();
};

module.exports = verifyToken;