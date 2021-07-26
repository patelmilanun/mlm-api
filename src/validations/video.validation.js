const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createVideo = {
  body: Joi.object().keys({
    duration: Joi.number().integer().required(),
    videoUrl: Joi.string().uri().required(),
    captionUrl: Joi.string(),
    courseId: Joi.string().custom(objectId),
  }),
};

const getVideos = {
  query: Joi.object().keys({
    courseId: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getVideo = {
  params: Joi.object().keys({
    videoId: Joi.string().custom(objectId),
  }),
};

const updateVideo = {
  params: Joi.object().keys({
    videoId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      duration: Joi.number().integer(),
      videoUrl: Joi.string(),
      captionUrl: Joi.string(),
      courseId: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteVideo = {
  params: Joi.object().keys({
    videoId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
};
