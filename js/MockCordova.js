/*
 * Copyright (c) 2012, salesforce.com, inc.
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
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
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

/*
 * MobileCaddy Adaption
 * Uses (more) persitent storage
 * Version: 2.3.2
 */

/**
 * Mock Cordova: mocks just enough cordova functions to allow testing of plugins outside a container
 *
 */
(function(window) {
  var require, define;

  (function() {
    var modules = {};

    function build(module) {
      var factory = module.factory;
      module.exports = {};
      delete module.factory;
      factory(require, module.exports, module);
      return module.exports;
    }

    require = function(id) {
      if (!modules[id]) {
        throw new Error('module ' + id + ' not found');
      }
      return modules[id].factory ? build(modules[id]) : modules[id].exports;
    };

    define = function(id, factory) {
      if (modules[id]) {
        throw new Error('module ' + id + ' already defined');
      }

      modules[id] = {
        id: id,
        factory: factory
      };
    };

    define.remove = function(id) {
      delete modules[id];
    };
  })();

  define('cordova', function(require, exports, module) {
    var interceptors = {};

    // Method to provide an mock implementation for an container service/action
    // func should take three arguments: successCB, errorCB, args
    var interceptExec = function(service, action, func) {
      interceptors[service + ':' + action] = func;
    };

    // Mocking cordova's exec method by calling the functions registered with interceptExec
    var exec = function(successCB, errorCB, service, action, args) {
      var version =
        args.length > 0 &&
        typeof args[0] == 'string' &&
        args[0].indexOf('pluginSDKVersion:') === 0
          ? args[0].substring('pluginSDKVersion:'.length)
          : null;
      if (version !== null) {
        args.shift();
      }
      // console.log("cordova.exec " + service + ":" + action + (version != null ? ":" + version : ""));
      var found = false;
      var req = service + ':' + action;
      for (var key in interceptors) {
        if (key === req) {
          setTimeout(function() {
            // try {
            interceptors[key](successCB, errorCB, args);
            // } catch (err) {
            //     console.error("Error caught when calling " + service + ":" + action + " " + err);
            //     console.error(err.stack);
            //     errorCB(err);
            // }
          }, 0);
          found = true;
          break;
        }
      }

      if (!found) {
        console.log('No mock for ' + service + ':' + action);
        return;
      }
    };

    module.exports = {
      exec: exec,
      define: define,
      require: require,

      // Only in mock
      interceptExec: interceptExec
    };
  });

  define('cordova/exec', function(require, exports, module) {
    var cordova = require('cordova');

    module.exports = cordova.exec;
  });

  window.cordova = require('cordova');
})(window);

/*
   * Copyright (c) 2012-14, salesforce.com, inc.
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
   * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
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

// Version this js was shipped with
var SALESFORCE_MOBILE_SDK_VERSION = '2.2.0';

/**
 * Utilify functions for logging
 */
cordova.define('salesforce/util/logger', function(require, exports, module) {
  var appStartTime = new Date().getTime(); // Used for debug timing measurements.

  /**
   * Logs text to a given section of the page.
   *   section - id of HTML section to log to.
   *   txt - The text (html) to log.
   */
  var log = function(section, txt) {
    console.log('jslog: ' + txt);
    if (typeof debugMode !== 'undefined' && debugMode === true) {
      var sectionElt = document.getElementById(section);
      if (sectionElt) {
        sectionElt.style.display = 'block';
        document.getElementById(section).innerHTML +=
          '<p><i><b>* At ' +
          (new Date().getTime() - appStartTime) +
          'ms:</b></i> ' +
          txt +
          '</p>';
      }
    }
  };

  /**
   * Logs debug messages to a "debug console" section of the page.  Only
   * shows when debugMode (above) is set to true.
   *   txt - The text (html) to log to the console.
   */
  var logToConsole = function(txt) {
    log('console', txt);
  };

  /**
   * Use to log error messages to an "error console" section of the page.
   *   txt - The text (html) to log to the console.
   */
  var logError = function(txt) {
    log('errors', txt);
  };

  /**
   * Sanitizes a URL for logging, based on an array of querystring parameters whose
   * values should be sanitized.  The value of each querystring parameter, if found
   * in the URL, will be changed to '[redacted]'.  Useful for getting rid of secure
   * data on the querystring, so it doesn't get persisted in an app log for instance.
   *
   * origUrl            - Required - The URL to sanitize.
   * sanitizeParamArray - Required - An array of querystring parameters whose values
   *                                 should be sanitized.
   * Returns: The sanitzed URL.
   */
  var sanitizeUrlParamsForLogging = function(origUrl, sanitizeParamArray) {
    var trimmedOrigUrl = origUrl.trim();
    if (trimmedOrigUrl === '') return trimmedOrigUrl;

    if (
      typeof sanitizeParamArray !== 'object' ||
      sanitizeParamArray.length === 0
    )
      return trimmedOrigUrl;

    var redactedUrl = trimmedOrigUrl;
    for (var i = 0; i < sanitizeParamArray.length; i++) {
      var paramRedactRegexString =
        '^(.*[\\?&]' + sanitizeParamArray[i] + '=)([^&]+)(.*)$';
      var paramRedactRegex = new RegExp(paramRedactRegexString, 'i');
      if (paramRedactRegex.test(redactedUrl))
        redactedUrl = redactedUrl.replace(paramRedactRegex, '$1[redacted]$3');
    }

    return redactedUrl;
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    logToConsole: logToConsole,
    logError: logError,
    sanitizeUrlParamsForLogging: sanitizeUrlParamsForLogging
  };
});

cordova.define('salesforce/util/event', function(require, exports, module) {
  var logger = require('salesforce/util/logger');

  /**
   * Enumeration of event types.
   */
  var EventType = {
    AUTHENTICATING: {
      code: 0,
      description: 'Authenticating...',
      isError: false
    },
    STARTING: { code: 1, description: 'Loading application', isError: false },
    OFFLINE: {
      code: 2,
      description: "Your device is offline. Can't continue.",
      isError: true
    }
  };

  /**
   * Dispatches event with current status text and success indicator.
   */
  var sendStatusEvent = function(statusEvent) {
    if (statusEvent.isError) {
      logger.logError(statusEvent.description);
    } else {
      logger.logToConsole(statusEvent.description);
    }
    cordova.fireDocumentEvent('bootstrapStatusEvent', statusEvent);
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    EventType: EventType,
    sendStatusEvent: sendStatusEvent
  };
});

/**
 * Utility functions used at startup
 */
cordova.define('salesforce/util/bootstrap', function(require, exports, module) {
  var logger = require('salesforce/util/logger');

  /**
   * Determine whether the device is online.
   */
  var deviceIsOnline = function() {
    var connType;
    if (navigator && navigator.connection) {
      connType = navigator.connection.type;
      logger.logToConsole('deviceIsOnline connType: ' + connType);
    } else {
      logger.logToConsole('deviceIsOnline connType is undefined.');
    }

    if (typeof connType !== 'undefined') {
      // Cordova's connection object.  May be more accurate?
      return (
        connType &&
        connType != Connection.NONE &&
        connType != Connection.UNKNOWN
      );
    } else {
      // Default to browser facility.
      return navigator.onLine;
    }
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    deviceIsOnline: deviceIsOnline
  };
});

/**
 * Helper function used to call the native side
 */
