[![Run Tests](https://github.com/cfurley/second-space/actions/workflows/test.yml/badge.svg)](https://github.com/cfurley/second-space/actions/workflows/test.yml)
[![Deploy to GitHub Pages](https://github.com/cfurley/second-space/actions/workflows/deploy.yml/badge.svg)](https://github.com/cfurley/second-space/actions/workflows/deploy.yml)

<small>CS3203 Group D</small>

# Second Space

<img src='./resources/FigmaMarkupV1.png'>

## 🎯 What is Second Space?

**Second Space** is an AI-powered hub for creating and organizing visual mood boards and think spaces. Save and curate media from your device or social media profiles in beautiful, customizable spaces.

**🌐 Live App:** https://cfurley.github.io/second-space/

---

## 🚀 Getting Started (5 Minutes!)

### Prerequisites

- **Docker Desktop** installed ([Download here](https://www.docker.com/products/docker-desktop))
- **Node.js and npm** installed ([Download here](https://nodejs.org/)) - Required for running tests and local development
- **Git** installed
- That's it! No other setup needed.

### Start Developing

```bash
# 1. Clone the repository
git clone https://github.com/cfurley/second-space.git
cd second-space

# 2. Start the full application
docker-compose up --build

# 3. Open your browser
# Frontend: http://localhost
# Backend API: http://localhost:8080
```

**Done!** The entire stack (frontend, backend, database) is running on your machine. ✅

---

## 🤝 How to Contribute

### 1. Create Your Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit any files you want. The app will reload automatically with your changes!

### 3. Test Locally

```bash
# Make sure everything works
docker-compose up --build

# Visit http://localhost to test
```

### 4. Push Your Branch

```bash
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request

1. Go to GitHub - you'll see a yellow banner to create a PR
2. Click "Compare & pull request"
3. Describe what you changed
4. Submit for review

### 6. Automated Review Process

- ✅ **Automated tests** run on your PR
- 👥 **Team member reviews** your code
- 🎉 **Auto-deploys** to production when merged to main

---

## ✨ Feature Roadmap

### Current Features

- 🔐 User authentication (signup/login)

### Coming Soon

- 📦 **Space creation and management** - Create and manage user spaces
- 🎨 **Theme customization** - Choose from various themes
- 📱 **Media organization** - Import and organize media such as PNG, MP4, GIFs
- 🤖 **AI Integration** - Help scrape and organize media automatically
- 👥 **Collaboration** - Share and work on spaces with others in real-time
- ⏰ **Time Capsule** - See what you did a year ago
- 🎭 **Customization** - Profile pictures, custom themes, bitmoji integration
- 🎉 **Special Events** - Limited edition themes and features

---

## 🏗️ Project Architecture

<img src='./resources/second_space_architecture.png' width="720">

### Current Stack

```
Production (Free Hosting):
  GitHub Pages (Frontend) ──▶ Render.com (Backend + Database)

Local Development:
  Docker Compose (Frontend + Backend + Database)
```

### Components

**🎨 Frontend** (`frontend/`)

- Built with React + TypeScript + Vite
- Styled with Tailwind CSS
- Deployed to GitHub Pages
- Lives at: https://cfurley.github.io/second-space/

**⚙️ Backend** (`backend/`)

- Node.js + Express server
- RESTful API endpoints
- CORS-enabled for cross-origin requests
- Deployed to Render.com (free tier)

**🗄️ Database** (`database/`)

- PostgreSQL 16
- Initialization scripts in `database/init/`
- Hosted on Render.com (free tier)

**🤖 AI** (`ai-server/`)

- Future AI integration for media scraping and organization
- _Coming soon!_

**📦 Resources** (`resources/`)

- Images, icons, and design assets

---

## 🛠️ Tech Stack

| Layer            | Technology                                    |
| ---------------- | --------------------------------------------- |
| Frontend         | React, TypeScript, Vite, Tailwind CSS         |
| Backend          | Node.js, Express.js                           |
| Database         | PostgreSQL 16                                 |
| Deployment       | GitHub Pages (frontend), Render.com (backend) |
| CI/CD            | GitHub Actions                                |
| Containerization | Docker Compose                                |

---

## 🧪 Testing

### Prerequisites

Before running tests, ensure you have **Node.js and npm** installed:

- **Node.js** (includes npm) - [Download here](https://nodejs.org/) (LTS version recommended)
- Verify installation: `node --version` and `npm --version`

Then install dependencies:

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd backend
npm install
```

### Running All Tests

```bash
# Frontend tests (Vitest)
cd frontend
npm test

# Backend tests (Node.js test runner)
cd backend
npm test

# Full integration test
docker-compose up --build
# Visit http://localhost to test
```

Tests run automatically on every pull request! ✅

### Running Individual Test Files

You can run specific test files to focus on particular features or components:

#### Frontend Tests

```bash
cd frontend

# Run a specific test file (watch mode)
npm test login.test.tsx

# Run a specific test file (run once and exit)
npm test -- login.test.tsx --run

# Run tests matching a pattern
npm test -- --testPathPattern="login"

# Run tests with coverage
npm test -- login.test.tsx --coverage

# Run all tests in a directory
npm test -- src/components/__tests__/

# Run tests in watch mode with UI
npm test -- --ui
```

#### Available Frontend Test Files

- `src/components/__tests__/login.test.tsx` - Login component tests (14 tests)
- `src/utils/__tests__/api.test.ts` - API client tests
- `src/utils/__tests__/usernameValidator.test.ts` - Username validation tests
- `src/utils/__tests__/passwordValidator.test.ts` - Password validation tests

#### Backend Tests

```bash
cd backend

# Run all backend tests
npm test

# Run specific test file
npm test -- test.js

# Run user controller tests
npm test -- src/controllers/__tests__/userControllers.test.js
```

#### Interactive Test Commands (Watch Mode)

When running tests in watch mode, you have these options:

- **`h`** - Show help
- **`a`** - Run all tests
- **`f`** - Run only failed tests
- **`t`** - Filter by test name pattern
- **`q`** - Quit watch mode
- **`Enter`** - Trigger test re-run

### Test Coverage

Generate detailed test coverage reports:

```bash
# Frontend coverage
cd frontend
npm test -- --coverage

# View coverage report
open coverage/index.html
```

### Writing New Tests

When adding new features, create corresponding test files:

```bash
# Frontend test structure
frontend/src/
  components/
    __tests__/
      YourComponent.test.tsx
  utils/
    __tests__/
      yourUtil.test.ts

# Backend test structure
backend/src/
  controllers/
    __tests__/
      yourController.test.js
```

### Test Debugging

```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests with debugging enabled
npm test -- --inspect-brk

# Run a single test within a file
npm test -- login.test.tsx -t "should successfully login"
```

---

## 📊 Project Status

- ✅ Frontend deployed to GitHub Pages
- ✅ Backend API with CORS support
- ✅ Database schema and initialization
- ✅ Docker Compose local development
- ✅ CI/CD pipeline with GitHub Actions
- 🚧 Backend deployment to Render.com (in progress)
- 🚧 AI integration (planned)
- 🚧 Collaboration features (planned)

---

## 👥 Team Guidelines

### Code Style

- Use TypeScript for frontend code
- Use ESM imports (`import/export`) in backend
- Follow existing code patterns
- Add comments for complex logic

### Git Workflow

1. Never commit directly to `main`
2. Always work in feature branches
3. Keep commits small and focused
4. Write descriptive commit messages
5. Wait for PR approval before merging

### Before Submitting PR

- [ ] Test locally with `docker-compose up`
- [ ] Run tests: `npm test` in frontend and backend
- [ ] Check for console errors
- [ ] Update documentation if needed

---

## 🆘 Need Help?

### Common Issues

**Docker won't start?**

```bash
docker-compose down -v
docker-compose up --build
```

**Frontend not loading?**

```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend
```

**Database connection error?**

```bash
# Wait 10 seconds after starting for DB to be ready
docker-compose logs database | grep "ready to accept connections"
```

### Contact

- Open an issue on GitHub
- Ask in team chat
- Review [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for architecture and API details

---

<hr>

<small>
    Group D<br>
    CS3203<br>
    © 2025, Second Space<br>
</small>
