import userControllers from "../controllers/userControllers";
import userServices from "../services/userServices";

// Mock the pool used by userServices (imported from ../db/index.js)
jest.mock("../db/index.js", () => {
  return {
    __esModule: true,
    default: {
      query: jest.fn(),
    },
  };
});

import pool from "../db/index.js";

// Helper to create an express-like response mock
const createResMock = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
});

describe("User Controller - authenticate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 200 Valid Credentials
  test("returns 200 and user json when credentials are valid", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Arrange: make pool.query return a row for the select, and OK for the update
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            display_name: "Test User",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] }); // update query doesn't need rows

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(res.set).toHaveBeenCalledWith(
      expect.objectContaining({
        "Cache-Control": expect.any(String),
        "Content-Type": "application/json",
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ username: "testuser" })
    );
  });

  // 400 no credentials passed in
  test("returns 400 when credentials are not passed in", async () => {
    const req = {
      body: {
        username: "",
        password: "",
      },
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Missing username or password." })
    );
  });

  // 400 no username passed in
  test("returns 400 when username is not passed in", async () => {
    const req = {
      body: {
        username: "username1",
        password: "",
      },
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Missing username or password." })
    );
  });

  // 400 no password passed in
  test("returns 400 when password is not passed in", async () => {
    const req = {
      body: {
        username: "",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Missing username or password." })
    );
  });

  // 404 Credentials Invalid
  test("returns 404 and login invalid when credentials invalid", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Arrange: make pool.query return empty list
    pool.query.mockResolvedValueOnce({ rows: [] });

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid Login" })
    );
  });

  // 404 Credentials Invalid
  test("returns 404 and login invalid when credentials invalid", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Arrange: make pool.query return empty list
    pool.query.mockResolvedValueOnce({ rows: [] });

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid Login" })
    );
  });

  // 500 Service Recieves NULL credentials
  test("returns 500 when service recieves NULL credentials", async () => {
    username = "Username1";
    password = "Password1!";

    // NULL password
    const resultOne = await userServices.authenticateLogin(username, null);

    expect(resultOne).toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );

    // NULL Username
    const resultTwo = await userServices.authenticateLogin(null, password);

    expect(resultOne).toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );

    // NULL credentials
    const resultThree = await userServices.authenticateLogin(undefined, null);

    expect(resultOne).toEqual(
      expect.objectContaining({ success: false, status: 500 })
    );
  });

  // 500 On Database Error
  test("returns 500 on database error", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Return an error to be caught
    pool.query.mockRejectedValue(new Error("Database connection failed"));

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Database Error" })
    );
  });
});
