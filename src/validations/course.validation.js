const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCourse = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    thumbnail: Joi.string().uri().required(),
    views: Joi.number().integer().required(),
    duration: Joi.number().integer().required(),
    videos: Joi.array().items(Joi.custom(objectId)),
  }),
};

const getCourses = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId),
  }),
};

const updateCourse = {
  params: Joi.object().keys({
    courseId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string(),
      description: Joi.string(),
      views: Joi.number().integer(),
      duration: Joi.number().integer(),
      videos: Joi.array().items(Joi.custom(objectId)),
    })
    .min(1),
};

const deleteCourse = {
  params: Joi.object().keys({
    courseId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
