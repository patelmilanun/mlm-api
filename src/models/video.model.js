const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const videoSchema = mongoose.Schema(
  {
    duration: {
      type: Number,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    captionUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
videoSchema.plugin(toJSON);
videoSchema.plugin(paginate);

/**
 * @typedef Video
 */
const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
