var atevent = null;
var test = false;
function at(num){ atevent = num; }

function sms_count(sent, received, limit){
  GCLibClient.sms_count(sent, received, limit);
};

StreamLoader = {
  interval: 6 * 1000,
  timer: null,

  uuid: function() {
    return This.user.tag + '_' + new Date().getTime();
  },

  load: function(success, error){
    var uri = StreamLoader.stream_url;
    if (atevent) uri += '&since=' + atevent;
    if (This.city_id) {
      uri += '&city=' + This.city_id;
    }

    $.ajax({ url: uri, dataType: 'script', error: error, success: function() {
      if (!atevent) error && error(); // if atevent is null, then stream script eval did not complete
      else success && success();
    }});
  },

  init_autoload: function() {
    $("body").bind("ajaxSend", function(){
      // reduce network congestion by delaying stream load on any other ajax call
      clearTimeout(StreamLoader.timer);
    }).bind("ajaxComplete", function(event, req, settings){
      // schedule stream load whenever an ajax call completes, unless its a stream load that
      // resulted in a permissions error
      if (req && req.status == 403 && settings && settings.url && settings.url.contains(StreamLoader.stream_url)) return;
      StreamLoader.schedule_autoload();
    });

    StreamLoader.load();
  },

  schedule_autoload: function(interval){
    if (StreamLoader.timer) clearTimeout(StreamLoader.timer);
    StreamLoader.timer = setTimeout(function(){StreamLoader.load();}, interval || StreamLoader.interval);
  }

};
