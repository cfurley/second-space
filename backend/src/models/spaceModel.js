/*
In theory this will, by default, be built with the minimal info from DB.
Containers, space_viewing_history, shared_viewing_history, etc, can be 
added later in raw JSON. Ultimately if we need to start treating
these as objects we can take in raw json and create objects
using the container model's "fromJson()" function. 

Okay fine we should be giving lists of container objects lol
*/
class Space {
  constructor({
    id = null,
    created_by_user_id,
    title,
    icon = null,
    create_date_utc = null,
    update_date_utc = null,
    delete_date_utc = null,
    deleted = 0,
    containers = null,
    order = null,
    view_count = 1,
    last_viewed_date_utc = null,
    space_viewing_history = null,
    shared_spaces = null,
    shared_spaces_permission_log = null,
  }) {
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
 * Populate containers after object creation using JSON
 * @param {Array}
 */
function addContainers(containers) {
  this.containers = containers;
}

/**
 * Populate space viewing history after object creation using JSON.
 * @param {Array}
 */
function addViewingHistory(space_viewing_history) {
  this.space_viewing_history = space_viewing_history;
}

/**
 * Populate shared spaces information after object creation using JSON.
 * @param {Array}
 */
function addSharedSpaces(shared_spaces) {
  this.shared_spaces = shared_spaces;
}

/**
 * Populate shared spaces permission logs after object creation using JSON.
 * @param {Array}
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
