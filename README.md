Frida Backend
============

[![Build Status](https://snap-ci.com/brasil-de-fato/frida-backend/branch/master/build_image)](https://snap-ci.com/brasil-de-fato/frida-backend/branch/master)
[![Coverage Status](https://coveralls.io/repos/brasil-de-fato/news-service/badge.svg?branch=master)](https://coveralls.io/r/brasil-de-fato/news-service?branch=master)

This is the backend for the Frida CMS (you can find the frontend code [here](https://github.com/brasil-de-fato/sylvia)), it is responsible for taking care of CRUD operations for news and publish them.
All operations are avaible through REST services.


**Interaction Between project components:**

![](http://farm6.staticflickr.com/5653/22986735544_e026af9699_b.jpg)


**Technology Stack**

frida-backend uses MongoDB to persist news so it requires an instance of [MongoDB](https://www.mongodb.org/) running somewhere.

The code is written in Node.js and Express.

When published news will be available in a folder, pointed by an environment variable, in an *.yaml front matter file.


**Development Environment**

Before running frida-backend (or its tests) it is necessary to:

* install
  * Node.js v.0.12.7
  * MongoDB v.3.0
* create a `.env` file from the `.env_example` and edit the values

```bash
  $ cp .env_example .env
```

**NOTICE**: frida-backend only runs over SSL. If you are using a self signed cert (as the one we use for testing) make sure frida-frontend can make calls to it by adding an exception for the certificate in the browser. To do so, make a request through the browser to the API and when prompted by the browser, add an exception for the certificate.

## Installing dependencies


```
$ npm install
```

## Running the tests

```
$ npm test
```

## Running the service

### to run with node

```
$ npm start
```
### to run with [pm2](https://github.com/Unitech/pm2)
PM2 is a production process manager. Make sure it is installed globally and run.

```bash
$ npm install pm2 -g
$ pm2 start pm2-config.json
```

Remember to make a request to some resource in the API URL (ex.: https://localhost:5000/news) and add the certificate to the browser you'll be using frida-frontend with.

## Creating users

To use frida-backend you will need to create at least one user to login into the system. To do it, go to the folder **/home/frida/components/frida-backend** and run the following command

```bash
$ node lib/cli/frida.js create
```

**Note:** You will need to provide Email, Name and a Password to create the user

## Scripts

* Repulish all news

```bash
$ node ./scripts/republish-all.js
```

* Rename news area

```bash
$ node ./scripts/migrate-news-area.js OLD_AREA NEW_AREA
```

# Code Style

We are using [ESLint](http://eslint.org/) to lint javascript files.

```bash
$ npm run eslint
```

To fix all files:

```bash
$ npm run eslint-fix
```
