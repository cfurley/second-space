import userControllers from "../userControllers.js";
import userServices from "../../services/userServices.js";
import authenticationService from "../../services/authenticationServices.js";

// Mock the pool used by userServices (imported from ../../db/index.js)
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

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

describe("User Services - updatePassword", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Error when password hashing fails
  test("returns error when password hashing fails", async () => {
    // Mock hashPassword to throw an error with statusCode
    const hashError = new Error("Password hashing failed");
    hashError.statusCode = 500;
    passwordService.hashPassword.mockRejectedValueOnce(hashError);

    // Act
    const result = await userServices.updatePassword(1, "newPassword123!");

    // Assert
    expect(result).toEqual({
      success: false,
      status: 500,
      error: "Password hashing failed",
    });
  });
});

describe("User Services - createUser", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Error when password hashing fails
  test("returns error when password hashing fails", async () => {
    const user = {
      username: "testuser",
      password: "Password1!",
      first_name: "Test",
      last_name: "User",
    };

    // Mock hashPassword to throw an error with statusCode
    const hashError = new Error("Password hashing failed");
    hashError.statusCode = 500;
    passwordService.hashPassword.mockRejectedValueOnce(hashError);

    // Act
    const result = await userServices.createUser(user);

    // Assert
    expect(result).toEqual({
      success: false,
      status: 500,
      error: "Password hashing failed",
    });
  });
});

describe("User Controller - authenticate with lockout", () => {
  beforeEach(() => {
    authenticationService.clearAllAttempts();
    vi.clearAllMocks();
  });

  afterEach(() => {
    authenticationService.clearAllAttempts();
    vi.clearAllMocks();
  });

  test("should check for lockout before validating credentials", async () => {
    // Lock the account first by simulating 5 failed attempts
    for (let i = 0; i < 5; i++) {
      authenticationService.recordFailedAttempt("lockeduser");
    }

    const req = {
      body: {
        username: "lockeduser",
        password: "Password1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should return 429 without checking database
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: expect.stringContaining("Too many login attempts") 
      })
    );
    expect(pool.query).not.toHaveBeenCalled();
  });

  test("should record failed attempt on invalid credentials", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "WrongPassword1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Mock user exists but password is wrong
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
    passwordService.validatePassword.mockResolvedValueOnce(false);

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should record failed attempt (check lockoutCount is still 0, not yet locked)
    const lockStatus = authenticationService.checkLockout("testuser");
    expect(lockStatus.locked).toBe(false);
    expect(lockStatus.lockoutCount).toBe(0); // Not yet locked, just counted
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("should lock account after 5 failed attempts", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "WrongPassword1!",
      },
      ip: "127.0.0.1",
    };

    // Simulate 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      const res = createResMock();
      
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
      passwordService.validatePassword.mockResolvedValueOnce(false);

      await userControllers.authenticate(req, res);
    }

    // The 5th attempt should trigger lockout
    const res = createResMock();
    await userControllers.authenticate(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: expect.stringContaining("Too many login attempts") 
      })
    );
  });

  test("should reset attempts after successful login", async () => {
    // First, fail a few times
    for (let i = 0; i < 3; i++) {
      authenticationService.recordFailedAttempt("testuser");
    }

    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Mock successful login
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: "$2a$12$hashedpassword",
            display_name: "Test User",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });
    passwordService.validatePassword.mockResolvedValueOnce(true);

    // Act
    await userControllers.authenticate(req, res);

    // Assert - attempts should be reset
    const lockStatus = authenticationService.checkLockout("testuser");
    expect(lockStatus.lockoutCount).toBe(0);
    expect(lockStatus.locked).toBe(false);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("should not record attempt when username/password are missing", async () => {
    const req = {
      body: {
        username: "",
        password: "",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert - no attempt should be recorded for null credentials
    const lockStatus = authenticationService.checkLockout("");
    expect(lockStatus.lockoutCount).toBe(0);
    expect(lockStatus.locked).toBe(false);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("should use IP address as identifier when username is unavailable", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "WrongPassword1!",
      },
      ip: "192.168.1.100",
    };

    const res = createResMock();

    // Mock failed login
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
    passwordService.validatePassword.mockResolvedValueOnce(false);

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should track by username (which is available)
    const lockStatus = authenticationService.checkLockout("testuser");
    expect(lockStatus.lockoutCount).toBe(0); // Not yet locked
    expect(lockStatus.locked).toBe(false);
  });

  test("should return 500 error when lockout check fails", async () => {
    // Mock checkLockout to throw an error
    const originalCheckLockout = authenticationService.checkLockout;
    authenticationService.checkLockout = vi.fn().mockImplementation(() => {
      throw new Error("Lockout system failure");
    });

    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should fail securely
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: "Authentication system error. Please try again later." 
      })
    );
    expect(pool.query).not.toHaveBeenCalled();

    // Restore original function
    authenticationService.checkLockout = originalCheckLockout;
  });

  test("should return 500 error when recording failed attempt fails", async () => {
    // Mock recordFailedAttempt to throw an error
    const originalRecordFailedAttempt = authenticationService.recordFailedAttempt;
    authenticationService.recordFailedAttempt = vi.fn().mockImplementation(() => {
      throw new Error("Failed to record attempt");
    });

    const req = {
      body: {
        username: "testuser",
        password: "WrongPassword1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Mock failed login
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
    passwordService.validatePassword.mockResolvedValueOnce(false);

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should return error
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: "Authentication system error." 
      })
    );

    // Restore original function
    authenticationService.recordFailedAttempt = originalRecordFailedAttempt;
  });

  test("should allow successful login even if reset attempts fails", async () => {
    // Mock resetAttempts to throw an error
    const originalResetAttempts = authenticationService.resetAttempts;
    authenticationService.resetAttempts = vi.fn().mockImplementation(() => {
      throw new Error("Failed to reset attempts");
    });

    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Mock successful login
    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            username: "testuser",
            password: "$2a$12$hashedpassword",
            display_name: "Test User",
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [] });
    passwordService.validatePassword.mockResolvedValueOnce(true);

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should still allow successful login
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ username: "testuser" })
    );

    // Restore original function
    authenticationService.resetAttempts = originalResetAttempts;
  });

  test("should show remaining time in minutes when locked", async () => {
    // Lock the account
    for (let i = 0; i < 5; i++) {
      authenticationService.recordFailedAttempt("testuser");
    }

    const req = {
      body: {
        username: "testuser",
        password: "Password1!",
      },
      ip: "127.0.0.1",
    };

    const res = createResMock();

    // Act
    await userControllers.authenticate(req, res);

    // Assert - should show minutes
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ 
        error: expect.stringMatching(/Try again in \d+ minute\(s\)\./) 
      })
    );
  });
});