cordova.define('salesforce/util/exec', function(require, exports, module) {
  var exec = function(
    pluginVersion,
    successCB,
    errorCB,
    service,
    action,
    args
  ) {
    var defaultSuccessCB = function() {
      console.log(service + ':' + action + ' succeeded');
    };
    var defaultErrorCB = function() {
      // console.error(service + ":" + action + " failed");
    };
    successCB = typeof successCB !== 'function' ? defaultSuccessCB : successCB;
    errorCB = typeof errorCB !== 'function' ? defaultErrorCB : errorCB;
    args.unshift('pluginSDKVersion:' + pluginVersion);
    var cordovaExec = require('cordova/exec');
    return cordovaExec(successCB, errorCB, service, action, args);
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    exec: exec
  };
});

cordova.define('salesforce/plugin/sdkinfo', function(require, exports, module) {
  var SERVICE = 'com.salesforce.sdkinfo';

  var exec = require('salesforce/util/exec').exec;

  /**
   * SDKInfo data structure
   */
  var SDKInfo = function(
    sdkVersion,
    forcePluginsAvailable,
    appName,
    appVersion
  ) {
    this.sdkVersion = sdkVersion;
    this.forcePluginsAvailable = forcePluginsAvailable;
    this.appName = appName;
    this.appVersion = appVersion;
  };

  /**
   * Returns a populated SDKInfo object (via a callback)
   */
  var getInfo = function(successCB, errorCB) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'getInfo',
      []
    );
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    getInfo: getInfo,

    // Constructor
    SDKInfo: SDKInfo
  };
});

// For backward compatibility
var SFHybridApp = {
  logToConsole: cordova.require('salesforce/util/logger').logToConsole,
  logError: cordova.require('salesforce/util/logger').logError
};

cordova.define('salesforce/plugin/oauth', function(require, exports, module) {
  var SERVICE = 'com.salesforce.oauth';

  var exec = require('salesforce/util/exec').exec;

  /**
   * Whether or not logout has already been initiated.  Can only be initiated once
   * per page load.
   */
  var logoutInitiated = false;

  /**
   * Obtain authentication credentials, calling 'authenticate' only if necessary.
   * Most index.html authors can simply use this method to obtain auth credentials
   * after onDeviceReady.
   *   success - The success callback function to use.
   *   fail    - The failure/error callback function to use.
   * cordova returns a dictionary with:
   *     accessToken
   *     refreshToken
   *  clientId
   *     userId
   *     orgId
   *  loginUrl
   *     instanceUrl
   *     userAgent
   */
  var getAuthCredentials = function(success, fail) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      success,
      fail,
      SERVICE,
      'getAuthCredentials',
      []
    );
  };

  /**
   * Initiates the authentication process, with the given app configuration.
   *   success         - The success callback function to use.
   *   fail            - The failure/error callback function to use.
   * cordova returns a dictionary with:
   *   accessToken
   *   refreshToken
   *   clientId
   *   userId
   *   orgId
   *   loginUrl
   *   instanceUrl
   *   userAgent
   */
  var authenticate = function(success, fail) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      success,
      fail,
      SERVICE,
      'authenticate',
      []
    );
  };

  /**
   * Logout the current authenticated user. This removes any current valid session token
   * as well as any OAuth refresh token.  The user is forced to login again.
   * This method does not call back with a success or failure callback, as
   * (1) this method must not fail and (2) in the success case, the current user
   * will be logged out and asked to re-authenticate.  Note also that this method can only
   * be called once per page load.  Initiating logout will ultimately redirect away from
   * the given page (effectively resetting the logout flag), and calling this method again
   * while it's currently processing will result in app state issues.
   */
  var logout = function() {
    if (!logoutInitiated) {
      logoutInitiated = true;
      exec(
        SALESFORCE_MOBILE_SDK_VERSION,
        null,
        null,
        SERVICE,
        'logoutCurrentUser',
        []
      );
    }
  };
  /**
   * Gets the app's homepage as an absolute URL.  Used for attempting to load any cached
   * content that the developer may have built into the app (via HTML5 caching).
   *
   * This method will either return the URL as a string, or an empty string if the URL has not been
   * initialized.
   */
  var getAppHomeUrl = function(success) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      success,
      null,
      SERVICE,
      'getAppHomeUrl',
      []
    );
  };

  /**
   * Goes through the refresh flow, and sets the new session token in the supplied forcetkClient.
   */
  var forcetkRefresh = function(forcetkClient, success, fail) {
    authenticate(function(oauthResponse) {
      var oauthResponseData = oauthResponse;
      if (oauthResponse.data) {
        oauthResponseData = oauthResponse.data;
      }
      forcetkClient.setSessionToken(
        oauthResponseData.accessToken,
        null,
        oauthResponseData.instanceUrl
      );
      success();
    }, fail);
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    getAuthCredentials: getAuthCredentials,
    authenticate: authenticate,
    logout: logout,
    getAppHomeUrl: getAppHomeUrl,
    forcetkRefresh: forcetkRefresh
  };

  cordova.interceptExec(SERVICE, 'authenticate', function(successCB, errorCB) {
    var authResp = {};
    authResp.userId = '00000000dUmMyID000';
    successCB(authResp);
  });
});

// For backward compatibility
var SalesforceOAuthPlugin = cordova.require('salesforce/plugin/oauth');

cordova.define('salesforce/plugin/sfaccountmanager', function(
  require,
  exports,
  module
) {
  var SERVICE = 'com.salesforce.sfaccountmanager';

  var exec = require('salesforce/util/exec').exec;

  /**
   * UserAccount data object, for account data operations.
   */
  var UserAccount = function(
    authToken,
    refreshToken,
    loginServer,
    idUrl,
    instanceServer,
    orgId,
    userId,
    username,
    clientId
  ) {
    this.authToken = authToken;
    this.refreshToken = refreshToken;
    this.loginServer = loginServer;
    this.idUrl = idUrl;
    this.instanceServer = instanceServer;
    this.orgId = orgId;
    this.userId = userId;
    this.username = username;
    this.clientId = clientId;
  };

  /**
   * Whether or not logout has already been initiated.
   * Can only be initiated once per page load.
   */
  var logoutInitiated = false;

  /**
   * Obtains the list of user accounts already logged in.
   *   success - The success callback function to use.
   *   fail    - The failure/error callback function to use.
   * cordova returns an array, each entry contains a dictionary with:
   *     authToken
   *     refreshToken
   *     loginServer
   *     idUrl
   *     instanceServer
   *     orgId
   *     userId
   *     username
   *     clientId
   */
  var getUsers = function(success, fail) {
    exec(SALESFORCE_MOBILE_SDK_VERSION, success, fail, SERVICE, 'getUsers', []);
  };

  /**
   * Obtains the current user account.
   *   success         - The success callback function to use.
   *   fail            - The failure/error callback function to use.
   * cordova returns a dictionary with:
   *     authToken
   *     refreshToken
   *     loginServer
   *     idUrl
   *     instanceServer
   *     orgId
   *     userId
   *     username
   *     clientId
   */
  var getCurrentUser = function(success, fail) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      success,
      fail,
      SERVICE,
      'getCurrentUser',
      []
    );
  };

  /**
   * Logs out the specified user, or the current user if not specified.
   * This removes any current valid session token as well as any OAuth
   * refresh token.  The user is forced to login again.
   * This method does not call back with a success or failure callback, as
   * (1) this method must not fail and (2) in the success case, the current user
   * will be logged out and asked to re-authenticate. Note also that this method can only
   * be called once per page load. Initiating logout will ultimately redirect away from
   * the given page (effectively resetting the logout flag), and calling this method again
   * while it's currently processing will result in app state issues.
   */
  var logout = function(user) {
    if (!logoutInitiated) {
      logoutInitiated = true;
      exec(SALESFORCE_MOBILE_SDK_VERSION, null, null, SERVICE, 'logout', [
        user
      ]);
    }
  };

  /**
   * Switches to the user specified, or new user, if not specified.
   * This method does not call back with a success or failure callback, as
   * (1) this method must not fail and (2) in the success case, the context
   * will be switched to another user, or a new user.
   */
  var switchToUser = function(user) {
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      null,
      null,
      SERVICE,
      'switchToUser',
      user ? [user] : []
    );
  };

  /**
   * Part of the module that is public.
   */
  module.exports = {
    UserAccount: UserAccount,
    getUsers: getUsers,
    getCurrentUser: getCurrentUser,
    logout: logout,
    switchToUser: switchToUser
  };
});

