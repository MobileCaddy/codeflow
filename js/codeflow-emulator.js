// codeflow-emulator.js

/*
	Sets env up for running in codefow.
 */


window.LOCAL_DEV = true;

setScrub();
setLocalDev();
importScripts().then(function(result){
	// Cool
}).catch(function(e){
	console.error(e);
});

// maybeScrub();




// Import of JS libs that are needed
function importScripts() {
  return new Promise(function(resolve, reject) {
		let imported2 = document.createElement('script');
		imported2.src = './assets/js/mockVFRemote.js';
		document.head.appendChild(imported2);

		let imported3 = document.createElement('script');
		imported3.src = './assets/js/force.js';
		document.head.appendChild(imported3);
		resolve();
	});
}

function setScrub() {
  let params = new URL(document.location).searchParams;
  let qScrub = params.get('scrub');
  switch (qScrub) {
    case 'full':
      localStorage.clear();
      break;
    case 'true':
      let forceOAuth = localStorage.getItem('forceOAuth');
      localStorage.clear();
      localStorage.setItem('forceOAuth', forceOAuth);
      break;
    case 'false':
      break;
    default:
      // If we get here then we have not got our scrub param
      let myUri = 'mc-params.json';

      let httpRequest = new XMLHttpRequest();
      httpRequest.open('GET', myUri);
      httpRequest.send();

      httpRequest.onreadystatechange = function() {
        // Process the server response here.
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
          if (httpRequest.status === 200) {
            console.log(
              'Read from file ' + myUri + ' OK',
              httpRequest.responseText
            );
            let scrub = JSON.parse(httpRequest.responseText).scrub;
            switch (scrub) {
              case 'full':
                localStorage.clear();
                break;
              case true: {
                let forceOAuth = localStorage.getItem('forceOAuth');
                localStorage.clear();
                localStorage.setItem('forceOAuth', forceOAuth);
                break;
              }
            }
          } else {
            console.error(
              'Error reading from file' + myUri + ' -> ' + JSON.stringify(e)
            );
          }
        }
      };
  }
}


function setLocalDev() {
  // Setup whether to use Mock, or to init forcejs
  window.USE_FORCETK = true;
  console.log('window.LOCAL_DEV', window.LOCAL_DEV);

  var params = new URL(document.location).searchParams;
  var useMock = params.get('local');
  console.log('params.has', params.has('local'));
  console.log('useMock', useMock);
  if (params.has('local') && (useMock === '' || useMock == 'true')) {
    window.USE_FORCETK = false;
  }
  console.log('window.USE_FORCETK', window.USE_FORCETK);

  if (window.USE_FORCETK === true) {
    console.log('useMock', useMock);
    // check the mc-params.json
    let myUri = 'mc-params.json';

    let httpRequest = new XMLHttpRequest();
    httpRequest.open('GET', myUri);
    httpRequest.send();

    httpRequest.onreadystatechange = function() {
      // Process the server response here.
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          console.log(
            'Read from file ' + myUri + ' OK',
            httpRequest.responseText
          );
          let local = JSON.parse(httpRequest.responseText).local;
          if (local) window.USE_FORCETK = false;
        } else {
          console.error(
            'Error reading from file' + myUri + ' -> ' + JSON.stringify(e)
          );
        }
      }
    };
  }
}

