const router = require('express').Router();
const Post = require('../model/Post');
const multer = require('multer');
const checkJWT = require('../middleware/checkjwt');
const faker = require('faker');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/posts');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5
        },
    fileFilter: fileFilter
});

router.route('/posts')
    .get(checkJWT, (req, res, next) => {
        Post.find({ owner: req.decoded.user._id })
            .populate('owner')
            .exec((error, posts) => {
                if (posts) {
                    res.json({
                        success: true,
                        message: "Posts",
                        posts: posts
                    });
                }
            });
    })
    .post([checkJWT, upload.single('blog_picture')], (req, res, next) => {
        // console.log(req.file);
        const post = new Post();
        const url = req.protocol + '://' + req.get('host');
        post.owner = req.decoded.user._id;
        post.title = req.body.title;
        post.description = req.body.description;
        post.image = url + '/uploads/posts/' + req.file.filename;
        post.save();
        res.json({
            success: true,
            message: 'Successfully Added the post',
            post: post
        });
    });

router.post('/editpost/:id', [checkJWT, upload.single('blog_picture')], (req, res, next) => {
    const url = req.protocol + '://' + req.get('host');
    Post.findOne({ _id: req.params.id }, (err, post) => {
        if (err) return next(err);
        if (req.body.title) post.title = req.body.title;
        if (req.body.description) post.description = req.body.description;
        if (req.file) {
            if (req.file.filename) post.image = url + '/uploads/posts/' + req.file.filename;
        }
        post.save();
        res.json({
            success: true,
            message: 'Successfully Edited the post'
        });
    });
});

router.delete('/postDelete/:id', checkJWT, (req, res, next) => {
    Post.findOne({ _id: req.params.id }, (err, post) => {
        if (err) return next(err);
        if (post != null) {
            post.delete();
            res.json({
                success: true,
                message: 'Successfully Deleted the post'
            });
        } else {
            res.json({
                success: false,
                message: 'There is no such post'
            });
        }
    });
});

// router.route('/editpost')
//     .post(upload.single('blog_picture'), (req, res, next) => {
//         const url = req.protocol + '://' + req.get('host');

//         Post.findOne({ _id: req.decoded.post._id }, (err, post) => {
//             if (err) return next(err);
//             if (req.body.title) post.title = req.body.title;
//             if (req.body.description) post.description = req.body.description;
//             if (req.file.filename) post.image = url + '/uploads/posts/' + req.file.filename;

//             post.save();
//             res.json({
//                 success: true,
//                 message: 'Successfully Added the post'

//             });
//         });
//     });
// // Teststing
// router.get('/faker/test/', (req, res, next) => {
//     for (i = 0; i < 30; i++) {
//         const post = new post();
//         post.owner = '5d15ddb0b957a02a58a51bbf';
//         post.category = '5d1735da5a52881a3c257383';
//         post.title = faker.commerce.postName();
//         post.price = faker.commerce.price();
//         post.description = faker.lorem.words();
//         post.image = faker.image.food();
//         post.save();
//     }
//     res.json({
//         success: true,
//         message: 'Successfully Added the post'

//     });
// });
module.exports = router;