// For backward compatibility.
var SFAccountManagerPlugin = cordova.require(
  'salesforce/plugin/sfaccountmanager'
);

cordova.define('com.salesforce.plugin.smartstore', function(
  require,
  exports,
  module
) {
  var SERVICE = 'com.salesforce.smartstore';

  var exec = require('salesforce/util/exec').exec;

  /**
   * SoupIndexSpec consturctor
   */
  var SoupIndexSpec = function(path, type) {
    this.path = path;
    this.type = type;
  };

  /**
   * QuerySpec constructor
   */
  var QuerySpec = function(path) {
    // the kind of query, one of: "exact","range", "like" or "smart":
    // "exact" uses matchKey, "range" uses beginKey and endKey, "like" uses likeKey, "smart" uses smartSql
    this.queryType = 'exact';

    //path for the original IndexSpec you wish to use for search: may be a compound path eg Account.Owner.Name
    this.indexPath = path;

    //for queryType "exact"
    this.matchKey = null;

    //for queryType "like"
    this.likeKey = null;

    //for queryType "range"
    //the value at which query results may begin
    this.beginKey = null;
    //the value at which query results may end
    this.endKey = null;

    // for queryType "smart"
    this.smartSql = null;

    //"ascending" or "descending" : optional
    this.order = 'ascending';

    //the number of entries to copy from native to javascript per each cursor page
    this.pageSize = 10000;
  };

  /**
   * StoreCursor constructor
   */
  var StoreCursor = function() {
    //a unique identifier for this cursor, used by plugin
    this.cursorId = null;
    //the maximum number of entries returned per page
    this.pageSize = 0;
    //the total number of pages of results available
    this.totalPages = 0;
    //the current page index among all the pages available
    this.currentPageIndex = 0;
    //the list of current page entries, ordered as requested in the querySpec
    this.currentPageOrderedEntries = null;
  };

  // ====== Logging support ======
  var logLevel = 0;
  var setLogLevel = function(l) {
    logLevel = l;
  };

  var getLogLevel = function() {
    return logLevel;
  };

  // ====== alterSoup =======
  var alterSoup = function(table, spec, _, successCallback) {
    console.log("let's pretend I've altered the soup", table, spec);
    successCallback();
  };

  // ====== querySpec factory methods
  // Returns a query spec that will page through all soup entries in order by the given path value
  // Internally it simply does a range query with null begin and end keys
  var buildAllQuerySpec = function(path, order, pageSize) {
    var inst = new QuerySpec(path);
    inst.queryType = 'range';
    if (order) {
      inst.order = order;
    } // override default only if a value was specified
    // if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
  };

  // Returns a query spec that will page all entries exactly matching the matchKey value for path
  var buildExactQuerySpec = function(path, matchKey, pageSize) {
    var inst = new QuerySpec(path);
    inst.matchKey = matchKey;
    //if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
  };

  // Returns a query spec that will page all entries in the range beginKey ...endKey for path
  var buildRangeQuerySpec = function(path, beginKey, endKey, order, pageSize) {
    var inst = new QuerySpec(path);
    inst.queryType = 'range';
    inst.beginKey = beginKey;
    inst.endKey = endKey;
    if (order) {
      inst.order = order;
    } // override default only if a value was specified
    // if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
  };

  // Returns a query spec that will page all entries matching the given likeKey value for path
  var buildLikeQuerySpec = function(path, likeKey, order, pageSize) {
    var inst = new QuerySpec(path);
    inst.queryType = 'like';
    inst.likeKey = likeKey;
    if (order) {
      inst.order = order;
    } // override default only if a value was specified
    // if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
  };

  // Returns a query spec that will page all results returned by smartSql
  var buildSmartQuerySpec = function(smartSql, pageSize) {
    var inst = new QuerySpec();
    inst.queryType = 'smart';
    inst.smartSql = smartSql;
    // if (pageSize) { inst.pageSize = pageSize; } // override default only if a value was specified
    return inst;
  };

  // ====== Soup manipulation ======
  var registerSoup = function(soupName, indexSpecs, successCB, errorCB) {
    if (logLevel > 0)
      console.log(
        "SmartStore.registerSoup: '" +
          soupName +
          "' indexSpecs: " +
          JSON.stringify(indexSpecs)
      );
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgRegisterSoup',
      [{ soupName: soupName, indexes: indexSpecs }]
    );
  };

  var removeSoup = function(soupName, successCB, errorCB) {
    if (logLevel > 0) console.log('SmartStore.removeSoup: ' + soupName);
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgRemoveSoup',
      [{ soupName: soupName }]
    );
  };

  var soupExists = function(soupName, successCB, errorCB) {
    if (logLevel > 0) console.log('SmartStore.soupExists: ' + soupName);
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgSoupExists',
      [{ soupName: soupName }]
    );
  };

  var querySoup = function(soupName, querySpec, successCB, errorCB) {
    if (querySpec.queryType == 'smart')
      throw new Error('Smart queries can only be run using runSmartQuery');
    if (logLevel > 0)
      console.log(
        "SmartStore.querySoup: '" +
          soupName +
          "' indexPath: " +
          querySpec.indexPath
      );
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgQuerySoup',
      [{ soupName: soupName, querySpec: querySpec }]
    );
  };

  var runSmartQuery = function(querySpec, successCB, errorCB) {
    if (querySpec.queryType != 'smart')
      throw new Error('runSmartQuery can only run smart queries');
    if (logLevel > 0)
      console.log('SmartStore.runSmartQuery: smartSql: ' + querySpec.smartSql);
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgRunSmartQuery',
      [{ querySpec: querySpec }]
    );
  };

  var retrieveSoupEntries = function(soupName, entryIds, successCB, errorCB) {
    if (logLevel > 0) {
      console.log(
        "SmartStore.retrieveSoupEntry: '" + soupName + "' entryIds: " + entryIds
      );
    }
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgRetrieveSoupEntries',
      [{ soupName: soupName, entryIds: entryIds }]
    );
  };

  var upsertSoupEntries = function(soupName, entries, successCB, errorCB) {
    upsertSoupEntriesWithExternalId(
      soupName,
      entries,
      '_soupEntryId',
      successCB,
      errorCB
    );
  };

  var upsertSoupEntriesWithExternalId = function(
    soupName,
    entries,
    externalIdPath,
    successCB,
    errorCB
  ) {
    if (logLevel > 0) {
      console.log(
        "SmartStore.upsertSoupEntries: '" +
          soupName +
          "' entries.length: " +
          entries.length
      );
    }
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgUpsertSoupEntries',
      [{ soupName: soupName, entries: entries, externalIdPath: externalIdPath }]
    );
  };

  var removeFromSoup = function(soupName, entryIds, successCB, errorCB) {
    if (logLevel > 0)
      console.log(
        "SmartStore.removeFromSoup: '" + soupName + "' entryIds: " + entryIds
      );
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgRemoveFromSoup',
      [{ soupName: soupName, entryIds: entryIds }]
    );
  };

  //====== Cursor manipulation ======
  var moveCursorToPageIndex = function(
    cursor,
    newPageIndex,
    successCB,
    errorCB
  ) {
    //console.log("moveCursorToPageIndex: " + cursor.cursorId + "  newPageIndex: " + newPageIndex);
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgMoveCursorToPageIndex',
      [{ cursorId: cursor.cursorId, index: newPageIndex }]
    );
  };

  var moveCursorToNextPage = function(cursor, successCB, errorCB) {
    var newPageIndex = cursor.currentPageIndex + 1;
    if (newPageIndex >= cursor.totalPages) {
      errorCB(
        cursor,
        new Error('moveCursorToNextPage called while on last page')
      );
    } else {
      moveCursorToPageIndex(cursor, newPageIndex, successCB, errorCB);
    }
  };

  var moveCursorToPreviousPage = function(cursor, successCB, errorCB) {
    var newPageIndex = cursor.currentPageIndex - 1;
    if (newPageIndex < 0) {
      errorCB(
        cursor,
        new Error('moveCursorToPreviousPage called while on first page')
      );
    } else {
      moveCursorToPageIndex(cursor, newPageIndex, successCB, errorCB);
    }
  };

  var closeCursor = function(cursor, successCB, errorCB) {
    //console.log("closeCursor: " + cursor.cursorId);
    exec(
      SALESFORCE_MOBILE_SDK_VERSION,
      successCB,
      errorCB,
      SERVICE,
      'pgCloseCursor',
      [{ cursorId: cursor.cursorId }]
    );
  };

  /**
   * Part of the module that is public
   */
  module.exports = {
    alterSoup: alterSoup,
    getLogLevel: getLogLevel,
    setLogLevel: setLogLevel,
    buildAllQuerySpec: buildAllQuerySpec,
    buildExactQuerySpec: buildExactQuerySpec,
    buildRangeQuerySpec: buildRangeQuerySpec,
    buildLikeQuerySpec: buildLikeQuerySpec,
    buildSmartQuerySpec: buildSmartQuerySpec,
    registerSoup: registerSoup,
    removeSoup: removeSoup,
    soupExists: soupExists,
    querySoup: querySoup,
    runSmartQuery: runSmartQuery,
    retrieveSoupEntries: retrieveSoupEntries,
    upsertSoupEntries: upsertSoupEntries,
    upsertSoupEntriesWithExternalId: upsertSoupEntriesWithExternalId,
    removeFromSoup: removeFromSoup,
    moveCursorToPageIndex: moveCursorToPageIndex,
    moveCursorToNextPage: moveCursorToNextPage,
    moveCursorToPreviousPage: moveCursorToPreviousPage,
    closeCursor: closeCursor,

    // Constructors
    QuerySpec: QuerySpec,
    SoupIndexSpec: SoupIndexSpec,
    StoreCursor: StoreCursor
  };
});

