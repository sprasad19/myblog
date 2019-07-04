const router = require('express').Router();
const async = require('async');

const Post = require('../model/Post');
const checkJWT = require('../middleware/checkjwt');
const Review = require('../model/Review');


router.get('/blogs/:id', (req, res, next) => {
    Post.findById({ _id: req.params.id })      
      .populate('owner')
      .deepPopulate('reviews.owner')
      .exec((err, Post) => {
        if (err, Post) {
          if (err) {
            res.json({
              success: false,
              message: 'Post  is not found'
            });
          } else {
            if (Post) {
              res.json({
                success: true,
                Post : Post
              })
            }
          }
        }
      });
  });


  //all posts
  router.get('/blogs', (req, res, next) => {
    // const perPage = 10;
    // const page = req.query.page;
    async.parallel([
      function (callback) {
        Post.count({}, (err, count) => {
          var totalPosts = count;
          callback(err, totalPosts)
        });
      },
      function (callback) {
        Post.find({})
          // .skip(perPage * page)
          // .limit(perPage)
          .populate('owner')
          .exec((err, Posts) => {
            if (err) return next(err);
            callback(err, Posts);
          });
      }
    ], function (err, results) {
      var totalPosts = results[0];
      var Posts = results[1];
      res.json({
        success: true,
        message: 'category',
        Posts: Posts,
        totalPosts: totalPosts,
        // page: Math.ceil(totalPosts / perPage)
      });
    }
    );
  });
  
  router.post ('/review', checkJWT, (req, res, next) => {
    async.waterfall([
      function (callback) {
        Post.findOne({ _id: req.body.PostId }, (err, Post) => {
          if (Post) {
            callback(err, Post);
          }
        });
      },
      function (Post) {
        let review = new Review();
        review.owner = req.decoded.user._id;      
        if (req.body.comment) review.comment = req.body.comment;
        review.rating = req.body.rating;
        Post.reviews.push(review._id);
        Post.save();
        review.save();
        res.json({
          success: true,
          message: "Successfully added your Comment"
        })
      }
    ]);  
  });

  
  
  module.exports = router;