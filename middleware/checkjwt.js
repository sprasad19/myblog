const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function (req, res, next) {
    const token = req.headers["authorization"]
    if (token) {
      jwt.verify(token, config.secret, function (err, decoded) {
        if (err) {
          res.json({
            sucess: false,
            message: 'Failed to authenticate'
          });
        }
        else {
          req.decoded = decoded;
          next();
        }
      });
    }
    else{
      res.status(403).json({
        sucess:false,
        message: 'No token provided '
      })
    }
  }
  