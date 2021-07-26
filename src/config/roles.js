const roles = ['user', 'admin', 'guest'];

const roleRights = new Map();
roleRights.set(roles[0], ['getCourses', 'getVideos']);
roleRights.set(roles[1], ['getUsers', 'manageUsers', 'getCourses', 'manageCourses', 'getVideos', 'manageVideos']);
roleRights.set(roles[2], []);

module.exports = {
  roles,
  roleRights,
};
