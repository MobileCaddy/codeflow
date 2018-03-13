// codeflow-emulator.js

/*
	Sets env up for running in codefow.
 */


window.LOCAL_DEV = true;

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


function setLocalDev(){
	// Setup whether to use Mock, or to init forcejs
	window.USE_FORCETK = true;
	console.log("window.LOCAL_DEV", window.LOCAL_DEV);

	var queryString= [];
	var hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for(var i = 0; i < hashes.length; i++)
	{
	    hash = hashes[i].split('=');
	    if (hash[0] == 'local') window.USE_FORCETK = false;
	}
}

