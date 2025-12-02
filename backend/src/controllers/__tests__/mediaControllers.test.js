import mediaControllers from "../mediaControllers.js";
import mediaServices from "../../services/mediaServices.js";

// Mock the pool used by mediaServices (imported from ../../db/index.js)
import { describe, test, expect, vi, afterEach } from "vitest";

vi.mock("../../db/index.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../../db/index.js";

// Helper to create an express-like response mock
const createResMock = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
});

describe("Media Controller", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("getAllMedia returns 200 and media list for user", async () => {
    const req = { params: { id: 1 } };
    const res = createResMock();

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, filename: "image.png" }],
    });

    await mediaControllers.getAllMedia(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ media: expect.any(Array) })
    );
  });

  test("getById returns 200 and media object when found", async () => {
    const req = { params: { id: 5 } };
    const res = createResMock();

    pool.query.mockResolvedValueOnce({
      rows: [{ id: 5, filename: "photo.jpg" }],
    });

    await mediaControllers.getById(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ media: expect.any(Array) })
    );
  });

  test("createMedia returns 400 for invalid filename", async () => {
    const req = {
      body: {
        container_id: 1,
        filename: "bad.name.png",
        filepath: "/x",
        file_size: 1,
      },
    };
    const res = createResMock();

    await mediaControllers.createMedia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid filename" })
    );
  });

  test("createMedia returns 200 when insert succeeds", async () => {
    const req = {
      body: {
        container_id: 1,
        filename: "image.png",
        filepath: "/x",
        file_size: 1,
      },
    };
    const res = createResMock();

    // first pool query inside insert will return a row id
    pool.query.mockResolvedValueOnce({ rows: [{ id: 10 }] });

    await mediaControllers.createMedia(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test("updateMedia validates filename and returns 400 on bad filename", async () => {
    const req = { params: { id: 2 }, body: { filename: "bad/name.png" } };
    const res = createResMock();

    await mediaControllers.updateMedia(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid filename" })
    );
  });

  test("deleteMedia returns 200 when delete succeeds", async () => {
    const req = { params: { id: 3 } };
    const res = createResMock();

    pool.query.mockResolvedValueOnce({ rows: [{ id: 3 }] });

    await mediaControllers.deleteMedia(req, res);

    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  test("insertMediaToDatabase returns 400 when given null", async () => {
    const result = await mediaServices.insertMediaToDatabase(null);
    expect(result).toEqual(
      expect.objectContaining({ success: false, status: 400 })
    );
  });
});
