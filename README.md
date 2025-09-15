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
1. Install Docker Desktop..
2. Clone into the repository..
4. Run the command: "docker build frontend -t frontend-server:0.1;<br>
   Run the command: "docker build backend -t backend-server:0.1;<br>
   ai & database are WIP..
6. Run the command: "docker run frontend-server:0.1 -d -p 80:80<br>
   Run the command: "docker run backend-server:0.1 -d -p 8080:8080<br>
   ai & database are WIP..
7. In your web browser visit: "localhost:80" for the frontend.<br>
   In your web browser visit: "localhost:8080" for the backend.<br>
   ai & database are WIP..

# Project Architecture
<img src='./resources/second_space_architecture_01.png' width="720"> <br>
Single Server Architecture: Diagram 1

## AI

This is the main feature of the software product. <b>Second Space AI</b> could help to build the <b>Spaces</b> where users can collect their media too. <b>Second Space AI</b> could also gather media from other websites or google images for the users. think of the search for media thats built into modern powerpoint. **Again Feel Free To Edit This.

## Frontend

This is the part of the application which the users will interact with. The frontend will be built in ReactJS and will interact directly with the backend api

## API

This is the communication hub for the application. This can be built in either <b>PHP</b> or <b>NodeJS</b>. This should ideally be stateless, and be used for handling POST and GET requests, and interacting with the database on a seperate port than the frontend for security.

<b>The API</b> can either have <b>processes within the server itself</b>, as shown in the <b>first architecture diagram</b>, or can be a <b>multi-service or micro-service</b> application with <b>processes being handled on their own containers</b> which can be disconnected, or updated on with patches to that specific system.

<b>The type of processes</b> that either the api-server or microservices would handle are:  <b>{authentication, registration, upload, download, payment, printing, dispatch, erorr logging}</b>

## Database

This is the database for the second space application. This can either be a <b>MySQL</b>, <b>Postgres</b>, or <b>MongoDB</b> database. 

<b>SQL Databases are very good for structured data</b>. Things like user accounts or purchases with ACID practices. For unstructured data that is changing, for example: images; gifs; videos; whacky text files; anything really.. <b>NoSQL databases such as MongoDB would be very good.</b> They can easily be setup with a docker container and a volume which can actually just be used on any virtual machine. <b>The data is more flexible</b> as its in <b>JSON</b> format and is literally <b>variable->value pairs for objects.</b>

## Resources
This directory is the place to store resources for the website such as <b>images</b> or <b>icons</b>. Currently it contains one of the stock images Riley had in the presentation, as well as the flow charts for different application architectures.

# Editing Code & Branching
Please push code to the <b>dev</b> branch, that way main is our stable application branch.

# Testing
We can try to use testing through github, or write our own test. Im not very familiar with this process..
