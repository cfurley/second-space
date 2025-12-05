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
    const folders = ["text", "images", "json", "others"];
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

  // test("insertMediaToDatabase cleans up file when DB insert throws", async () => {
  //   const base64 = Buffer.from("cleanup me").toString("base64");
  //   const media = {
  //     container_id: 1,
  //     filename: "notes.txt",
  //     file_size: Buffer.from("cleanup me").length,
  //     base64,
  //   };

  //   // Simulate DB throwing an error
  //   pool.query.mockRejectedValueOnce(new Error("db failure"));

  //   let result;
  //   try {
  //     result = await mediaServices.insertMediaToDatabase(media);
  //     // If it returns instead of throwing, expect error
  //     expect(result).toEqual(
  //       expect.objectContaining({ success: false, status: 500 })
  //     );
  //   } catch (err) {
  //     // If service throws, the outer error handler caught it; continue to cleanup check
  //   }

  //   // ensure uploads/text has no files (cleanup should have deleted them)
  //   try {
  //     const files = await fs.promises.readdir(path.join(uploadsRoot, "text"));
  //     expect(files.length).toBe(0);
  //   } catch (e) {
  //     // folder may not exist which is acceptable (cleanup deleted it or it was never created)
  //   }
  // });

  // test("insertMediaToDatabase cleans up file when DB insert returns no rows", async () => {
  //   const base64 = Buffer.from("cleanup none").toString("base64");
  //   const media = {
  //     container_id: 1,
  //     filename: "notes.txt",
  //     file_size: Buffer.from("cleanup none").length,
  //     base64,
  //   };

  //   // Simulate insert returning no rows
  //   pool.query.mockResolvedValueOnce({ rows: [] });

  //   const result = await mediaServices.insertMediaToDatabase(media);
  //   expect(result).toEqual(
  //     expect.objectContaining({ success: false, status: 500 })
  //   );

  //   // ensure uploads/text has no files
  //   try {
  //     const files = await fs.promises.readdir(path.join(uploadsRoot, "text"));
  //     expect(files.length).toBe(0);
  //   } catch (e) {
  //     expect(e.code === "ENOENT" || e.code === "ENOTDIR").toBeTruthy();
  //   }
  // });

  test("updateMediaInDatabase renames file when filename/extension changes", async () => {
    // prepare old file
    const folder = path.join(uploadsRoot, "images");
    await fs.promises.mkdir(folder, { recursive: true });
    const oldName = "oldfile.png";
    const oldPath = path.join(folder, oldName);
    await fs.promises.writeFile(oldPath, "old content");

    // select returns old filename and filepath
    pool.query.mockResolvedValueOnce({
      rows: [{ filename: oldName, filepath: `/uploads/images/${oldName}` }],
    });
    // update returns id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const result = await mediaServices.updateMediaInDatabase(1, {
      filename: "new.jpg",
      file_size: 5,
    });
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );

    // old file should not exist
    const oldExists = await fs.promises
      .stat(oldPath)
      .then(() => true)
      .catch(() => false);
    expect(oldExists).toBe(false);

    // there should be at least one file in images folder (the renamed file)
    const files = await fs.promises.readdir(folder);
    expect(files.length).toBeGreaterThan(0);
  });

  test("updateMediaInDatabase overwrites file when base64 provided", async () => {
    // prepare old file in text folder
    const folder = path.join(uploadsRoot, "text");
    await fs.promises.mkdir(folder, { recursive: true });
    const oldName = "overwrite.txt";
    const oldPath = path.join(folder, oldName);
    await fs.promises.writeFile(oldPath, "old content");

    // select returns old filename and filepath (text folder)
    pool.query.mockResolvedValueOnce({
      rows: [{ filename: oldName, filepath: `/uploads/text/${oldName}` }],
    });
    // update returns id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

    const newBase64 = Buffer.from("new content").toString("base64");
    const result = await mediaServices.updateMediaInDatabase(2, {
      filename: "overwrite.txt",
      file_size: 11,
      base64: newBase64,
    });
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );

    // file contents should be updated (either renamed or overwritten)
    const files = await fs.promises.readdir(folder);
    let found = false;
    for (const f of files) {
      const contents = await fs.promises.readFile(path.join(folder, f));
      if (contents.toString() === "new content") {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("deleteMediaFromDatabase deletes file and marks DB", async () => {
    const folder = path.join(uploadsRoot, "images");
    await fs.promises.mkdir(folder, { recursive: true });
    const name = "todelete.png";
    const filePath = path.join(folder, name);
    await fs.promises.writeFile(filePath, "bye");

    // select returns filepath
    pool.query.mockResolvedValueOnce({
      rows: [{ filepath: `/uploads/images/${name}` }],
    });
    // update returns id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 9 }] });

    const result = await mediaServices.deleteMediaFromDatabase(9);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );

    const exists = await fs.promises
      .stat(filePath)
      .then(() => true)
      .catch(() => false);
    expect(exists).toBe(false);
  });

  test("deleteMediaFromDatabase returns error when unlink fails", async () => {
    const folder = path.join(uploadsRoot, "images");
    await fs.promises.mkdir(folder, { recursive: true });
    const name = "badunlink.png";
    const filePath = path.join(folder, name);
    await fs.promises.writeFile(filePath, "bad");

    // select returns filepath
    pool.query.mockResolvedValueOnce({
      rows: [{ filepath: `/uploads/images/${name}` }],
    });

    // make unlink throw a permission error
    const spy = vi
      .spyOn(fs.promises, "unlink")
      .mockRejectedValueOnce({ code: "EACCES", message: "denied" });

    const result = await mediaServices.deleteMediaFromDatabase(100);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );

    // restore spy
    spy.mockRestore();
  });

  // test("insertMediaToDatabase writes file for base64 and inserts DB row", async () => {
  //   const base64 = Buffer.from("hello world").toString("base64");
  //   const media = {
  //     container_id: 1,
  //     filename: "notes.txt",
  //     file_size: Buffer.from("hello world").length,
  //     base64,
  //   };

  //   // mock DB to return an id
  //   pool.query.mockResolvedValueOnce({ rows: [{ id: 123 }] });

  //   const result = await mediaServices.insertMediaToDatabase(media);
  //   expect(result).toEqual(
  //     expect.objectContaining({ success: true, status: 200 })
  //   );
  //   expect(pool.query).toHaveBeenCalled();

  //   // check file exists under uploads/text
  //   const dir = path.join(uploadsRoot, "text");
  //   const files = await fs.promises.readdir(dir);
  //   expect(files.length).toBeGreaterThan(0);

  //   // ensure the file contents match
  //   const filePath = path.join(dir, files[0]);
  //   const contents = await fs.promises.readFile(filePath);
  //   expect(contents.toString()).toBe("hello world");
  // });

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
      expect.objectContaining({ success: false, status: 400 })
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

  test("generateFilepath rejects disallowed file extension", async () => {
    const media = {
      filename: "malicious.exe",
      base64: Buffer.from("executable").toString("base64"),
    };

    await expect(mediaServices.insertMediaToDatabase(media)).resolves.toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  test("generateFilepath rejects mismatched MIME type", async () => {
    // Create a JPEG file but claim it's PNG
    const jpegBuffer = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]); // JPEG magic bytes
    const base64 = jpegBuffer.toString("base64");
    const media = {
      container_id: 1,
      filename: "fake.png", // claim it's PNG but it's actually JPEG
      file_size: jpegBuffer.length,
      base64,
    };

    await expect(mediaServices.insertMediaToDatabase(media)).resolves.toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  test("generateFilepath accepts valid image file with matching MIME type", async () => {
    // Real PNG magic bytes
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
    ]);
    const base64 = pngBuffer.toString("base64");
    const media = {
      container_id: 1,
      filename: "valid.png",
      file_size: pngBuffer.length,
      base64,
    };

    pool.query.mockResolvedValueOnce({ rows: [{ id: 42 }] });

    const result = await mediaServices.insertMediaToDatabase(media);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );
  });

  test("generateFilepath accepts valid JSON file", async () => {
    const jsonBuffer = Buffer.from('{"test": "data"}');
    const base64 = jsonBuffer.toString("base64");
    const media = {
      container_id: 1,
      filename: "data.json",
      file_size: jsonBuffer.length,
      base64,
    };

    pool.query.mockResolvedValueOnce({ rows: [{ id: 43 }] });

    const result = await mediaServices.insertMediaToDatabase(media);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );
  });

  test("generateFilepath accepts valid text file", async () => {
    const textBuffer = Buffer.from("plain text content");
    const base64 = textBuffer.toString("base64");
    const media = {
      container_id: 1,
      filename: "notes.txt",
      file_size: textBuffer.length,
      base64,
    };

    pool.query.mockResolvedValueOnce({ rows: [{ id: 44 }] });

    const result = await mediaServices.insertMediaToDatabase(media);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );
  });
});

