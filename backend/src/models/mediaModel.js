/**
 * Media model - represents media files attached to containers
 * Includes images, videos, and other file types
 */
class Media {
  constructor({
    id = null,
    container_id,
    filename,
    filepath,
    file_size,
    video_length = null,
    create_date_utc = null,
    update_date_utc = null,
    delete_date_utc = null,
    deleted = 0,
  }) {
    this.id = id;
    this.container_id = container_id;
    this.filename = filename;
    this.filepath = filepath;
    this.file_size = file_size;
    this.video_length = video_length;
    this.create_date_utc = create_date_utc;
    this.update_date_utc = update_date_utc;
    this.delete_date_utc = delete_date_utc;
    this.deleted = deleted;
  }
}

/**
 * Factory function to map a raw JSON object into a Media model
 * @param {Object} json
 * @returns {Media}
 */
function fromJson(json) {
  return new Media(json);
}

/**
 * Validate media object has required fields
 * @param {Media} media
 * @returns {Object} { valid: boolean, error: string }
 */
function validate(media) {
  if (!media.container_id) {
    return { valid: false, error: "Container ID is required" };
  }
  if (!media.filename) {
    return { valid: false, error: "Filename is required" };
  }
  if (!media.filepath) {
    return { valid: false, error: "Filepath is required" };
  }
  if (!media.file_size || media.file_size <= 0) {
    return { valid: false, error: "Valid file size is required" };
  }
  return { valid: true };
}

export default {
  Media,
  fromJson,
  validate,
};
