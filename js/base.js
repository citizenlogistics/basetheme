function reload_user(){
  var user = $.cookie('gcuser');
  if (user) $.extend(window, eval('(' + user + ')'));
}

function watch_location(){
  navigator.geolocation && navigator.geolocation.watchPosition(function(position) {
    var loc = position.coords.latitude + "," + position.coords.longitude;
    $.get('/api/checkin', { lat: position.coords.latitude, lng: position.coords.longitude });
  });
}

User = {
  fb_login: function(after, uid) {
    $.post('/api/me/contact_methods', {'url': 'facebook:' + uid}, function(){
      reload_user();
      after && after();
    });
  }
};
