import { describe, it, expect } from "vitest";
import {
  resolveSafePath,
  sanitizeFilename,
} from "../pathSecurity.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Path Security Utilities", () => {
  const testRoot = path.join(__dirname, "../test-uploads");

  describe("sanitizeFilename", () => {
    it("should allow valid filenames", () => {
      const result = sanitizeFilename("document.pdf");
      expect(result).toBe("document.pdf");
    });

    it("should allow filenames with hyphens and underscores", () => {
      const result = sanitizeFilename("my-file_2024.txt");
      expect(result).toBe("my-file_2024.txt");
    });

    it("should remove path separators (forward slash)", () => {
      const result = sanitizeFilename("path/to/file.txt");
      expect(result).toBe("pathtofile.txt");
    });

    it("should remove path separators (backslash)", () => {
      const result = sanitizeFilename("path\\to\\file.txt");
      expect(result).toBe("pathtofile.txt");
    });

    it("should remove leading dots", () => {
      const result = sanitizeFilename("..hidden.txt");
      expect(result).toBe("hidden.txt");
    });

    it("should reject path traversal sequences (..)", () => {
      expect(() => sanitizeFilename("..")).toThrow();
      expect(() => sanitizeFilename("....")).toThrow();
    });

    it("should remove double dots in the middle of filenames", () => {
      const result = sanitizeFilename("file..name.txt");
      expect(result).toBe("filename.txt");
    });

    it("should remove null bytes", () => {
      const result = sanitizeFilename("file\0.txt");
      expect(result).toBe("file.txt");
    });

    it("should remove control characters", () => {
      const result = sanitizeFilename("file\x00\x01test.txt");
      expect(result).toBe("filetest.txt");
    });

    it("should remove dangerous characters", () => {
      const result = sanitizeFilename('file<script>.txt');
      expect(result).toBe("filescript.txt");
    });

    it("should reject completely invalid filenames", () => {
      expect(() => sanitizeFilename("../../..")).toThrow();
    });

    it("should truncate long filenames", () => {
      const longName = "a".repeat(300) + ".txt";
      const result = sanitizeFilename(longName, 255);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe("resolveSafePath", () => {
    it("should resolve valid paths within root", () => {
      const result = resolveSafePath(testRoot, "file.txt");
      expect(result).toBe(path.join(testRoot, "file.txt"));
    });

    it("should resolve nested paths within root", () => {
      const result = resolveSafePath(testRoot, "images/photo.jpg");
      expect(result).toBe(path.join(testRoot, "images", "photo.jpg"));
    });

    it("should reject path traversal with .. sequences", () => {
      expect(() => resolveSafePath(testRoot, "../../etc/passwd")).toThrow(
        /Path traversal detected/
      );
    });

    it("should reject absolute paths outside root", () => {
      expect(() => resolveSafePath(testRoot, "/etc/passwd")).toThrow(
        /Path traversal detected/
      );
    });

    it("should reject paths with multiple .. traversals", () => {
      expect(() => resolveSafePath(testRoot, "../../../windows/system32")).toThrow(
        /Path traversal detected/
      );
    });

    it("should handle current directory references (.)", () => {
      const result = resolveSafePath(testRoot, "./file.txt");
      expect(result).toBe(path.join(testRoot, "file.txt"));
    });

    it("should reject missing parameters", () => {
      expect(() => resolveSafePath(null, "file.txt")).toThrow();
      expect(() => resolveSafePath(testRoot, null)).toThrow();
    });

    it("should reject paths that share a common prefix but aren't children", () => {
      // This test ensures that a path like "uploads-backup" won't bypass
      // the root check if the root is "uploads"
      const uploadsRoot = path.join(testRoot, "uploads");
      expect(() => resolveSafePath(uploadsRoot, "../uploads-backup/file.txt")).toThrow(
        /Path traversal detected/
      );
    });
  });
});
