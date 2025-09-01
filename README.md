CS3203 Group D

# Second Space
<img src='./resources/stock_image_01.png'>

## Summary

This is the repository for <b>Second Space</b>, an AI Integrated Hub for saving and creating think/mood boards with media from the users device or social media profiles. **Feel free to expand upon this summary.

## Project Architecture
<img src='./resources/second_space_architecture_01.png' width="200"> 
OR
<img src='./resources/second_space_architecture_02.png' width='200'>


### AI

This is the main feature of the software product. <b>Second Space AI</b> could help to build the <b>Spaces</b> where users can collect their media too. <b>Second Space AI</b> could also gather media from other websites or google images for the users. think of the search for media thats built into modern powerpoint. **Again Feel Free To Edit This.

### Frontend

This is the frontend of the second space application. I copied over the demo that LightTurtle made. Use the command -> <b>"npm i; npm run dev;"</b> to run the program. (You must have nodejs and npm installed.)

The frontend of the application is what the users will interact with, this can be the <b>web application</b>, or even the <b>mobile application.</b> For web, frameworks lite VueJS or React can be used. For mobile there is Swift, and Java im pretty sure for Android.

### API

This is the communication hub for the application. This can be built in either <b>PHP</b> or <b>NodeJS</b>. This should ideally be stateless, and be used for handling POST and GET requests, and interacting with the database on a seperate port than the frontend for security.



### Database

This is the database for the second space application. This can either be a <b>MySQL</b>, <b>Postgres</b>, or <b>MongoDB</b> database. 

It's worth noting that if we are storing data such as images or gifs or other unstructured data, it might be worth using MongoDB. this is because it stores data in json format do its more flexibly than a SQL table. There are AWS, Google, and Microsoft server hosts for MongoDB, but I think local would be better since its free.

### Resources
This directory can be a place to store resources for the website such as <b>images</b> or <b>icons</b>. Currently it contains one of the stock images Riley had in the presentation.

## Editing Code & Branching
Please push code to the <b>dev</b> branch, that way main is our stable application branch.
