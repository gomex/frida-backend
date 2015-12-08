News Service
============

[![Build Status](https://snap-ci.com/brasil-de-fato/news-service/branch/master/build_image)](https://snap-ci.com/brasil-de-fato/news-service/branch/master)
[![Coverage Status](https://coveralls.io/repos/brasil-de-fato/news-service/badge.svg?branch=master)](https://coveralls.io/r/brasil-de-fato/news-service?branch=master)

News Service is the backend of [Frida CMS](https://github.com/brasil-de-fato/cms), it is responsible for taking care of CRUP operations for news: Create, Read, Update and Publish.
All operations are avaible through REST services.


**Technology Stack**

News service uses MongoDB to persist news so it requires an instance of [MongoDB](https://www.mongodb.org/) running somewhere.

The code is written in Node.js and Express.

When published news will be available in a folder, pointed by an environment variable, in an *.yaml front matter file.


**Development Environment**

Before running news service (or its tests) it is necessary to: 

* install
   * Node.js v.0.12.7
   * MongoDB v.3.0

* define the following environment variables, example written for mac/linux:


```
#
# URL for mongodb instance.
# In this example mongo is running locally with database named: bdf
# 
export DATABASE_URL=mongodb://localhost/bdf

#
# Folder from where hexo is going to read content files
# You'll have to download https://github.com/brasil-de-fato/site project and point to its source folder.
#
export HEXO_SOURCE_PATH=<sites_path>/source

#
# The username used to authorize the use of news service API
#
export EDITOR_USERNAME=user

#
# The password used to authorize the use of news service API
#
export EDITOR_PASSWORD=pass

#
# The path for the ssl certificate
# There is a certificate inside the test folder of news-service
#
export CERT_FILE_PATH=<path_to_news_service>/test/specs/ssl/ssl.crt

#
# The path for the ssl key
# There is a certificate inside the test folder of news-service
#
export KEY_FILE_PATH=<path_to_news_service>/test/specs/ssl/ssl.key
```


**NOTICE**: News Service only runs over SSL. If you are using a self signed cert (as the one we use for testing) make sure Frida UI can make calls to it by adding an exception for the certificate in the browser. To do so, make a request through the browser to the API and when prompted by the browser, add an exception for the certificate.

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

#### Service API URL
Starting with node: https://localhost:5000/api

Remember to access the API URL and add the certificate to the browser you'll be using Frida(CMS) with.
