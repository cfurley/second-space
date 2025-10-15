class Theme {
  constructor({
    id = null,
    name,
    description,
    background_color,
    main_color,
    caret_color,
    sub_color,
    sub_alt_color,
    text_color,
    error_color,
    error_extra_color,
    colorful_error_color,
    colorful_error_extra_color,
    create_date_utc,
    update_date_utc = null,
    delete_date_utc = null,
    deleted = 0,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.background_color = background_color;
    this.main_color = main_color;
    this.caret_color = caret_color;
    this.sub_color = sub_color;
    this.sub_alt_color = sub_alt_color;
    this.text_color = text_color;
    this.error_color = error_color;
    this.error_extra_color = error_extra_color;
    this.colorful_error_color = colorful_error_color;
    this.colorful_error_extra_color = colorful_error_extra_color;
    this.create_date_utc = create_date_utc;
    this.update_date_utc = update_date_utc;
    this.delete_date_utc = delete_date_utc;
    this.deleted = deleted;
  }
}

/**
 * Factory function to map a raw JSON object into a Media model
 * @param {Object} json
 * @returns {Theme}
 */
function fromJson(json) {
  return new Theme(json);
}

export default {
  Theme,
  fromJson,
};
