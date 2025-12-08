# Commit Statistics Generator

A Node.js script that generates comprehensive commit statistics for the Second Space repository.

## Features

The script analyzes the git history and generates reports including:

- **Overall Statistics**
  - Total commits
  - Total contributors
  - Lines added/deleted
  - Unique files changed

- **Author Analytics**
  - Commits per author
  - Contribution percentages

- **Temporal Analytics**
  - Commits by day of week
  - Commits by hour of day
  - Most active days
  - Repository timeline

- **Recent Activity**
  - Last 10 commits with details

## Usage

### Generate Report to Console

```bash
node generate-commit-stats.js
```

This will output a formatted markdown report directly to the console.

### Generate Markdown Report File

```bash
node generate-commit-stats.js --output=COMMIT_STATS.md
```

Creates a markdown file with the statistics report.

### Generate JSON Report File

```bash
node generate-commit-stats.js --json --output=commit-stats.json
```

Creates a JSON file with structured statistics data.

### Combined Options

```bash
# JSON output to console
node generate-commit-stats.js --json

# Markdown to custom file
node generate-commit-stats.js --output=reports/stats.md
```

## Output Formats

### Markdown Format
- Human-readable report
- Formatted tables for easy viewing
- Perfect for documentation and sharing

### JSON Format
- Machine-readable structured data
- Suitable for further processing or integration with other tools
- Can be used for dashboards or analytics

## Requirements

- Node.js (v14 or higher)
- Git repository with commit history

## Examples

### Example Markdown Output

```markdown
# Commit Statistics Report

**Generated:** 12/8/2025, 9:35:35 PM
**Repository:** second-space

## Overall Statistics
- **Total Commits:** 150
- **Total Contributors:** 5
- **Lines Added:** 45,234
- **Lines Deleted:** 12,456
```

### Example JSON Output

```json
{
  "generatedAt": "2025-12-08T21:35:35.334Z",
  "repository": {
    "name": "second-space",
    "age": {
      "firstCommit": "2024-01-15",
      "lastCommit": "2025-12-08"
    }
  },
  "commits": {
    "total": 150,
    "byAuthor": [
      {
        "name": "developer1",
        "commits": 75
      }
    ]
  }
}
```

## Notes

- The script analyzes all branches in the repository
- Generated report files (`COMMIT_STATS.md` and `commit-stats.json`) are gitignored
- The script requires no additional dependencies beyond Node.js built-in modules
- Statistics are based on git history available in the current clone

## Troubleshooting

If you encounter errors:

1. Ensure you're running the command from the repository root
2. Verify you have a valid git repository with commits
3. Check that Node.js is installed: `node --version`
4. Ensure you have read permissions for the `.git` directory

## Integration

You can integrate this script into CI/CD pipelines or automate report generation:

```bash
# Generate weekly reports
node generate-commit-stats.js --output=reports/weekly-$(date +%Y%m%d).md

# Generate statistics after deployments
npm run deploy && node generate-commit-stats.js --json --output=deployment-stats.json
```
