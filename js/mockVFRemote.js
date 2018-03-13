/*
 * Copyright (c) 2014, MobileCaddy Ltd.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of MobileCaddy Ltd nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */


/******************************************************
 *    I N T E R N  A L    F U N C T I O N S
 *****************************************************/

function queryMockJsonFile(remoteCall, success) {
	myUri = "../../mock/" + remoteCall + ".json";

	httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', myUri );
	httpRequest.send();

	httpRequest.onreadystatechange = function(){
		// Process the server response here.
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
		  if (httpRequest.status === 200) {
				console.log("Read from file " + myUri + " OK");
				success(httpRequest.responseText);
		  } else {
		  	console.error("Error reading from file" + myUri + " -> " + JSON.stringify(e));
				success([]);
		  }

		}
	}
}
function queryMockJsonTableFile(remoteCall, tableName, success) {
	var timeNow = new Date().valueOf();
	myUri = "../../mock/" + remoteCall + "/" + tableName + ".json";


	httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', myUri );
	httpRequest.send();

	httpRequest.onreadystatechange = function(){
		// Process the server response here.
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
		  if (httpRequest.status === 200) {
				console.log("Read from file " + myUri + " OK");
				var data = JSON.parse(httpRequest.responseText);
				if (data.lastRefreshDatetime) data.lastRefreshDatetime = timeNow;
				success(httpRequest.responseText);
		  } else {
		  	console.error("Error reading from file" + myUri + " -> " + JSON.stringify(e));
				success([]);
		  }

		}
	}
}


function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 18; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

/**
 * Builds a successful response for an m2pUpdate for Connection_Session_mc
 * table
 * @param {json} inJson
 */
function buildConnSessResp(inJson) {
	console.debug('inJson', JSON.stringify(inJson));
	try {
		inJson = JSON.parse(inJson);
		var inRecs = inJson.records;
		console.debug('inRecs', JSON.stringify(inRecs));
		var us = inRecs.map(function(rec) {
			console.debug('rec', JSON.stringify(rec));
			var idField = _.findWhere(rec.fields, {'name': "Id"});
			return ({"Id" : idField.value,"sm" : null,"pc" : "U"});
		});
		return JSON.stringify({
			"mt"   : "Connection_Session__mc",
			"cp"   : inJson.connSessProxyId,
			"csId" : makeid(),
			"ps"   : "M2P UP - Record Processed",
			"sdfb" : "D",
			"hdfb" : "D",
			"ufbe" : "K",
			"stbe" : "D",
			"ifbe" : "K",
			"us"   : us,
			"uf"   : []
			});
	} catch(err) {
		console.error(err);
		throw(err);
	}
}



/******************************************************
 *    G L O B A L    B I T S
 *****************************************************/

// global namespace
var Visualforce = Visualforce || {};

// sub namespace
Visualforce.remoting = {};

// sub namespace
Visualforce.remoting.Manager = {};

// Object together with the method declarations
Visualforce.remoting.Manager = {
	getAction: function() {
		var callName = arguments[0].split(".").pop();
		switch (callName) {
  		case 'p2mRefreshRecTypeDOTs' :
			return true;
		default:
			return true;
		}
	},

  invokeAction: function() {
  	// I'm assuming that the penultimate and last args are success and error callbacks.
  	var callName = arguments[0].split(".").pop();
  	var success = arguments[arguments.length -2];
  	var error = arguments[arguments.length -1];
		var resultObj = {};
  	var eventObj = {"status" : "OK"};

  	switch (callName) {
  		case 'getAudInfo' :
				queryMockJsonFile('getAudInfo', function(data) {
					success(data, eventObj);
				});
				break;
  		case 'getSystemDataSoupDefinition' :
				queryMockJsonFile('getSystemDataSoupDefinition', function(data) {
					success(data, eventObj);
				});
				break;
  		case 'getSysDataSoupVariables' :
				resultObj = '[]';
    		success(resultObj, eventObj);
				break;
  		case 'getDefsForSObjectMobileTables' :
				queryMockJsonFile('getDefsForSObjectMobileTables', function(data) {
					success(data, eventObj);
				});
				break;
  		case 'getRecordTypeDots' :
				queryMockJsonFile('getRecordTypeDots', function(data) {
					success(data, eventObj);
				});
				break;
  		case 'p2mRefreshRecTypeDOTs' :
				queryMockJsonFile('p2mRefreshRecTypeDOTs', function(data) {
					success(data, eventObj);
				});
				break;
  		case 'm2pCSStatusCheck' :
  			console.info('m2pCSStatusCheck - - - - - - - - - - - - - -');
  			console.dir(arguments);
				resultObj = '{"status" : "OK", "cs_fc_sc" : "Received Processed"}';
    		success(resultObj, eventObj);
				break;
  		case 'p2mRefreshTable' :
				console.log("mockVfRemote p2mRefreshTable -> " + arguments[3]);
				queryMockJsonTableFile('p2mRefreshTable', arguments[3], function(data) {
					success(data, eventObj);
				});
				break;
  		case 'm2pUpdateTable' :
				console.log("mockVfRemote m2pUpdateTable -> " + arguments[3]);
				if ( arguments[3] == "Connection_Session__mc" ) {
					// need to spoof response so app behaves OK
					var result = buildConnSessResp(arguments[4]);
					console.time('TODD');
					setTimeout(function(){
						console.timeEnd('TODD');
						success(result,eventObj);
						}, 500);
				} else {
					queryMockJsonTableFile('m2pUpdateTable', arguments[3], function(data) {
						success(data, eventObj);
					});
				}
				break;
			default :
				console.error("ERROR!: mockVfRemote, Unknown callName -> " + callName);
  	}
    }
};

window.Visualforce = Visualforce;