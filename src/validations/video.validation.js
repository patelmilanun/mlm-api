const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createVideo = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    // videos: Joi.array().items(Joi.custom(objectId)),
  }),
};

const getVideos = {
  query: Joi.object().keys({
    title: Joi.string(),
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
      title: Joi.string().required(),
      description: Joi.string().required(),
      // videos: Joi.array().items(Joi.custom(objectId)),
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
