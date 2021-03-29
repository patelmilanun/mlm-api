const roles = ['user', 'admin'];

const roleRights = new Map();
roleRights.set(roles[0], ['getCourses']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'getCourses', 'manageCourses', 'getVideos', 'manageVideos']);

module.exports = {
  roles,
  roleRights,
};
