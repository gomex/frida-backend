News Service
============

[![Build Status](https://snap-ci.com/brasil-de-fato/news-service/branch/master/build_image)](https://snap-ci.com/brasil-de-fato/news-service/branch/master)

News Service is the component of Frida CMS responsible for taking care of CRUD operations for news, as well as to publish news in the website managed by Frida (although there are plans to move this responsibility to its own service). It uses MongoDB to persist all data and requires an instance of MongoDB running somewhere.

Before running news service (or its tests) it is necessary to define the following environment variables:

```
DATABASE_URL=<the url for the mongodb instance>

HEXO_POSTS_PATH=<the path where markdown files for publication should be saved>

EDITOR_USERNAME=<the username used to authorize the use of news service API>

EDITOR_PASSWORD=<the password used to authorize the use of news service API>
```

## Installing dependencies


```
$ npm install
```

## Running the tests

```
$ npm test
```

## Running the service

### with node
```
$ npm start
```
### with nodemon
make sure nodemon is installed globally and run

```
$ nodemon ./index.js
```
### with pm2
make sure pm2 is installed globally and run

```
$ pm2 start pm2-config.json
```
