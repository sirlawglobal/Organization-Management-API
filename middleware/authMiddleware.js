const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.test' });

const authMiddleware = (req, res, next) => {

  //  console.log("this is a req:" + req)
  const authHeader = req.headers['authorization'];
  

  // console.log("this is a requestHeader" + req.headers);

  const token = authHeader && authHeader.split(' ')[1];

  // const token = req.header('Authorization').replace('Bearer ', '');

  // console.log("this is a token" + token)

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access Denied' });
  }

  try {
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // console.log("this is a token....." + token)

    // console.log("this is a secret....." + process.env.JWT_SECRET)

    // console.log("this is a decoded....." + decoded)

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ status: 'error', message: 'Invalid Token' });
  }
};

module.exports = authMiddleware;
