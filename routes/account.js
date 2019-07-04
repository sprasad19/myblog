const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../model/User');
const checkJwt = require('../middleware/checkjwt');



// const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//       cb(null, 'uploads/profile');
//   },
//   filename: function (req, file, cb) {
//       cb(null, Date.now().toString() + file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//       cb(null, true);
//   } else {
//       cb(null, false);
//   }
// };

// const upload = multer({
//   storage,
//   limits: {
//       fileSize: 1024 * 1024 * 5
//   },
//   fileFilter: fileFilter
// });



router.post('/signup', (req, res, next) => {
    const user = new User(req.body);
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.picture = req.body.picture;
    user.gender = req.body.gender;
    user.dob = req.body.dob;
    User.findOne({ email: req.body.email }, (err, existingUser) => {

        if (existingUser) {
            res.json({
                success: false,
                message: 'Email alredy registered !!'
            })
        } else {
            user.save();

            var token = jwt.sign({ user: user }, config.secret, { expiresIn: '7d' });
            res.json({
                success: true,
                message: 'Your Token',
                token: token
            });
        }
    });
});


router.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) throw err;
  
      if (!user) {
        res.json({
          success: false,
          message: 'Invalid Email Address'
        });
      } else if (user) {
        var validPassword = user.comparePassword(req.body.password);
        if (!validPassword) {
          res.json({
            success: false,
            message: 'Invalid Password'
          });
        }
        else {
          var token = jwt.sign({ user: user }, config.secret, { expiresIn: '7d' });
          res.json({
            success: true,
            message: ' ',
            token: token
          });
        }
      }
    });
  });
  

  
router.route('/profile')
.get(checkJwt, (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    res.json({
      success: true,
      user: user,
      message: "Successfull"
    });
  });
})
.post(checkJwt, (req, res, next) => {
  User.findOne({ _id: req.decoded.user._id }, (err, user) => {
    if (err) return next(err);
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.picture) user.picture = req.body.picture;
    if (req.body.dob) user.dob = req.body.dob;    
    user.save();
    res.json({
      success: true,
      message: 'Successfully edited your profile'
    });
  });
});


module.exports = router;
