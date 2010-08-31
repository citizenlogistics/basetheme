var user = $.cookie('gcuser');
if (user) $.extend(window, eval('(' + user + ')'));

function watch_location(){
  navigator.geolocation && navigator.geolocation.watchPosition(function(position) {
    var loc = position.coords.latitude + "," + position.coords.longitude;
    $.get('/api/checkin', { lat: position.coords.latitude, lng: position.coords.longitude });
  });
}


go.push({
  report_error: function() {
    $.post('/api/bugreport', {issue: This.bugreport}, go.f('#notify_error'));
  },
  
  facebook_login: function() {
    $.post('/api/me/contact_methods', {'url': 'facebook:' + This.facebook_uid}, function(){
      var user = $.cookie('gcuser');
      if (user) $.extend(window, eval('(' + user + ')'));
      go.dispatch('facebook_did_login') || window.location.reload();
    });
  },
  
  facebook_logout: function(){ 
    window.location.href = '/api/logout';
  }
});

This.user = { tag: 'pAnon'};


// back compat
var fgo = go.f;
go.push(window.App = {});