// file: lib/common/plugin/Camera.js
cordova.define('cordova/plugin/Camera', function(require, exports, module) {
  var exec = require('cordova/exec'),
    Camera = require('cordova/plugin/CameraConstants');

  var cameraExport = {};

  // Tack on the Camera Constants to the base camera plugin.
  for (var key in Camera) {
    cameraExport[key] = Camera[key];
  }

  /**
   * Gets a picture from source defined by "options.sourceType", and returns the
   * image as defined by the "options.destinationType" option.
  
   * The defaults are sourceType=CAMERA and destinationType=FILE_URI.
   *
   * @param {Function} successCallback
   * @param {Function} errorCallback
   * @param {Object} options
   */
  cameraExport.getPicture = function(successCallback, errorCallback, options) {
    options = options || {};
    // successCallback required
    if (typeof successCallback != 'function') {
      console.log('Camera Error: successCallback is not a function');
      return;
    }

    // errorCallback optional
    if (errorCallback && typeof errorCallback != 'function') {
      console.log('Camera Error: errorCallback is not a function');
      return;
    }

    var quality = 50;
    if (typeof options.quality == 'number') {
      quality = options.quality;
    } else if (typeof options.quality == 'string') {
      var qlity = parseInt(options.quality, 10);
      if (isNaN(qlity) === false) {
        quality = qlity.valueOf();
      }
    }

    var destinationType = Camera.DestinationType.FILE_URI;
    if (typeof options.destinationType == 'number') {
      destinationType = options.destinationType;
    }

    var sourceType = Camera.PictureSourceType.CAMERA;
    if (typeof options.sourceType == 'number') {
      sourceType = options.sourceType;
    }

    var targetWidth = -1;
    if (typeof options.targetWidth == 'number') {
      targetWidth = options.targetWidth;
    } else if (typeof options.targetWidth == 'string') {
      var width = parseInt(options.targetWidth, 10);
      if (isNaN(width) === false) {
        targetWidth = width.valueOf();
      }
    }

    var targetHeight = -1;
    if (typeof options.targetHeight == 'number') {
      targetHeight = options.targetHeight;
    } else if (typeof options.targetHeight == 'string') {
      var height = parseInt(options.targetHeight, 10);
      if (isNaN(height) === false) {
        targetHeight = height.valueOf();
      }
    }

    var encodingType = Camera.EncodingType.JPEG;
    if (typeof options.encodingType == 'number') {
      encodingType = options.encodingType;
    }

    var mediaType = Camera.MediaType.PICTURE;
    if (typeof options.mediaType == 'number') {
      mediaType = options.mediaType;
    }
    var allowEdit = false;
    if (typeof options.allowEdit == 'boolean') {
      allowEdit = options.allowEdit;
    } else if (typeof options.allowEdit == 'number') {
      allowEdit = options.allowEdit <= 0 ? false : true;
    }
    var correctOrientation = false;
    if (typeof options.correctOrientation == 'boolean') {
      correctOrientation = options.correctOrientation;
    } else if (typeof options.correctOrientation == 'number') {
      correctOrientation = options.correctOrientation <= 0 ? false : true;
    }
    var saveToPhotoAlbum = false;
    if (typeof options.saveToPhotoAlbum == 'boolean') {
      saveToPhotoAlbum = options.saveToPhotoAlbum;
    } else if (typeof options.saveToPhotoAlbum == 'number') {
      saveToPhotoAlbum = options.saveToPhotoAlbum <= 0 ? false : true;
    }
    var popoverOptions = null;
    if (typeof options.popoverOptions == 'object') {
      popoverOptions = options.popoverOptions;
    }

    var args = [
      quality,
      destinationType,
      sourceType,
      targetWidth,
      targetHeight,
      encodingType,
      mediaType,
      allowEdit,
      correctOrientation,
      saveToPhotoAlbum,
      popoverOptions
    ];

    exec(successCallback, errorCallback, 'Camera', 'takePicture', args);
  };

  cameraExport.cleanup = function(successCallback, errorCallback) {
    exec(successCallback, errorCallback, 'Camera', 'cleanup', []);
  };

  var mcLogoBase64 =
    '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';

  /**
   * Convert an image
   * to a base64 string
   * @param  {String}   url
   * @param  {Function} callback
   * @param  {String}   [outputFormat=image/png]
   */
  function convertImgToBase64(url, callback, outputFormat) {
    var canvas = document.createElement('CANVAS'),
      ctx = canvas.getContext('2d'),
      img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var dataURL;
      canvas.height = img.height;
      canvas.width = img.width;
      ctx.drawImage(img, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
      callback.call(this, dataURL.replace('data:image/png;base64,', ''));
      canvas = null;
    };
    img.onerror = function() {
      // Fallback, use MobileCaddy Logo
      callback.call(this, mcLogoBase64);
    };
    img.src = url;
  }

  // register interceptExec for Camera
  var CAMERA_SERVICE = 'Camera';
  cordova.interceptExec(CAMERA_SERVICE, 'takePicture', function(
    successCB,
    errorCB,
    args
  ) {
    convertImgToBase64('http://lorempixel.com/100/100/cats/', function(
      base64Img
    ) {
      successCB(base64Img);
    });
  });

  module.exports = cameraExport;
});

