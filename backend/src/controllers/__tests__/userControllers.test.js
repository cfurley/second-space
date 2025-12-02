import userControllers from "../userControllers.js";
import userServices from "../../services/userServices.js";

// Mock the pool used by userServices (imported from ../../db/index.js)
import { describe, test, expect, vi } from "vitest";

vi.mock("../../db/index.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

// Mock the password service
vi.mock("../../services/passwordService.js", () => ({
  default: {
    validatePassword: vi.fn(),
    hashPassword: vi.fn(),
  },
}));

import pool from "../../db/index.js";
import passwordService from "../../services/passwordService.js";

// Helper to create an express-like response mock
const createResMock = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
});

describe("User Controller - authenticate", () => {
  afterEach(() => {
    vi.clearAllMocks();
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

    // Arrange: make pool.query return a row with password hash for the select, and OK for the update
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: "$2a$12$hashedpassword", // Mock hashed password
            display_name: "Test User",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] }); // update query doesn't need rows

    // Mock password validation to return true
    passwordService.validatePassword.mockResolvedValueOnce(true);

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(passwordService.validatePassword).toHaveBeenCalledWith("Password1!", "$2a$12$hashedpassword");
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

    // Mock password validation (called with dummy hash for timing attack prevention)
    passwordService.validatePassword.mockResolvedValueOnce(false);

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid Login" })
    );
  });

  // 404 Password validation fails (user exists but wrong password)
  test("returns 404 when password validation fails", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "WrongPassword1!",
      },
    };

    const res = createResMock();

    // Arrange: make pool.query return a user
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          username: "testuser",
          password: "$2a$12$hashedpassword",
          display_name: "Test User",
        },
      ],
    });

    // Mock password validation to return false
    passwordService.validatePassword.mockResolvedValueOnce(false);

    // Act
    await userControllers.authenticate(req, res);

    // Assert
    expect(pool.query).toHaveBeenCalled();
    expect(passwordService.validatePassword).toHaveBeenCalledWith("WrongPassword1!", "$2a$12$hashedpassword");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Invalid Login" })
    );
  });

  // 404 Credentials Invalid (duplicate test for user not found scenario)
  test("returns 404 and login invalid when user not found", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
    };

    const res = createResMock();

    // Arrange: make pool.query return empty list
    pool.query.mockResolvedValueOnce({ rows: [] });

    // Mock password validation (called with dummy hash for timing attack prevention)
    passwordService.validatePassword.mockResolvedValueOnce(false);

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
    const username = "Username1";
    const password = "Password1!";

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
    pool.query.mockRejectedValueOnce(new Error("Database connection failed"));

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
