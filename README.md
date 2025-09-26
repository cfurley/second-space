[![Docker Compose CI](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml/badge.svg)](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml)

<small>CS3203 Group D</small>


# Second Space
<img src='./resources/FigmaMarkupV1.png'>

<br><br>

# Summary

This is the repository for <b>Second Space</b>, an AI Integrated Hub for saving and creating think/mood boards with media from the users device or social media profiles.

<br>

# Installation
1. Install and Launch Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Clone into this repository and open with your IDE..
3. In your IDE terminal run the command: <b>"docker compose up"</b>
4. Open a browser and visit: <b>"localhost or 127.0.0.1"</b>
5. To stop the servers run: <b>"docker compose down"</b>

Note: To to make errors go away in the frontend, run the command:<br>
npm i --save-dev @types/react @types/react-dom  

<br>

# Feature Ideas
* AI: Help scrape media for the spaces, as well as help format and create spaces.
* Customization: Bitmoji, Profile Picture, Themes(monkey-type), Custom Themes, ..
* Spaces: think/mood boards for users to create and add media
* Data Sharing: Upload media such as videos, images, text, gifs, ..
* Promo Events: Special Bit Mojos, or special themes for certain events.
* Collaberation: Multiple users able to share and work on the same mood board at the same time.
* Time Capsule: Create time capsule spaces which shows what you did a year ago, or five years ago.

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
* Clone the repository
* Create and Publish a new Branch.

### Submitting Changes
* Create a pull request to main.
* Build tests will be run.
* Another Peer will Review the pull request.
* If it passes peer review, it'll be merged to the Main Branch.

<br><br><br>
<hr>

<small>
    Group D<br>
    CS3203<br>
    © 2025, Second Space<br>
</small>