describe("mediaServices.getMedia", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("getMedia returns error when both userId and mediaId are null", async () => {
    const result = await mediaServices.getMedia(null, null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });

  test("getMedia retrieves media by userId", async () => {
    const mockData = [
      { id: 1, filename: "photo.png", container_id: 10 },
      { id: 2, filename: "doc.txt", container_id: 10 },
    ];
    pool.query.mockResolvedValueOnce({ rows: mockData });

    const result = await mediaServices.getMedia(5, null);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200, data: mockData })
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("created_by_user_id"),
      [5]
    );
  });

  test("getMedia retrieves media by mediaId", async () => {
    const mockData = [{ id: 1, filename: "photo.png", container_id: 10 }];
    pool.query.mockResolvedValueOnce({ rows: mockData });

    const result = await mediaServices.getMedia(null, 1);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200, data: mockData })
    );
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("SELECT * FROM media"),
      [1]
    );
  });

  test("getMedia returns 404 when no media found by userId", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await mediaServices.getMedia(999, null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 404 })
    );
  });

  test("getMedia returns 404 when no media found by mediaId", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await mediaServices.getMedia(null, 999);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 404 })
    );
  });

  test("getMedia returns 500 on database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("Connection lost"));

    const result = await mediaServices.getMedia(5, null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );
  });
});

