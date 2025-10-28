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

## 📚 Documentation

| Document                                         | Purpose                                                          |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)**   | 📦 Complete project reference - structure, tech stack, workflows |
| **[INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)** | 🔧 Architecture, CORS explained, API, testing, deployment steps  |

**New to the project?** Start with PROJECT_OVERVIEW.md!  
**Need to deploy?** See INTEGRATION_GUIDE.md!

---

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

### Documentation

- **Architecture & API:** See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Full Project Overview:** See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) _(coming soon)_

### Contact

- Open an issue on GitHub
- Ask in team chat
- Review existing documentation

---

<hr>

<small>
    Group D<br>
    CS3203<br>
    © 2025, Second Space<br>
</small>
