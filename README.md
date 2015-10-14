# MobileCaddy Codeflow

Copyright (c) 2015 MobileCaddy

## Overview

MobileCaddy Libraries and supporting files to enable local MobileCaddy development.

Also includes the Codeflow Single-Intance App Manager that runs a secondary application (along side the one you may be building). This application can be accessed on [http://localhost:3030/codeflow](http://localhost:3030/codeflow).

The app runs off the localStorga items of the Ionic app that you are building, and as such this app should be running prior to accessing this app (The Codeflow Single-Instance App Manager is accessed through the same server that is started with your Ionic App).

## Development and Testing

To develop, test and build the app you must clone from the git repo (not from NPM) and run the following to install the development dependancies, setup the project for local running, etc. The app should be started up in a new browser tab (or can be accessed via http://localhost:3030/codeflow-app](http://localhost:3030/codeflow-app))

```
npm install
grunt devsetup
grunt serve
```


Copyright 2015 MobileCaddy Ltd