// file: lib/common/plugin/CameraConstants.js
cordova.define('cordova/plugin/CameraConstants', function(
  require,
  exports,
  module
) {
  module.exports = {
    DestinationType: {
      DATA_URL: 0, // Return base64 encoded string
      FILE_URI: 1 // Return file uri (content://media/external/images/media/2 for Android)
    },
    EncodingType: {
      JPEG: 0, // Return JPEG encoded image
      PNG: 1 // Return PNG encoded image
    },
    MediaType: {
      PICTURE: 0, // allow selection of still pictures only. DEFAULT. Will return format specified via DestinationType
      VIDEO: 1, // allow selection of video only, ONLY RETURNS URL
      ALLMEDIA: 2 // allow selection from all media types
    },
    PictureSourceType: {
      PHOTOLIBRARY: 0, // Choose image from picture library (same as SAVEDPHOTOALBUM for Android)
      CAMERA: 1, // Take picture from camera
      SAVEDPHOTOALBUM: 2 // Choose image from picture library (same as PHOTOLIBRARY for Android)
    },
    PopoverArrowDirection: {
      ARROW_UP: 1, // matches iOS UIPopoverArrowDirection constants to specify arrow location on popover
      ARROW_DOWN: 2,
      ARROW_LEFT: 4,
      ARROW_RIGHT: 8,
      ARROW_ANY: 15
    }
  };
});

// For backward compatibility
navigator.smartstore = cordova.require('com.salesforce.plugin.smartstore');
navigator.camera = cordova.require('cordova/plugin/Camera');
var SoupIndexSpec = navigator.smartstore.SoupIndexSpec;
var QuerySpec = navigator.smartstore.QuerySpec;
var StoreCursor = navigator.smartstore.StoreCursor;

/*
   * Copyright (c) 2012, salesforce.com, inc.
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
   * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
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

/**
 * MockSmartStore: a JavaScript SmartStore
 * Meant for development and testing only, the data is stored in SessionStorage, queries do full scans.
 *
 * Note: we are using the module pattern (see http://briancray.com/posts/javascript-module-pattern/)
 */

