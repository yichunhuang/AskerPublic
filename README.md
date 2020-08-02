# AskerPublic
Asker is a web platform for one on one tutorial. Students can upload questions with text and photos, our system will send notifications to teachers. Students can get answers through live chat with top-level teachers here.

#### Website URL: https://asker.mu.yichunhuang.com (no longer exist)
#### DEMO URL: https://www.youtube.com/watch?v=nh9Pyt4JNE8
[![DEMO](http://img.youtube.com/vi/nh9Pyt4JNE8/0.jpg)](http://www.youtube.com/watch?v=nh9Pyt4JNE8 "DEMO")

---

## Table of Contents

   * [AskerPublic](#askerpublic)
      * [Main Features](#main-features)
      * [Play with Testing Account](#play-with-testing-account)
      * [Backend Technique](#backend-technique)
         * [Programming Language](#programming-language)
         * [Infrastructure](#infrastructure)
         * [Environment &amp; Framework](#environment--framework)
         * [Database &amp; Cache](#database--cache)
         * [Cloud Service](#cloud-service)
         * [Networking](#networking)
         * [Key Concepts](#key-concepts)
      * [Frontend Technique](#frontend-technique)
         * [Programming Language](#programming-language-1)
         * [Library and Framework](#library-and-framework)
      * [Database Schema](#database-schema)
      * [Backend Architecture](#backend-architecture)
      * [API Docs](#api-docs)
        * [Response Objects](#response-objects)
        * [GraphQL Schema](#graphql-schema)
      * [Contact](#contact)

---
## Main Features
- Payment with Stripe
- Display Order List
  - Users can see all of their orders
- Post Search
  - Teacher can filter posts by subjects
  - Users can search post by keywords when looking for historical posts
- Live Chat
  - Support sending texts, uploading files, and drawing on board
  - Show if teacher or student is online
- Chat Records 
  - Users can trace their past conversation
- Member System
  - Support native and facebook account

---

## Play with Testing Account
#### Student
email: student_test@gmail.com <br>
password: 123456
- Payment:
    - Card Number: 4242 4242 4242 4242
    - Date Expiry: 01/23 
    - CVV: 123

#### Teacher
email: teacher_test@gmail.com <br>
password: 123456

---

## Backend Technique
### Programming Language
- Javascript (mostly ES6)

### Infrastructure 
- Kubernetes
- Docker

### Environment & Framework
- Node.js
- Express.js

### Database & Cache
- MySQL
- ORM: Bookshelf.js
- Redis

### Cloud Service
- AWS EC2
- AWS ELB
- AWS S3, CloudFront
- AWS Route 53

### Networking
- HTTPS
- SSL
- Domain Name System (DNS)

### Key Concepts
- GraphQL APIs
- Socket.IO
- Canvas
- Patterns: M(V)C and DAO
- Version Control: Git and GitHub

---

## Frontend Technique
### Programming Language
- HTML, CSS, Javascript
### Library and Framework
- jQuery

---

## Database Schema
![](https://i.imgur.com/vZYROYk.png)


---

## Backend Architecture
![](https://i.imgur.com/u3nnPm4.png)

---
## API Docs
### Response Objects

* `User Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | User's id |
| provider | String | Account's provider (native / facebook) |
| name | String | User's name |
| email | String | User's email |
| role | String  | User's role (student / teacher) |
| accessToken | String | Token for verifying identity |
| accessExpired | String | Expired time for accessToken |
| point | Int | Asker's currency |
| createdAt | String  | Time when account is created |
| photo | String | User's photo |

* `Subject Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | Subject's id |
| name | String | Subject's name |

* `Post Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | Post's id |
| title | String | Post's title |
| subject | SubjectType | Post's subject |
| content | String | Post's content |
| images | String  | Post's images |
| student | UserType | Student who asks in this post |
| teacher | UserType | Teacher who answers for this post |
| status | String | Post's status (Unanswer / Answering / Answered / Discard) |
| chatRecords | Array of ChatRecordType | All chatRecords of the post|
| createdAt | String  | Time when post is created |

* `ChatRecord Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | ChatRecord's id |
| postId | Int | Post's id |
| senderId | Int | Sender's id |
| msgType | String | Message's type (text / image) |
| msg | String  | Message's content |
| createdAt | String | Token for verifying identity |
| accessExpired | String | Expired time for accessToken |
| point | int | Asker's currency |
| createdAt | String  | Time when message is created |



* `StudentOrder Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | StudentOrder's id |
| student | UserType | Student who owns the order |
| total | Int | Total amount paid in the order |
| status | String | StudentOrder's status (paid / unpaid) |
| recipientEmail | String  | Order information is sent to this email
| createdAt | String  | Time when StudentOrder is created |

* `TeacherOrder Object`

| Field | Type | Description |
| :---: | :---: | :--- |
| id | ID | TeacherOrder's id |
| teacher | UserType | Teacher who owns the order |
| total | Int | Total amount received in the order |
| status | String | TeacherOrder's status (received / unreceived) |
| recipientEmail | String  | Order information is sent to this email
| createdAt | String  | Time when TeacherOrder is created |
##
### GraphQL Schema
#### RootQueryType
![](https://i.imgur.com/SQ5SZpE.png)


#### Mutation
![](https://i.imgur.com/1fdIABU.png)

---

## Contact
#### Yi-Chun Huang
#### E-mail: b03704074@gmail.com