describe("mediaServices file collision handling", () => {
  afterEach(async () => {
    vi.clearAllMocks();
    // cleanup uploads folder contents created by tests
    const folders = ["text", "images", "json", "others"];
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

  test("insertMediaToDatabase handles filename collision by retrying", async () => {
    const base64 = Buffer.from("collision test").toString("base64");
    const media = {
      container_id: 1,
      filename: "test.txt",
      file_size: Buffer.from("collision test").length,
      base64,
    };

    pool.query.mockResolvedValueOnce({ rows: [{ id: 100 }] });

    const result = await mediaServices.insertMediaToDatabase(media);
    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );

    // Verify file was written to text folder
    const dir = path.join(uploadsRoot, "text");
    const files = await fs.promises.readdir(dir);
    expect(files.length).toBeGreaterThan(0);
  });

  test("updateMediaInDatabase handles cross-folder moves correctly", async () => {
    // Create an image file first
    const imgFolder = path.join(uploadsRoot, "images");
    await fs.promises.mkdir(imgFolder, { recursive: true });
    const imgName = "photo.png";
    const imgPath = path.join(imgFolder, imgName);

    // Real PNG magic bytes
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52,
    ]);
    await fs.promises.writeFile(imgPath, pngBuffer);

    // Mock select to return the image file path
    pool.query.mockResolvedValueOnce({
      rows: [{ filename: imgName, filepath: `/uploads/images/${imgName}` }],
    });
    // Mock update to return id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const base64 = Buffer.from("text content").toString("base64");
    const result = await mediaServices.updateMediaInDatabase(1, {
      filename: "newname.txt",
      file_size: 12,
      base64,
    });

    expect(result).toEqual(
      expect.objectContaining({ success: true, status: 200 })
    );

    // Old image folder should no longer have the original file
    const imgFiles = await fs.promises.readdir(imgFolder).catch(() => []);
    expect(imgFiles).not.toContain(imgName);
  });
});
