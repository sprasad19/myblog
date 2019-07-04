const mongoose = require('mongoose');
const deepPopulate = require('mongoose-deep-populate')(mongoose);
const Schema = mongoose.Schema;
const PostSchema = new Schema({

    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    image: { type: String, required: true },
    title: String,
    description: String,
    
    created: { type: Date, default: Date.now }
  }, {
      toObject: { virtuals: true },
      toJSON: { virtuals: true }
    });
  
  PostSchema
    .virtual('averageRating')
    .get(function () {
      var rating = 0;
      if (this.reviews.length == 0) {
        rating = 0;
      } else {
        this.reviews.map((review) => {
          rating += review.rating;
        });
        rating = rating / this.reviews.length;
      }
     return rating;
    })
  PostSchema.plugin(deepPopulate);
  module.exports = mongoose.model('Post', PostSchema);
  