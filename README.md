Frida Backend
============

[![Build Status](https://snap-ci.com/brasil-de-fato/frida-backend/branch/master/build_image)](https://snap-ci.com/brasil-de-fato/frida-backend/branch/master)
[![Coverage Status](https://coveralls.io/repos/brasil-de-fato/news-service/badge.svg?branch=master)](https://coveralls.io/r/brasil-de-fato/news-service?branch=master)

This is the backend for the Frida CMS (you can find the frontend code [here](https://github.com/brasil-de-fato/frida-frontend)), it is responsible for taking care of CRUP operations for news: Create, Read, Update and Publish.
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
# The username used to authorize the use of frida backend
#
export EDITOR_USERNAME=user

#
# The password used to authorize the use of frida backend
#
export EDITOR_PASSWORD=pass

#
# The path for the ssl certificate
# There is a certificate inside the test folder of frida backend
#
export CERT_FILE_PATH=<path_to_frida_backend>/test/ssl/ssl.crt

#
# The path for the ssl key
# There is a certificate inside the test folder of frida backend
#
export KEY_FILE_PATH=<path_to_frida_backend>/test/ssl/ssl.key
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

Remember to make a request to some resource in the API URL (ex.: https://localhost:5000/news) and add the certificate to the browser you'll be using frida-frontend with.
