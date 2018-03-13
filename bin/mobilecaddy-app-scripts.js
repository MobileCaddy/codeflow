#!/usr/bin/env node
var fs = require('fs');

if (process.argv.length > 2) {

  switch (process.argv[2]) {
  	case 'setup':
  		copySetupFiles();
  		break;
  	case 'cors':
  		startCorsServer();
  		break;
  	default:
  		console.error('Unknown task: ' + process.argv[2]);
  }

} else {
  console.log('Missing MobileCaddy app script task name');
}

function copySetupFiles(){
	const destJsDir = 'src/assets/js';

	if (!fs.existsSync(destJsDir)){
	    fs.mkdirSync(destJsDir);
	}

	const destWWWDir = 'www';

	if (!fs.existsSync(destWWWDir)){
	    fs.mkdirSync(destWWWDir);
	}
	const sourceCodeFlowDir = 'node_modules/mobilecaddy-codeflow/js/';
	const sourceForceJSDir = 'node_modules/forcejs/';

	fs.copyFile(sourceCodeFlowDir + 'MockCordova.js', destJsDir + '/MockCordova.js', (err) => {
    if (err) throw err;
    console.log('Copying setup files...');
	});
	fs.copyFile(sourceCodeFlowDir + 'mockVFRemote.js', destJsDir + '/mockVFRemote.js', (err) => {
    if (err) throw err;
    console.log('...');
	});
	fs.copyFile(sourceCodeFlowDir + 'codeflow-emulator.js', destJsDir + '/codeflow-emulator.js', (err) => {
    if (err) throw err;
    console.log('...');
	});
	fs.copyFile(sourceForceJSDir + 'force.js', destJsDir + '/force.js', (err) => {
    if (err) throw err;
    console.log('...');
	});
	fs.copyFile('src/oauthcallback.html', destWWWDir + '/oauthcallback.html', (err) => {
    if (err) throw err;
    console.log('...');
	});
}

function startCorsServer() {
	require('../js/cors-server');
}