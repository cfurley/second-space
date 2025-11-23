/*
  mediaModel.js

  Purpose and high-level architecture notes
  - Model class representing the `media` row shape used across controllers/services.
  - `fromJson()` is used by controllers to perform lightweight validation of
    user-provided fields before passing data to the service layer.

  Important behavior implemented here:
  - Filename validation (to limit path attacks and unexpected extensions).
  - Any `filepath` provided by the client is stripped away: the server
    is responsible for generating and assigning the stored filepath.

  Why these choices?
  - Keeping storage paths under server control prevents directory traversal
    or accidental overwrites; filenames are validated separately and stored
    only as metadata (the original user filename remains in the DB).

  Potential improvements (future work)
  - Move validation and normalization to a dedicated `upload`/`storage` service
    to keep the model layer pure (POJO) and reduce coupling.
  - Return richer validation errors (codes) to the controller so the API can
    present localized or more specific messages. Current design purposely
    returns minimal messages (e.g., "Invalid filename").
  - Use a schema/validation library (Joi, Zod) for consistent validation.
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

function fromJson(json) {
  // validate filename if provided
  if (json && json.filename) {
    if (!isValidFilename(json.filename)) {
      throw new Error("Invalid filename");
    }
  }
  // Ignore any user-provided filepath -- server will generate it
  const clean = { ...json };
  if (clean && Object.prototype.hasOwnProperty.call(clean, "filepath")) {
    delete clean.filepath;
  }
  return new Media(clean);
}

/**
 * Validate a user-provided filename:
 * - no forward or backward slashes
 * - at most one period (so a single extension)
 * - extension must be an allowed type (images, .txt, .json)
 */
function isValidFilename(name) {
  if (typeof name !== "string") return false;
  // disallow slashes
  if (name.indexOf("/") !== -1 || name.indexOf("\\") !== -1) return false;
  // count periods
  const periodCount = (name.match(/\./g) || []).length;
  if (periodCount !== 1) return false;
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  const allowed = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".txt",
    ".json",
  ];
  return allowed.includes(ext);
}

export default { Media, fromJson };
