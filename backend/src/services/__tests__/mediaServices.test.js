import mediaServices from "../mediaServices.js";
import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("../../db/index.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../../db/index.js";
import fs from "fs";
import path from "path";

// Determine uploads root consistently with service implementation
const cwdBase = path.basename(process.cwd());
const uploadsRoot =
  cwdBase === "backend"
    ? path.join(process.cwd(), "uploads")
    : path.join(process.cwd(), "backend", "uploads");

describe("mediaServices.generateFilepath and insertMediaToDatabase", () => {
  afterEach(async () => {
    vi.clearAllMocks();
    // cleanup uploads folder contents created by tests
    const folders = ['text', 'images', 'json', 'others'];
    for (const folder of folders) {
      try {
        const files = await fs.promises.readdir(path.join(uploadsRoot, folder));
        for (const f of files) {
          await fs.promises.unlink(path.join(uploadsRoot, folder, f));
        }
      } catch (e) {
        // ignore if folder doesn't exist
      }
    }
  });

  test("insertMediaToDatabase writes file for base64 and inserts DB row", async () => {
    const base64 = Buffer.from("hello world").toString("base64");
    const media = {
      container_id: 1,
      filename: "notes.txt",
      file_size: Buffer.from("hello world").length,
      base64,
    };

    // mock DB to return an id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 123 }] });

    const result = await mediaServices.insertMediaToDatabase(media);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );
    expect(pool.query).toHaveBeenCalled();

    // check file exists under uploads/text
    const dir = path.join(uploadsRoot, "text");
    const files = await fs.promises.readdir(dir);
    expect(files.length).toBeGreaterThan(0);

    // ensure the file contents match
    const filePath = path.join(dir, files[0]);
    const contents = await fs.promises.readFile(filePath);
    expect(contents.toString()).toBe("hello world");
  });

  test("insertMediaToDatabase rejects too-large base64", async () => {
    // create a buffer larger than MAX_FILE_SIZE used in service (20MB)
    const size = 21 * 1024 * 1024; // 21 MB
    const buffer = Buffer.alloc(size, "a");
    const base64 = buffer.toString("base64");
    const media = {
      container_id: 1,
      filename: "big.txt",
      file_size: size,
      base64,
    };

    await expect(mediaServices.insertMediaToDatabase(media)).resolves.toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );
  });

  test("insertMediaToDatabase rejects when media is null", async () => {
    const result = await mediaServices.insertMediaToDatabase(null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  test("insertMediaToDatabase returns 400 when given null", async () => {
    const result = await mediaServices.insertMediaToDatabase(null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });
});
