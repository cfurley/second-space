class User {
  constructor({
    id = null,
    username,
    password,
    display_name = null,
    profile_picture_id = null,
    theme_id = 1,
    first_name,
    last_name,
    full_name = first_name + last_name,
    timezone = "America/Chicago",
    last_login_date_utc = null,
    create_date_utc, // Add time.now library call
    update_date_utc = null,
    delete_date_utc = null,
    deleted = 0,
  }) {
    this.id = id;
    this.username = username;
    this.password = password;
    this.display_name = display_name;
    this.profile_picture_id = profile_picture_id;
    this.theme_id = theme_id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.full_name = full_name;
    this.timezone = timezone;
    this.last_login_date_utc = last_login_date_utc;
    this.create_date_utc = create_date_utc;
    this.update_date_utc = update_date_utc;
    this.delete_date_utc = delete_date_utc;
    this.deleted = deleted;
  }
}

/**
 * Factory function to map a raw JSON object into a Media model
 * @param {Object} json
 * @returns {User}
 */
function fromJson(json) {
  return new User(json);
}

export default {
  User,
  fromJson,
};
