const httpStatus = require('http-status');
const { UserStatus } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a status
 * @param {Object} statusBody
 * @returns {Promise<Status>}
 */
const createStatus = async (statusBody) => {
  const status = await UserStatus.create(statusBody);
  return status;
};

/**
 * Query for statuses
 * @param {Object} filter - Mongo filter`
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryStatuses = async (filter, options) => {
  const statuses = await UserStatus.paginate(filter, options);
  return statuses;
};

/**
 * Get status by id
 * @param {ObjectId} id
 * @returns {Promise<Status>}
 */
const getStatusById = async (id) => {
  return UserStatus.findById(id);
};

/**
 * Get status by type
 * @param {string} statusType
 * @returns {Promise<Status>}
 */
const getStatusByType = async (statusType) => {
  return UserStatus.findOne({ statusType });
};

/**
 * Update status by id
 * @param {ObjectId} statusId
 * @param {Object} updateBody
 * @returns {Promise<Status>}
 */
const updateStatusById = async (statusId, updateBody) => {
  const status = await getStatusById(statusId);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Status not found');
  }
  Object.assign(status, updateBody);
  await status.save();
  return status;
};

/**
 * Delete status by id
 * @param {ObjectId} statusId
 * @returns {Promise<Status>}
 */
const deleteStatusById = async (statusId) => {
  const status = await getStatusById(statusId);
  if (!status) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Status not found');
  }
  await status.remove();
  return status;
};

module.exports = {
  createStatus,
  queryStatuses,
  getStatusByType,
  getStatusById,
  updateStatusById,
  deleteStatusById,
};
