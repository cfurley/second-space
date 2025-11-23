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
  return new Media(json);
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
