#!/usr/bin/env node
var express = require('express'),
  request = require('request'),
  bodyParser = require('body-parser'),
  fs = require('fs-extra'),
  app = express();
var record = process.argv[3] ? true : false;

const fPath = 'www/mock';
const p2mPath = fPath + '/p2mRefreshTable';

// Prep directories for writing to, if we need to
if (record) {
  var createp2mDir = function() {
    fs.exists(p2mPath, function(exists) {
      if (!exists) {
        fs.mkdirSync(p2mPath);
      }
    });
  };

  fs.exists(fPath, function(exists) {
    if (!exists) {
      fs.mkdirSync(fPath);
    } else {
      // make backup of existing mock
      var nowD = new Date();
      var bupPath = nowD
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '');
      fs.copySync(fPath, fPath + '-' + bupPath);
    }
    createp2mDir();
  });
}

function recordResponse(req, response, body) {
  var fPath2 = fPath;
  fName = '';

  var path = req.url.split('/').pop();
  console.log('path', path);

  if (response.statusCode == 200) {
    switch (path) {
      case 'getAUDInfo001':
        fName = 'getAudInfo.json';
        break;
        case 'getAppConfig001':
          fName = 'getAppConfig.json';
          break;
      case 'getSystemDataSoupDefinition001':
        fName = 'getSystemDataSoupDefinition.json';
        break;
      case 'getSysDataSoupVariables001':
        fName = 'getSysDataSoupVariables.json';
        break;
      case 'getDefsForSObjectMobileTables001':
        fName = 'getDefsForSObjectMobileTables.json';
        break;
      case 'p2mRefreshRecTypeDOTs001':
        fName = 'p2mRefreshRecTypeDOTs.json';
        break;
      case 'p2mRefreshTable001':
        if (req.body.lastRefreshDateTime == 0) {
          // only update mocks if it's the first response.
          fPath2 = p2mPath;
          fName = req.body.mobileTableName + '.json';
        }
        break;
      default:
        fName = '';
    }
    if (typeof(body) == 'object') {
      body = JSON.stringify(body);
    }
    if (fName !== '') {
      fs.writeFile(fPath2 + '/' + fName, body, function(err) {
        if (err) {
          return console.log(err);
        }
      });
    }
  }
}

function storeFileLocally(body) {
  // console.log('Storing file: /www/mock/files/' + body.filename);
  var dir = 'www/mock/files';

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  fs.writeFile(dir + '/' + body.filename, body.base64, 'base64', function(err) {
    if (err) console.log(err);
  });
  //   bodyParams = JSON.parse(body);
  //   console.log('filename', filename);
}

app.use(bodyParser.json({ limit: '50mb' }));

app.all('*', function(req, res, next) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    req.header('access-control-request-headers')
  );

  if (req.method === 'OPTIONS') {
    // CORS Preflight
    res.send();
  } else {
    if (req.originalUrl.includes('/codeflow/storefile')) {
      storeFileLocally(req.body);
      res.send(200);
    } else {
      var targetURL = req.header('Target-URL');
      if (!targetURL) {
        res.send(500, {
          error: 'There is no Target-Endpoint header in the request'
        });
        return;
      }
      if (req.method === 'GET') {
        request(
          {
            url: targetURL + req.url,
            method: req.method,
            headers: { Authorization: req.header('Authorization') }
          },
          function(error, response, body) {
            if (error) {
              console.error('error: ' + error);
              if (typeof response !== 'undefined')
                console.error('error: ' + response.statusCode);
            } else {
              if (record) recordResponse(req, response, body);
            }
          }
        ).pipe(res);
      } else {
        request(
          {
            url: targetURL + req.url,
            method: req.method,
            json: req.body,
            headers: { Authorization: req.header('Authorization') }
          },
          function(error, response, body) {
            if (error) {
              console.error('error: ' + error);
              if (typeof response !== 'undefined')
                console.error('error: ' + response.statusCode);
            } else {
              if (record) recordResponse(req, response, body);
            }
          }
        ).pipe(res);
      }
    }
  }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log('Proxy server listening on port ' + app.get('port'));
});
