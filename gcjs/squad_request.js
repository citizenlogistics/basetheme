jQuery.extend({
  ajax_with_squad: function(settings) {
    if (!settings.data) settings.data = {};
    settings.data.squad = window.current_stream;
    if (settings.url) settings.url = '/api' + settings.url;
    $.ajax(settings);
  },

  post_with_squad: function(url, data, callback, type) {
    // shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = {};
		}

    return $.ajax_with_squad({type: 'POST', url: url, data: data, success: callback, dataType: type});
  },

  delete_with_squad: function(url, data, callback, type) {
    // shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = {};
		}

    return $.ajax_with_squad({type: 'DELETE', url: url, data: data, success: callback, dataType: type});
  },

  get_with_squad: function(url, data, callback, type) {
		// shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = null;
		}
    return $.ajax_with_squad({type: 'GET', url: url, data: data, success: callback, dataType: type});
  },

  getJSON_with_squad: function(url, data, callback) {
    return $.get_with_squad(url, data, callback, 'json');
  }
});
