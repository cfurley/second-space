export function getDefaultSpaceContent(): {[key: string]: any[]} {
  return {
    'My Ideas': [
      {
        type: 'text',
        content: {
          title: 'App Idea: Smart Task Organizer',
          text: 'A mobile app that uses AI to automatically categorize and prioritize tasks based on context, deadlines, and personal work patterns.',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
          isBookmarked: false
        }
      },
      {
        type: 'text',
        content: {
          title: 'Weekend Project: Home Automation',
          text: 'Build a custom dashboard for controlling smart home devices using Raspberry Pi. Include voice commands and automation routines for morning and evening.',
          timestamp: new Date(Date.now() - 86400000 * 5).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'link',
        content: {
          title: 'Interesting Design Pattern',
          url: 'https://refactoring.guru/design-patterns',
          domain: 'refactoring.guru',
          description: 'Repository pattern for cleaner data layer abstraction. Could apply this to the current project.',
          timestamp: new Date(Date.now() - 86400000 * 1).toLocaleString(),
          isBookmarked: false
        }
      },
      {
        type: 'text',
        content: {
          title: 'Content Idea: Tech Tutorial Series',
          text: 'Create a series of tutorials on building modern web apps from scratch. Focus on practical examples and real-world scenarios.',
          timestamp: new Date(Date.now() - 3600000 * 12).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'text',
        content: {
          title: 'Business Idea: Local Service Marketplace',
          text: 'Platform connecting local service providers with customers. Focus on verified reviews, instant booking, and transparent pricing.',
          timestamp: new Date(Date.now() - 86400000 * 7).toLocaleString(),
          isBookmarked: false
        }
      }
    ],
    'Work': [
      {
        type: 'link',
        content: {
          title: 'Q1 Product Roadmap',
          url: 'https://docs.example.com/roadmap',
          domain: 'docs.example.com',
          description: 'Quarterly planning document with key milestones and deliverables for the product team.',
          timestamp: new Date(Date.now() - 86400000 * 1).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'text',
        content: {
          title: 'Meeting Notes: Sprint Planning',
          text: 'Key takeaways: Focus on performance optimization this sprint. Backend API response time needs improvement. Frontend bundle size reduction is priority.',
          timestamp: new Date(Date.now() - 3600000 * 8).toLocaleString(),
          isBookmarked: false
        }
      },
      {
        type: 'text',
        content: {
          title: 'Code Review Checklist',
          text: 'Remember to check: 1) Test coverage, 2) Error handling, 3) Security vulnerabilities, 4) Performance implications, 5) Documentation updates.',
          timestamp: new Date(Date.now() - 86400000 * 4).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'link',
        content: {
          title: 'API Documentation',
          url: 'https://api-docs.example.com',
          domain: 'api-docs.example.com',
          description: 'Internal API reference for microservices architecture. Updated with new authentication endpoints.',
          timestamp: new Date(Date.now() - 86400000 * 3).toLocaleString(),
          isBookmarked: false
        }
      }
    ],
    'Personal': [
      {
        type: 'text',
        content: {
          title: 'Book to Read: Atomic Habits',
          text: 'Recommended by several colleagues. Focus on building better habits through small, incremental changes. Start with the 2-minute rule.',
          timestamp: new Date(Date.now() - 86400000 * 6).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'text',
        content: {
          title: 'Workout Routine',
          text: 'Monday/Wednesday/Friday: Strength training (45 min). Tuesday/Thursday: Cardio (30 min). Weekend: Yoga or rest.',
          timestamp: new Date(Date.now() - 86400000 * 10).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'link',
        content: {
          title: 'Recipe: Healthy Meal Prep',
          url: 'https://recipes.example.com/meal-prep',
          domain: 'recipes.example.com',
          description: 'Sunday meal prep ideas for the week. Mediterranean-style bowls with quinoa, roasted vegetables, and grilled chicken.',
          timestamp: new Date(Date.now() - 86400000 * 3).toLocaleString(),
          isBookmarked: false
        }
      },
      {
        type: 'text',
        content: {
          title: 'Travel Plans: Japan Trip',
          text: 'Planning for spring: Tokyo (3 days) → Kyoto (3 days) → Osaka (2 days). Must visit: Senso-ji Temple, Fushimi Inari, teamLab Borderless.',
          timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(),
          isBookmarked: true
        }
      },
      {
        type: 'text',
        content: {
          title: 'Gift Ideas for Birthday',
          text: 'Mom: Kindle Paperwhite, Dad: Coffee subscription, Sister: Art supplies set. Check Amazon Prime for deals.',
          timestamp: new Date(Date.now() - 3600000 * 18).toLocaleString(),
          isBookmarked: false
        }
      }
    ],
  };
}
