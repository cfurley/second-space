#!/usr/bin/env node

/**
 * Commit Statistics Report Generator
 * 
 * Generates a comprehensive report of commit statistics for the repository.
 * Can output in markdown or JSON format.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Helper function to execute git commands
function gitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }).trim();
  } catch (error) {
    console.error(`Error executing git command: ${command}`);
    console.error(error.message);
    return '';
  }
}

// Get total number of commits
function getTotalCommits() {
  const result = gitCommand('git rev-list --all --count');
  return parseInt(result) || 0;
}

// Get commits by author
function getCommitsByAuthor() {
  const result = gitCommand('git shortlog -sn --all --no-merges');
  const authors = [];
  
  result.split('\n').forEach(line => {
    const match = line.trim().match(/^(\d+)\s+(.+)$/);
    if (match) {
      authors.push({
        name: match[2],
        commits: parseInt(match[1])
      });
    }
  });
  
  return authors;
}

// Get commit activity by date
function getCommitActivity() {
  const result = gitCommand('git log --all --format="%ad" --date=short');
  const dates = {};
  
  result.split('\n').forEach(date => {
    if (date) {
      dates[date] = (dates[date] || 0) + 1;
    }
  });
  
  return dates;
}

// Get files changed statistics
function getFileStats() {
  const result = gitCommand('git log --all --pretty=format: --numstat');
  const stats = {
    totalInsertions: 0,
    totalDeletions: 0,
    filesChanged: new Set()
  };
  
  result.split('\n').forEach(line => {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/);
    if (match) {
      stats.totalInsertions += parseInt(match[1]) || 0;
      stats.totalDeletions += parseInt(match[2]) || 0;
      stats.filesChanged.add(match[3]);
    }
  });
  
  return {
    totalInsertions: stats.totalInsertions,
    totalDeletions: stats.totalDeletions,
    uniqueFiles: stats.filesChanged.size
  };
}

// Get recent commits
function getRecentCommits(count = 10) {
  const result = gitCommand(`git log --all -${count} --pretty=format:"%h|%an|%ad|%s" --date=short`);
  const commits = [];
  
  result.split('\n').forEach(line => {
    const parts = line.split('|');
    if (parts.length === 4) {
      commits.push({
        hash: parts[0],
        author: parts[1],
        date: parts[2],
        message: parts[3]
      });
    }
  });
  
  return commits;
}

// Get commits by day of week
function getCommitsByDayOfWeek() {
  const result = gitCommand('git log --all --format="%ad" --date=format:"%A"');
  const days = {
    'Monday': 0,
    'Tuesday': 0,
    'Wednesday': 0,
    'Thursday': 0,
    'Friday': 0,
    'Saturday': 0,
    'Sunday': 0
  };
  
  result.split('\n').forEach(day => {
    if (day && days.hasOwnProperty(day)) {
      days[day]++;
    }
  });
  
  return days;
}

// Get commits by hour of day
function getCommitsByHour() {
  const result = gitCommand('git log --all --format="%ad" --date=format:"%H"');
  const hours = {};
  
  for (let i = 0; i < 24; i++) {
    hours[i.toString().padStart(2, '0')] = 0;
  }
  
  result.split('\n').forEach(hour => {
    if (hour && hours.hasOwnProperty(hour)) {
      hours[hour]++;
    }
  });
  
  return hours;
}

// Get repository age
function getRepositoryAge() {
  const firstCommit = gitCommand('git log --all --reverse --pretty=format:"%ad" --date=short | head -1');
  const lastCommit = gitCommand('git log --all --pretty=format:"%ad" --date=short | head -1');
  
  return {
    firstCommit: firstCommit || 'N/A',
    lastCommit: lastCommit || 'N/A'
  };
}

// Generate statistics object
function generateStats() {
  console.log('Generating commit statistics...');
  
  const stats = {
    generatedAt: new Date().toISOString(),
    repository: {
      name: path.basename(process.cwd()),
      age: getRepositoryAge()
    },
    commits: {
      total: getTotalCommits(),
      byAuthor: getCommitsByAuthor(),
      byDayOfWeek: getCommitsByDayOfWeek(),
      byHour: getCommitsByHour(),
      activity: getCommitActivity(),
      recent: getRecentCommits(10)
    },
    changes: getFileStats()
  };
  
  return stats;
}

// Format as markdown
function formatAsMarkdown(stats) {
  let md = '# Commit Statistics Report\n\n';
  md += `**Generated:** ${new Date(stats.generatedAt).toLocaleString()}\n\n`;
  md += `**Repository:** ${stats.repository.name}\n\n`;
  
  // Repository Age
  md += '## Repository Timeline\n\n';
  md += `- **First Commit:** ${stats.repository.age.firstCommit}\n`;
  md += `- **Last Commit:** ${stats.repository.age.lastCommit}\n\n`;
  
  // Overall Stats
  md += '## Overall Statistics\n\n';
  md += `- **Total Commits:** ${stats.commits.total}\n`;
  md += `- **Total Contributors:** ${stats.commits.byAuthor.length}\n`;
  md += `- **Lines Added:** ${stats.changes.totalInsertions.toLocaleString()}\n`;
  md += `- **Lines Deleted:** ${stats.changes.totalDeletions.toLocaleString()}\n`;
  md += `- **Unique Files Changed:** ${stats.changes.uniqueFiles}\n\n`;
  
  // Commits by Author
  md += '## Commits by Author\n\n';
  md += '| Author | Commits | Percentage |\n';
  md += '|--------|---------|------------|\n';
  stats.commits.byAuthor.forEach(author => {
    const percentage = ((author.commits / stats.commits.total) * 100).toFixed(1);
    md += `| ${author.name} | ${author.commits} | ${percentage}% |\n`;
  });
  md += '\n';
  
  // Recent Commits
  md += '## Recent Commits\n\n';
  md += '| Hash | Author | Date | Message |\n';
  md += '|------|--------|------|----------|\n';
  stats.commits.recent.forEach(commit => {
    md += `| ${commit.hash} | ${commit.author} | ${commit.date} | ${commit.message} |\n`;
  });
  md += '\n';
  
  // Activity by Day of Week
  md += '## Commits by Day of Week\n\n';
  md += '| Day | Commits |\n';
  md += '|-----|----------|\n';
  Object.entries(stats.commits.byDayOfWeek).forEach(([day, count]) => {
    md += `| ${day} | ${count} |\n`;
  });
  md += '\n';
  
  // Activity by Hour
  md += '## Commits by Hour of Day\n\n';
  md += '| Hour | Commits |\n';
  md += '|------|----------|\n';
  Object.entries(stats.commits.byHour).forEach(([hour, count]) => {
    if (count > 0) {
      md += `| ${hour}:00 | ${count} |\n`;
    }
  });
  md += '\n';
  
  // Daily Activity (top 20 most active days)
  md += '## Most Active Days\n\n';
  const sortedDays = Object.entries(stats.commits.activity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  if (sortedDays.length > 0) {
    md += '| Date | Commits |\n';
    md += '|------|----------|\n';
    sortedDays.forEach(([date, count]) => {
      md += `| ${date} | ${count} |\n`;
    });
    md += '\n';
  }
  
  return md;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const format = args.includes('--json') ? 'json' : 'markdown';
  const outputFile = args.find(arg => arg.startsWith('--output='))?.split('=')[1];
  
  try {
    const stats = generateStats();
    let output;
    
    if (format === 'json') {
      output = JSON.stringify(stats, null, 2);
    } else {
      output = formatAsMarkdown(stats);
    }
    
    if (outputFile) {
      fs.writeFileSync(outputFile, output);
      console.log(`\n✅ Report saved to: ${outputFile}`);
    } else {
      console.log('\n' + output);
    }
    
    console.log('\n✅ Commit statistics generated successfully!');
  } catch (error) {
    console.error('Error generating statistics:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
