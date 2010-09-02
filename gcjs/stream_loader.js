var atevent = null;
var test = false;
function at(num){ atevent = num; }

function sms_count(sent, received, limit){
  GCLibClient.sms_count(sent, received, limit);
};

// TODO(twit): remove demo references
StreamLoader = {
  interval: 6 * 1000,
  timer: null,

  uuid: function() {
    return This.user.tag + '_' + new Date().getTime();
  },

  init: function() {
    $("body").bind("ajaxSend", function(){
      clearTimeout(StreamLoader.timer);
    }).bind("ajaxComplete", function(event, req, settings){
      if (!req || req.status != 403 || !settings || !settings.url || settings.url.indexOf('stream.js') < 0) {
        StreamLoader.schedule_autoload();
      }
    });

    Resource.handle_changes = true;

    if (demo) return;
    StreamLoader.autoload();
  },

  schedule_autoload: function(interval){
    if (demo) return;
    if (StreamLoader.timer) clearTimeout(StreamLoader.timer);
    StreamLoader.timer = setTimeout(function(){StreamLoader.autoload();}, interval || StreamLoader.interval);
  },

  maybe_trigger_load: function() {
    if (StreamLoader.go_on_load && ($values(Agents.by_tag).length > 0 || most_recent_item)) {
      go(StreamLoader.go_on_load);
      $('#loading_data').remove();
      delete StreamLoader.go_on_load;
    }
  },

  autoload: function(callback){
    if (demo) return;
    var uri = '/api/stream.js?stream=' + window.current_stream;
    if (atevent) uri += '&since=' + atevent;
    if (This.city_id) {
      uri += '&city=' + This.city_id;
    }

    $.getScript(uri, callback);
    StreamLoader.maybe_trigger_load();
  },

  fetch: function(url, options, after){
    if (demo) return;
    $.getJSON(url, options, function(obj){
      if (obj.error){ alert("Note: " + obj.error); return; }
      if (after) after(obj);
    });
  }

};
