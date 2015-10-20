/*
 * codeflow_storage.js
 *
 * @MobileCaddy
 * 2015
 *
 * A wrapper that overrides localStorage for use in Codeflow environment.
 * Let's us access the storage of a running app in Codeflow.
 * It does this by reading/writing to a REST API that looks after the shared
 * storage for us.
 *
 * A bit nuts, right?
 *
 */

if (!$j) var $j = jQuery.noConflict();

Storage.prototype._getItem = Storage.prototype.getItem;
Storage.prototype.getItem = function(key)
{
  console.debug("CODEFLOW GET_ITEM", key);

  var getMyData = function() {
   var res = $j.ajax({
      type: 'GET',
      async:   false,
      url: "/codeflow/localstorage/" + key,
      cache: false,
      processData: false,
      success: function(response) {
        console.debug('response', response);
      },
      dataType: "json",
      beforeSend: function(xhr) {
      }
    })
    .done(function(data){
      console.debug('done', data);
    })
    .fail(function(data){
      console.debug('fail2', data);
      return null;
    });
    console.log('res', res);
    if (res.responseText !== "") {
      return res.responseText;
    } else {
      return null;
    }
  };
  return getMyData();
};


Storage.prototype._key = Storage.prototype.key;
Storage.prototype.key = function(key)
{
  console.debug("CODEFLOW KEY", key);

  var getMyData = function() {
   var res = $j.ajax({
      type: 'GET',
      async:   false,
      url: "/codeflow/localstorage/key/" + key,
      cache: false,
      processData: false,
      success: function(response) {
        console.debug('response', response);
      },
      error: function(err) {
        console.error('error', err);
      },
      dataType: "json",
      beforeSend: function(xhr) {
      }
    })
    .done(function(data){
      console.debug('done', data);
    });
    if(res.responseText) {
      return JSON.parse(res.responseText).key;
    } else {
      return null;
    }
  };
  return getMyData();
};


Storage.prototype._removeItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function(key)
{
  console.debug("CODEFLOW REMOVE_ITEM", key);


  var delMyData = function() {
   var res = $j.ajax({
    type: 'DELETE',
    url: "/codeflow/localstorage/remove",
    cache: false,
    processData: false,
    data: JSON.stringify({"key" : key}),
    success: function(response) {
      console.debug('response', response);
    },
    error: function(err) {
      console.error('error', err);
    },
    dataType: "json",
    beforeSend: function(xhr) {
    }
    })
    .done(function(data){
      console.debug('done', data);
    });
    return JSON.parse(res.responseText).length;
  };
  return delMyData();
  // and also write to localStorage - we do this to enable visibility
  //this._setItem(key, value);
};


Storage.prototype._setItem = Storage.prototype.setItem;
Storage.prototype.setItem = function(key, value)
{
  console.debug("CODEFLOW SET_ITEM", typeof(value), key, value);
  // make the call to the rest service
  $j.ajax({
    type: 'POST',
    url: "/codeflow/localstorage",
    cache: false,
    processData: false,
    data: JSON.stringify({"key" : key, "data": JSON.parse(value)}),
    success: function(response) {
      console.debug('response', response);
    },
    error: function(err) {
      console.error('error', err);
    },
    dataType: "json",
    beforeSend: function(xhr) {
    }
    });
  // and also write to localStorage - we do this to enable visibility
  //this._setItem(key, value);
};



//Storage.prototype._length = Storage.prototype.length;
Storage.prototype.__defineGetter__('length', function(key)
{
  console.debug("CODEFLOW LENGTH", key);

  var getMyData = function() {
   var res = $j.ajax({
      type: 'GET',
      async:   false,
      url: "/codeflow/localstorage/length",
      cache: false,
      processData: false,
      success: function(response) {
        console.debug('response', response);
      },
      error: function(err) {
        console.error('error', err);
      },
      dataType: "json",
      beforeSend: function(xhr) {
      }
    })
    .done(function(data){
      console.debug('done', data);
    });
    return JSON.parse(res.responseText).length;
  };
  return getMyData();
});

