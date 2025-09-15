CS3203 Group D

# Second Space
<img src='./resources/stock_image_01.png'>

# Summary

This is the repository for <b>Second Space</b>, an AI Integrated Hub for saving and creating think/mood boards with media from the users device or social media profiles. **Feel free to expand upon this summary.

# Feature Ideas
* AI: Help scrape media for the spaces, as well as help format and create spaces.
* Customization: Bitmoji, Profile Picture, Themes(monkey-type), Custom Themes, ..
* Spaces: think/mood boards for users to create and add media
* Data Sharing: Upload media such as videos, images, text, gifs, ..
* Promo Events: Special Bit Mojos, or special themes for certain events.
* Collaberation: Multiple users able to share and work on the same mood board at the same time.
* Time Capsule: Create time capsule spaces which shows what you did a year ago, or five years ago.

# Installation
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/
2. Clone into this repository from https://github.com/cfurley/software-engineering-group-d
3. Open the product in your ide..
4. Open a terminal..
5. Build the docker images:<br>
   Run the command: "docker build -t second-space-frontend ./frontend"<br>
   Run the command: "docker build -t second-space-backend ./backend"<br>
   second-space-ai & second-space-database are WIP..
6. Run the docker containers:<br>
   Run the command: "docker run -d -p 80:80 second-space-frontend"<br>
   Run the command: "docker run -d -p 8080:8080 second-space-backend"<br>
   second-space-ai & second-space database are WIP..
7. In your web browser visit: "localhost:80" for the frontend.<br>
   In your web browser visit: "localhost:8080" for the backend.<br>
   ...ai & database are WIP...

# Project Architecture
<img src='./resources/second_space_architecture_01.png' width="720"> <br>
Single Server Architecture: Diagram 1

## AI

This is the main feature of the software product. <b>Second Space AI</b> could help scrape media for users as well as assist in space organization and creation.

## Frontend

This is the part of the application which the users will interact with. The frontend will be built in ReactJS and will interact directly with the backend api.

## Backend

This will host our api and if necessary other server side processes. (could be broken up into microservices, our ai-server is a google example of this).

The frontend will send request to the backend for data from the database, or to access ai features, and the API will route, check validaty, and handle all such requests, and respond the frontend with the necessary data, changes, or error codes.

## Database

This is the database for the application. The database will hold user account information, and depending on how it is designed and implemented, will also host the user data such as the media for the spaces, or saves of the spaces.

## Resources
This directory is the place to store resources for the website such as <b>images</b> or <b>icons</b>.

# Editing Code & Branching

We need to make a standard for code editing, branching, mergine, pull requests, etc..

# Testing

We need to make a standard for testing, likely using github actions.
