class Space {
  constructor({}) {
    this.id = id;
    this.created_by_user_id = created_by_user_id;
    this.title = title;
    this.icon = icon;
    this.create_date_utc = create_date_utc;
    this.update_date_utc = update_date_utc;
    this.delete_date_utc = delete_date_utc;
    this.deleted = deleted;
    this.containers = containers;
    this.order = order;
    this.view_count = view_count;
    this.last_viewed_date_utc = last_viewed_date_utc;
    this.space_viewing_history = space_viewing_history;
    this.shared_spaces = shared_spaces;
    this.shared_spaces_permission_log = shared_spaces_permission_log;
  }
}

/**
 * Populate containers after object creation
 * @param {List}
 */
function addContainers(containers) {
  this.containers = containers;
}

/**
 * Populate space viewing history after object creation
 * @param {List}
 */
function addViewingHistory(space_viewing_history) {
  this.space_viewing_history = space_viewing_history;
}

/**
 * Populate shared spaces information after object creation
 * @param {List}
 */
function addSharedSpaces(shared_spaces) {
  this.shared_spaces = shared_spaces;
}

/**
 * Populate shared spaces permission logs after object creation
 * @param {List}
 */
function addSharedPermissionLog(shared_spaces_permission_log) {
  this.shared_spaces_permission_log = shared_spaces_permission_log;
}

/**
 * Factory function to map a raw JSON object into a Space model
 * @param {Object} json
 * @returns {Space}
 */
function fromJson(json) {
  return new Space(json);
}

export default {
  Space,
  fromJson,
  addSharedPermissionLog,
  addSharedSpaces,
  addViewingHistory,
  addContainers,
};