var MockSmartStore = (function(window) {
  // Private
  var _soups = {};
  var _soupIndexSpecs = {};
  var _cursors = {};
  var _nextSoupEltIds = {};
  var _nextCursorId = 1;

  // Constructor
  var module = function() {};

  // Prototype
  module.prototype = {
    constructor: module,

    reset: function() {
      _soups = {};
      _soupIndexSpecs = {};
      _cursors = {};
      _nextSoupEltIds = {};
      _nextCursorId = 1;
    },

    useSessionStorage: function() {
      if (window.sessionStorage) {
        // Restore smartstore from storage
        var STORAGE_KEY_MOCKSTORE = 'mockStore';
        var json = window.sessionStorage.getItem(STORAGE_KEY_MOCKSTORE);
        if (json) {
          console.log('Getting store from session storage');
          mockStore.fromJSON(json);
        }
        // Save smartstore to storage when onBeforeUnload fires
        window.onbeforeunload = function() {
          if (window.sessionStorage) {
            console.log('Saving store to session storage');
            var json = mockStore.toJSON();
            window.sessionStorage.setItem(STORAGE_KEY_MOCKSTORE, json);
          }
        };
      }
    },

    toJSON: function() {
      return JSON.stringify({
        soups: _soups,
        soupIndexSpecs: _soupIndexSpecs,
        cursors: _cursors,
        nextSoupEltIds: _nextSoupEltIds,
        nextCursorId: _nextCursorId
      });
    },

    fromJSON: function(json) {
      var obj = JSON.parse(json);
      _soups = obj.soups;
      _soupIndexSpecs = obj.soupIndexSpecs;
      _cursors = obj.cursors;
      _nextSoupEltIds = obj.nextSoupEltIds;
      _nextCursorId = obj.nextCursorId;
    },

    checkSoup: function(soupName) {
      if (!this.soupExists(soupName)) {
        console.trace('');
        throw new Error('Soup: ' + soupName + ' does not exist');
      }
    },

    checkIndex: function(soupName, path) {
      if (
        ['_soup', '_soupEntryId'].indexOf(path) == -1 &&
        !this.indexExists(soupName, path)
      )
        throw new Error(soupName + ' does not have an index on ' + path);
    },

    soupExists: function(soupName) {
      if (navigator.appVersion.includes('Electron')) {
        // In electron
        return ipcRenderer.sendSync('smartstore', {
          method: 'soupExists',
          args: { table: soupName }
        });
      } else {
        // return _soups[soupName] !== undefined;
        if (localStorage[soupName]) {
          //console.info("soupExists true -> " + soupName);
          return true;
        } else {
          //console.info("soupExists false -> "+  soupName);
          return false;
        }
      }
    },

    indexExists: function(soupName, indexPath) {
      //console.info('indexExists, soupName -> ' + soupName + ', indexPath -> ' + indexPath);
      // var indexSpecs = _soupIndexSpecs[soupName];
      // if (indexSpecs != null) {
      //     for (var i=0; i<indexSpecs.length; i++) {
      //         var indexSpec = indexSpecs[i];
      //         if (indexSpec.path == indexPath) {
      //             return true;
      //         }
      //     }
      // }
      // return false;
      var soupIndexSpecs = JSON.parse(localStorage.soupIndexSpecs);
      var indexSpecs = _.findWhere(soupIndexSpecs, { soup: soupName });
      if (indexSpecs !== undefined) {
        return true;
      } else {
        return false;
      }
    },

    registerSoup: function(soupName, indexSpecs) {
      if (!this.soupExists(soupName)) {
        if (navigator.appVersion.includes('Electron')) {
          // In electron
          return ipcRenderer.sendSync('smartstore', {
            method: 'registerSoup',
            args: { table: soupName, indexSpecs: indexSpecs }
          });
        } else {
          localStorage[soupName] = JSON.stringify([]);
          if (!this.soupExists('soupIndexSpecs')) {
            localStorage.soupIndexSpecs = JSON.stringify([]);
          }
          var soupIndexSpecs = JSON.parse(localStorage.soupIndexSpecs);
          soupIndexSpecs.push({ soup: soupName, indexSpecs: indexSpecs });
          localStorage.soupIndexSpecs = JSON.stringify(soupIndexSpecs);
        }
      }
      return soupName;
    },

    removeSoup: function(soupName) {
      if (navigator.appVersion.includes('Electron')) {
        // In electron
        return ipcRenderer.sendSync('smartstore', {
          method: 'removeSoup',
          args: { table: soupName }
        });
      } else {
        localStorage.removeItem(soupName);
        if (this.soupExists('soupIndexSpecs')) {
          var soupIndexSpecs = JSON.parse(localStorage.soupIndexSpecs);
          soupIndexSpecs = _.reject(soupIndexSpecs, function(el) {
            return el.soup == soupName;
          });
          localStorage.soupIndexSpecs = JSON.stringify(soupIndexSpecs);
        }
        // delete _soups[soupName];
        // delete _soupIndexSpecs[soupName];
        // delete _nextSoupEltIds[soupName];
      }
    },

    upsertSoupEntries: function(soupName, entries, externalIdPath) {
      // console.info('upsertSoupEntries, soupName -> ' + soupName + ', externalIdPath -> ' + externalIdPath);
      // console.info('upsertSoupEntries, soupName -> ' + soupName + ', entries -> ' + JSON.stringify(entries) + ', externalIdPath -> ' + externalIdPath);

      if (navigator.appVersion.includes('Electron')) {
        // In electron
        var result = ipcRenderer.sendSync('smartstore', {
          method: 'upsertSoupEntries',
          args: {
            table: soupName,
            entries: entries,
            externalIdPath: externalIdPath
          }
        });
        return result;
      } else {
        this.checkSoup(soupName);
        if (
          externalIdPath != '_soupEntryId' &&
          !this.indexExists(soupName, externalIdPath)
        )
          throw new Error(
            soupName + ' does not have an index on ' + externalIdPath
          );

        //var soup = _soups[soupName];
        var soup = JSON.parse(localStorage[soupName]);
        // console.info('upsertSoupEntries, presoup -> ' + JSON.stringify(soup));
        var upsertedEntries = [];
        for (var i = 0; i < entries.length; i++) {
          var entry = JSON.parse(JSON.stringify(entries[i])); // clone
          var isNew = true;
          var timeNow = new Date().valueOf();

          var searchObj = {};
          var entryExists = false;
          if (!('_soupEntryId' in entry)) {
            searchObj[externalIdPath] = entry[externalIdPath];
            entryExists = _.findWhere(soup, searchObj);
            // console.debug('entryExists -> '+ JSON.stringify(entryExists));
            if (
              typeof entry.Id != 'undefined' &&
              typeof entryExists != 'undefined'
            ) {
              // UPDATE
              // Id matches existing, if so update rather than add
              //console.debug('upsertSoupEntries,  matches existing, if so replace rather than add');
              soup = _.map(soup, function(el) {
                if (el[externalIdPath] == entry[externalIdPath]) {
                  // MSD-379 - Real SmartStore drops fields that are not in the update
                  // for (var attrname in entry) { el[attrname] = entry[attrname]; }
                  // el._soupLastModifiedDate = timeNow;
                  // return el;
                  entry._soupLastModifiedDate = timeNow;
                  entry._soupEntryId = entryExists._soupEntryId;
                  return entry;
                } else {
                  return el;
                }
              });
            } else {
              // CREATE
              var curMaxId = _.max(soup, function(el) {
                return el._soupEntryId;
              });
              if (curMaxId == -Infinity) {
                curMaxId = 0;
              } else {
                curMaxId = curMaxId._soupEntryId;
              }
              var newId = curMaxId + 1;
              entry._soupEntryId = newId;
              var myEntry = {};
              myEntry[newId] = entry;
              soup.push(entry);
            }
          } else {
            // UPDATE
            searchObj[externalIdPath] = entry[externalIdPath];
            entryExists = _.findWhere(soup, searchObj);
            //console.debug('entryExists -> '+ JSON.stringify(entryExists));
            // what happens if I just remove this check?
            //if ( typeof(entry.Id) != "undefined"  && typeof(entryExists) != "undefined")  {
            // MSD-371 - This looks buggy
            if (true) {
              // Id matches existing, if so replace rather than add
              //console.debug('upsertSoupEntries,  matches existing, if so replace rather than add');
              soup = _.map(soup, function(el) {
                if (el[externalIdPath] == entry[externalIdPath]) {
                  return entry;
                } else {
                  return el;
                }
              });
            }
          }

          //console.info('upsertSoupEntries, entry -> ' + JSON.stringify(entry));
          // update/insert into soup
          //soup[ entry._soupEntryId ] = entry;
          entry._soupLastModifiedDate = timeNow;
          upsertedEntries.push(entry);
          //console.info('upsertSoupEntries, soup -> ' + JSON.stringify(soup));
          //console.info('upsertSoupEntries, upsertedEntries -> ' + JSON.stringify(upsertedEntries));
        }
        localStorage[soupName] = JSON.stringify(soup);
        return upsertedEntries;
      }
    },

    retrieveSoupEntries: function(soupName, entryIds) {
      this.checkSoup(soupName);
      //var soup = _soups[soupName];
      var entries = [];
      var soup = JSON.parse(localStorage[soupName]);
      soup = _.reject(soup, function(el) {
        if (entryIds.indexOf(el._soupEntryId) == -1) {
          return false;
        } else {
          return true;
        }
      });
      // for (var i=0; i<entryIds.length; i++) {
      //     var entryId = entryIds[i];
      //     entries.push(soup[entryId]);
      // }
      return soup;
    },

    removeFromSoup: function(soupName, entryIds) {
      if (navigator.appVersion.includes('Electron')) {
        // In electron
        return ipcRenderer.sendSync('smartstore', {
          method: 'removeFromSoup',
          args: { table: soupName, entryIds: entryIds }
        });
      } else {
        this.checkSoup(soupName);
        //var soup = _soups[soupName];
        var soup = JSON.parse(localStorage[soupName]);
        soup = _.reject(soup, function(el) {
          if (entryIds.indexOf(el._soupEntryId) == -1) {
            return false;
          } else {
            return true;
          }
        });
        // for (var i=0; i<entryIds.length; i++) {
        //     var entryId = entryIds[i];
        //     console.debug('removeFromSoup: ->  -> entryId' + entryId);
        //     delete soup[entryId];
        // }
        localStorage[soupName] = JSON.stringify(soup);
      }
    },

    project: function(soupElt, path) {
      var pathElements = path.split('.');
      var o = soupElt;
      for (var i = 0; i < pathElements.length; i++) {
        var pathElement = pathElements[i];
        o = o[pathElement];
      }
      return o;
    },

    smartQuerySoupFull: function(querySpec) {
      // NB we don't have full support evidently
      if (navigator.appVersion.includes('Electron')) {
        // In electron
        return ipcRenderer.sendSync('smartstore', {
          method: 'smartQuerySoupFull',
          args: { querySpec: querySpec }
        });
      } else {
        var smartSql = querySpec.smartSql;
        // console.debug("smartSql", smartSql);

        var soupName = '';
        var whereField = '';
        var soup = [];
        var results = [];
        var soupEntryId = null;
        var soupElt = null;
        var row = null;

        // SELECT ... WHERE ... IN (values)
        var m = smartSql.match(
          /SELECT\s+(.*)\s+FROM\s+{(.*)}\s+WHERE\s+{(.*):(.*)}\s+IN\s+\((.*)\)/i
        );
        // if (m !== null && m[1] == m[2] ) {
        if (m !== null) {
          soupName = m[2];

          this.checkSoup(soupName);
          this.checkIndex(soupName, whereField);
          soup = JSON.parse(localStorage[soupName]);

          var tmpWhere = smartSql.split(' WHERE ');
          tmpWhere = tmpWhere[1].split(' AND ');

          var whereArr = tmpWhere.map(function(w) {
            w = w.trim().match(/.*:(.*)} IN \((.*)\)/i);
            var matchVals = w[2].replace(/'/g, '').split(',');
            var matchVals2 = matchVals.map(function(m) {
              return m.trim();
            });
            return {
              field: w[1],
              matchVals: matchVals2
            };
          });

          var selectFields = m[1];
          //   console.log('selectFields', selectFields);
          if (selectFields !== '*') {
            selectFieldsArr = [];
            whereRegex = /\:([a-zA-Z0-9_]*)\}/gi;
            fWhere = whereRegex.exec(selectFields);
            while (fWhere != null) {
              //   console.log('fwhere', fWhere[1]);
              selectFieldsArr.push(fWhere[1]);
              fWhere = whereRegex.exec(selectFields);
            }
            selectFields = selectFieldsArr;
          }
          //   console.log('selectFields', selectFields);

          soup.forEach(function(rec) {
            var matchFound = true;
            whereArr.forEach(function(w) {
              //   console.log(rec[w.field], w.matchVals);
              if (matchFound && w.matchVals.includes(rec[w.field])) {
                matchFound = true;
              } else {
                matchFound = false;
              }
            });
            // console.log('matchFound', matchFound);
            if (matchFound) {
              var row = [];
              if (selectFields == '*') {
                row.push(rec._soupEntryId);
                row.push(rec);
              } else {
                // filteredEl = {};
                selectFields.forEach(attr => row.push(rec[attr]));
                // row.push(filteredEl);
              }
              results.push(row);
            }
          });

          return results;
        }

        // SELECT ... FROM ... WHERE [ = / LIKE ]]
        m = smartSql.match(/SELECT\s+(.*)\s+FROM\s+{(.*)}\s+WHERE\s+(.*)/i);
        var likeQuery = false;
        var orQuery = false;
        if (m !== null && m[2] !== null) {
          var whereStr = m[3].split('AND');
          if (whereStr == m[3]) {
            whereStr = m[3].split('OR');
            if (whereStr != m[3]) orQuery = true;
          }
          //   console.debug('whereStr', whereStr);
          //   console.debug('orQuery', orQuery);

          var props = {};
          var whereValue = '';

          whereStr.forEach(function(str) {
            mWhere = str.match(/{(.*):(.*)}\s+=\s+(.*)/i);
            if (!mWhere) {
              //   console.log('attempting LIKE match');
              mWhere = str.match(/{(.*):(.*)} LIKE (.*)/i);
              if (mWhere) likeQuery = true;
            }
            // console.debug('likeQuery', likeQuery);
            // console.debug('mWhere', mWhere);
            whereField = mWhere[2];
            // console.log('mWhere[3]', mWhere[3]);
            if (isNaN(parseInt(mWhere[3]))) {
              whereValue = mWhere[3].split("'")[1];
            } else {
              whereValue = parseInt(mWhere[3]);
            }
            // console.log('whereValue', whereValue);
            props[whereField] = whereValue;
          });

          soupName = m[2];

          var selectFields = m[1];
          //   console.log('selectFields', selectFields);
          if (selectFields !== '*') {
            selectFieldsArr = [];
            whereRegex = /\:([a-zA-Z0-9_]*)\}/gi;
            fWhere = whereRegex.exec(selectFields);
            while (fWhere != null) {
              // matched text: match[0]
              // match start: match.index
              // capturing group n: match[n]
              selectFieldsArr.push(fWhere[1]);
              fWhere = whereRegex.exec(selectFields);
            }
            selectFields = selectFieldsArr;
          }

          this.checkSoup(soupName);
          this.checkIndex(soupName, whereField);
          soup = JSON.parse(localStorage[soupName]);

          results = [];
          //   console.debug('props', props);
          var matchedSoups2 = [];
          if (!likeQuery) {
            var matchedSoups = _.where(soup, props);
            matchedSoups2 = matchedSoups.map(function(el) {
              var row = [];
              if (selectFields == '*') {
                row = [el._soupEntryId];
                row.push(el);
              } else {
                // filteredEl = {};
                selectFields.forEach(attr => row.push(el[attr]));
                // row.push(filteredEl);
              }
              return row;
            });
          } else {
            // console.log('Running our like matches');
            soup.forEach(function(el) {
              // console.log("el", el);
              var matchFound = false;
              Object.keys(props).forEach(function(k) {
                if ((orQuery && !matchFound) || !matchFound) {
                  // Only come in here if we have a chance at success
                  // console.log("Key", k);
                  var fuzzyStart = props[k].charAt(0) == '%' ? true : false;
                  var fuzzyEnd =
                    props[k].charAt(props[k].length - 1) == '%' ? true : false;
                  // console.log("fuzzyStart", fuzzyStart);
                  // console.log("fuzzyEnd", fuzzyEnd);
                  var nonFuzzyStr = props[k].replace(/%/g, '');
                  // console.log("nonFuzzyStr", nonFuzzyStr);
                  var regPtn = '';
                  if (!fuzzyStart) {
                    regPtn += '^';
                  } else {
                    regPtn += '';
                  }
                  regPtn += '(' + nonFuzzyStr + ')';
                  if (!fuzzyEnd) {
                    regPtn += '$';
                  } else {
                    regPtn += '';
                  }
                  // console.log("regPtn", regPtn);
                  // console.log("el[k]", el[k]);
                  var re = new RegExp(regPtn, 'i');
                  matchFound = re.test(el[k]);
                  // console.log("matchFound", matchFound);
                }
              });
              // console.log("matchFound", matchFound);
              if (matchFound) {
                // row = [el._soupEntryId];
                // row.push(el);
                var row = [];
                if (selectFields == '*') {
                  row = [el._soupEntryId];
                  row.push(el);
                } else {
                  // filteredEl = {};
                  selectFields.forEach(attr => row.push(el[attr]));
                  // row.push(filteredEl);
                }
                matchedSoups2.push(row);
              }
            });
          }
          return matchedSoups2;
        }

        // Case-insensitive sorted like query
        // SELECT {soupName:_soup} FROM {soupName} WHERE {soupName:whereField} LIKE 'value' ORDER BY LOWER({soupName:orderByField})
        m = smartSql.match(
          /SELECT\s+{(.*):_soup}\s+FROM\s+{(.*)}\s+WHERE\s+{(.*):(.*)}\s+LIKE\s+'(.*)'\s+ORDER BY LOWER\({(.*):(.*)}\)/i
        );
        if (m !== null && m[1] == m[2] && m[1] == m[3] && m[1] == m[6]) {
          soupName = m[1];
          whereField = m[4];
          var likeRegexp = new RegExp('^' + m[5].replace(/%/g, '.*'), 'i');
          var orderField = m[7];

          this.checkSoup(soupName);
          this.checkIndex(soupName, whereField);
          this.checkIndex(soupName, orderField);
          soup = _soups[soupName];

          results = [];
          for (soupEntryId in soup) {
            soupElt = soup[soupEntryId];
            var projection = this.project(soupElt, whereField);
            if (projection.match(likeRegexp)) {
              row = [];
              row.push(soupElt);
              results.push(row);
            }
          }

          results = results.sort(function(row1, row2) {
            var p1 = row1[0][orderField].toLowerCase();
            var p2 = row2[0][orderField].toLowerCase();
            return p1 > p2 ? 1 : p1 == p2 ? 0 : -1;
          });

          return results;
        }

        // SELECT count(*) FROM {soupName}
        m = smartSql.match(/SELECT\s+count\(\*\)\s+FROM\s+{(.*)}/i);
        if (m !== null) {
          soupName = m[1];
          this.checkSoup(soupName);
          soup = JSON.parse(localStorage[soupName]);
          var count = 0;
          for (soupEntryId in soup) {
            count++;
          }
          return [[count]];
        }

        // SELECT * FROM {soupName}
        // NOTE  - we only supply back the soupEntryId and the object
        //   the real SmartStore also return all fields - I don't know about
        //   the order
        m = smartSql.match(/SELECT\s+(.*)\s+FROM {(.*)}/i);
        if (m !== null) {
          soupName = m[2];
          this.checkSoup(soupName);

          var selectFields = m[1];
          //   console.log('selectFields', selectFields);
          if (selectFields !== '*') {
            selectFieldsArr = [];
            whereRegex = /\:([a-zA-Z0-9_]*)\}/gi;
            fWhere = whereRegex.exec(selectFields);
            while (fWhere != null) {
              // matched text: match[0]
              // match start: match.index
              // capturing group n: match[n]
              selectFieldsArr.push(fWhere[1]);
              fWhere = whereRegex.exec(selectFields);
            }
            selectFields = selectFieldsArr;
          }

          soup = JSON.parse(localStorage[soupName]);
          results = [];
          for (soupEntryId in soup) {
            var row = [];

            soupElt = soup[soupEntryId];
            if (selectFields == '*') {
              row = [soupElt._soupEntryId];
              row.push(soupElt);
            } else {
              // filteredEl = {};
              selectFields.forEach(attr => row.push(soupElt[attr]));
              // row.push(filteredEl);
            }

            results.push(row);

            // row = [soupElt._soupEntryId];
            // row.push(soupElt);
            // results.push(row);
          }
          return results;
        }

        // If we get here, it means we don't support that query in the mock smartstore
        throw new Error(
          'SmartQuery not supported by MockSmartStore:' + smartSql
        );
      }
    },

    querySoupFull: function(soupName, querySpec) {
      //console.info("querySoupFull, soupName -> " + soupName + ", querySpec -> " + JSON.stringify(querySpec));
      if (querySpec.queryType == 'smart') {
        return this.smartQuerySoupFull(querySpec);
      }

      // other query type
      this.checkSoup(soupName);
      this.checkIndex(soupName, querySpec.indexPath);
      //var soup = _soups[soupName];
      var soup = JSON.parse(localStorage[soupName]);
      var results = [];
      var likeRegexp = querySpec.likeKey
        ? new RegExp('^' + querySpec.likeKey.replace(/%/g, '.*'), 'i')
        : null;
      for (var soupEntryId in soup) {
        var soupElt = soup[soupEntryId];
        var projection = this.project(soupElt, querySpec.indexPath);
        if (querySpec.queryType === 'exact') {
          if (projection == querySpec.matchKey) {
            results.push(soupElt);
          }
        } else if (querySpec.queryType === 'range') {
          if (
            (querySpec.beginKey === null || projection >= querySpec.beginKey) &&
            (querySpec.endKey === null || projection <= querySpec.endKey)
          ) {
            results.push(soupElt);
          }
        } else if (querySpec.queryType === 'like') {
          // console.info('querySoupFull like');
          if (projection.match(likeRegexp)) {
            results.push(soupElt);
          }
        }
      }

      results = results.sort(function(soupElt1, soupElt2) {
        var p1 = soupElt1[querySpec.indexPath];
        var p2 = soupElt2[querySpec.indexPath];
        var compare = p1 > p2 ? 1 : p1 == p2 ? 0 : -1;
        return querySpec.order == 'ascending' ? compare : -compare;
      });

      return results;
    },

    querySoup: function(soupName, querySpec) {
      if (navigator.appVersion.includes('Electron')) {
        // In electron
        var results = ipcRenderer.sendSync('smartstore', {
          method: 'querySoup',
          args: { table: soupName, querySpec: querySpec }
        });
        var cursorId = _nextCursorId++;
        var cursor = {
          cursorId: cursorId,
          soupName: soupName,
          querySpec: querySpec,
          pageSize: querySpec.pageSize,
          currentPageIndex: 0,
          currentPageOrderedEntries: results.slice(0, querySpec.pageSize),
          totalPages: Math.ceil(results.length / querySpec.pageSize)
        };

        _cursors[cursorId] = cursor;
        return cursor;
      } else {
        var results = this.querySoupFull(soupName, querySpec);
        var cursorId = _nextCursorId++;
        var cursor = {
          cursorId: cursorId,
          soupName: soupName,
          querySpec: querySpec,
          pageSize: querySpec.pageSize,
          currentPageIndex: 0,
          currentPageOrderedEntries: results.slice(0, querySpec.pageSize),
          totalPages: Math.ceil(results.length / querySpec.pageSize)
        };

        _cursors[cursorId] = cursor;
        return cursor;
      }
    },

    runSmartQuery: function(querySpec) {
      var results = this.smartQuerySoupFull(querySpec);
      var cursorId = _nextCursorId++;
      var cursor = {
        cursorId: cursorId,
        querySpec: querySpec,
        pageSize: querySpec.pageSize,
        currentPageIndex: 0,
        currentPageOrderedEntries: results.slice(0, querySpec.pageSize),
        totalPages: Math.ceil(results.length / querySpec.pageSize)
      };
      _cursors[cursorId] = cursor;
      return cursor;
    },

    moveCursorToPage: function(cursorId, pageIndex) {
      var cursor = _cursors[cursorId];
      var querySpec = cursor.querySpec;
      var results = this.querySoupFull(cursor.soupName, querySpec);

      cursor.currentPageIndex = pageIndex;
      cursor.currentPageOrderedEntries = results.slice(
        pageIndex * querySpec.pageSize,
        (pageIndex + 1) * querySpec.pageSize
      );

      return cursor;
    },

    closeCursor: function(cursorId) {
      delete _cursors[cursorId];
    },

    hookToCordova: function(cordova) {
      var SMARTSTORE_SERVICE = 'com.salesforce.smartstore';
      var self = this;

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgRegisterSoup', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        var indexSpecs = args[0].indexes;
        if (soupName === null) {
          errorCB('Bogus soup name: ' + soupName);
          return;
        }
        if (indexSpecs !== undefined && indexSpecs.length === 0) {
          errorCB('No indexSpecs specified for soup: ' + soupName);
          return;
        }
        successCB(self.registerSoup(soupName, indexSpecs));
      });

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgRemoveSoup', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        self.removeSoup(soupName);
        successCB('OK');
      });

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgSoupExists', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        successCB(self.soupExists(soupName));
      });

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgQuerySoup', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        var querySpec = args[0].querySpec;
        successCB(self.querySoup(soupName, querySpec));
      });

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgRunSmartQuery', function(
        successCB,
        errorCB,
        args
      ) {
        var querySpec = args[0].querySpec;
        successCB(self.runSmartQuery(querySpec));
      });

      cordova.interceptExec(
        SMARTSTORE_SERVICE,
        'pgRetrieveSoupEntries',
        function(successCB, errorCB, args) {
          var soupName = args[0].soupName;
          var entryIds = args[0].entryIds;
          successCB(self.retrieveSoupEntries(soupName, entryIds));
        }
      );

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgUpsertSoupEntries', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        var entries = args[0].entries;
        var externalIdPath = args[0].externalIdPath;
        successCB(self.upsertSoupEntries(soupName, entries, externalIdPath));
      });

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgRemoveFromSoup', function(
        successCB,
        errorCB,
        args
      ) {
        var soupName = args[0].soupName;
        var entryIds = args[0].entryIds;
        self.removeFromSoup(soupName, entryIds);
        successCB('OK');
      });

      cordova.interceptExec(
        SMARTSTORE_SERVICE,
        'pgMoveCursorToPageIndex',
        function(successCB, errorCB, args) {
          var cursorId = args[0].cursorId;
          var index = args[0].index;
          successCB(self.moveCursorToPage(cursorId, index));
        }
      );

      cordova.interceptExec(SMARTSTORE_SERVICE, 'pgCloseCursor', function(
        successCB,
        errorCB,
        args
      ) {
        var cursorId = args[0].cursorId;
        self.closeCursor(cursorId);
        if (successCB) {
          successCB('OK');
        }
      });
    }
  };

  // Return module
  return module;
})(window);

var mockStore = new MockSmartStore();
mockStore.hookToCordova(cordova);

var myUrl = document.URL;
var smartstore = cordova.require('com.salesforce.plugin.smartstore');
if (myUrl.indexOf('scrub=true') > -1) {
  for (var i = 0; i < localStorage.length; i++) {
    var name = localStorage.key(i);
    if (name != 'forceOAuth') {
      smartstore.removeSoup(name);
    }
  }
}
if (myUrl.indexOf('scrub=full') > -1) {
  for (var i = 0; i < localStorage.length; i++) {
    var name = localStorage.key(i);
    smartstore.removeSoup(name);
  }
}
