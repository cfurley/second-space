[![Docker Compose CI](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml/badge.svg)](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml)

<small>CS3203 Group D</small>

# Second Space

<img src='./resources/FigmaMarkupV1.png'>

<br><br>

# Summary

This is the repository for <b>Second Space</b>, an AI Integrated Hub for saving and creating think/mood boards with media from the users device or social media profiles.

<br>

# Installation & Code Updates

## 🚀 Quick Start (For New Developers)

```bash
git clone https://github.com/cfurley/second-space.git
cd second-space
docker-compose up --build
```

**That's it!** Visit http://localhost:80 to see the app running locally.

## 📝 Development Workflow

1. <b>Clone</b> into the repository.
2. <b>Checkout a separate branch</b> and edit any code you wish.
3. <b>Test locally</b> with `docker-compose up` - no setup needed!
4. <b>Publish your branch</b> to the repository with a push.
5. Go to Github, and <b>open a pull request</b> by clicking the yellow popup at the top of your screen.
6. Tests will trigger to run automatically, and a <b>peer will review the pull request</b>. If it is valid, the peer will merge your branch to main.
7. When merged, will <b>automatically integrate</b> and will <b>automatically deploy</b> to the live application at https://cfurley.github.io/second-space/ which can be accessed from any browser on any type of device, anywhere. Its a full functional website.

## 📚 Documentation

- **[DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md)** - Complete setup guide for developers
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - How to deploy to Render.com
- **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** - Quick reference guide

<br>

# Feature Ideas

- AI: Help scrape media for the spaces, as well as help format and create spaces.
- Customization: Bitmoji, Profile Picture, Themes(monkey-type), Custom Themes, ..
- Spaces: think/mood boards for users to create and add media
- Data Sharing: Upload media such as videos, images, text, gifs, ..
- Promo Events: Special Bit Mojos, or special themes for certain events.
- Collaberation: Multiple users able to share and work on the same mood board at the same time.
- Time Capsule: Create time capsule spaces which shows what you did a year ago, or five years ago.

<br>

# Project Architecture

<img src='./resources/second_space_architecture.png' width="720"> <br>

### AI

This is the main feature of the software product. <b>Second Space AI</b> could help scrape media for users as well as assist in space organization and creation.

### Frontend

This is the <b>Main User Facing Application</b>, it includes the <b>home page</b>, <b>login flow</b>, <b>space creation flow</b>, etc.

### Backend

Using <b>NodeJS Express</b>, the backend handles <b>API Routes</b> for data transfers between <b>Frontend <--> AI</b>, and <b>Frontend <--> Datbase.</b>

### Database

The database is <b>Postgres SQL</b> and the scheme is currently being created.

### Resources

This directory is the place to store resources for the website such as <b>images</b> or <b>icons</b>.

<br>

# Contributing to Second Space

### Getting Started

- Clone the repository
- Create and Publish a new Branch.

### Submitting Changes

- Create a pull request to main.
- Build tests will be run.
- Another Peer will Review the pull request.
- If it passes peer review, it'll be merged to the Main Branch.

<br><br><br>

<hr>

<small>
    Group D<br>
    CS3203<br>
    © 2025, Second Space<br>
</small>
