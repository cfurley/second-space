[![Docker Compose CI](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml/badge.svg)](https://github.com/cfurley/second-space/actions/workflows/ci-docker-compose-.yml)

CS3203 Group D

# Second Space
<img src='./resources/stock_image_01.png'>

<br><br>

# Summary

This is the repository for <b>Second Space</b>, an AI Integrated Hub for saving and creating think/mood boards with media from the users device or social media profiles.

<br>

# Installation
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Clone into this repository..
3. Open the project in your IDE..
4. In your IDE terminal run the command:<br>
   "docker compose up -d"
5. Open a browser and visit:<br>
   "localhost:80" <- frontend<br>
   "localhost:8080" <- backend<br>
6. To stop the servers run:<br>
   "docker compose down"

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

This is the part of the application which the users will interact with. The frontend will be built in ReactJS and will interact directly with the backend api.

### Backend

This will host our api and if necessary other server side processes. (could be broken up into microservices, our ai-server is a google example of this).

The frontend will send request to the backend for data from the database, or to access ai features, and the API will route, check validaty, and handle all such requests, and respond the frontend with the necessary data, changes, or error codes.

### Database

This is the database for the application. The database will hold user account information, and depending on how it is designed and implemented, will also host the user data such as the media for the spaces, or saves of the spaces.

### Resources
This directory is the place to store resources for the website such as <b>images</b> or <b>icons</b>.

<br>

# Editing Code & Branching

Workflow:
1. git pull
2. git branch new-branch-name
3. git checkout new-branch-name
4. ** make all the code changes you need **
5. git add path/to/files/changed
6. git commit -m "Message about the commit"
7. git push --set-upstream origin new-branch-name
8. ** go to github **
9. ** merge pull request with main **
10. git checkout main
11. git pull

This allows us to utilize pull requests properlly and help to avoid making edits to the codebase which could break it.
Dont forget to run git pull before editing code.

<br>

# Testing

When code is pushed to main or merged via a pull request, the CI Docker Compose workflow will trigger and create a virtual machine in which itll run all our server and test if they are online. The badge at the top of the readme will indicate the most recent status of these tests.

Currently, the tests only check if the servers go online and stay running, but we can write individual tests, such as a GET or POST request for each of the parts of the application like frontend, backend, datbase queries, etc. These tests, when written can be integrated into the Github Actions worlflow to run on every push or merge with main.

