var user = $.cookie('gcuser');
if (user) $.extend(window, eval('(' + user + ')'));

function watch_location(){
  return navigator.geolocation && navigator.geolocation.watchPosition(function(position) {
    $.get('/api/checkin', {
      no_poll: true, // don't pull down messages, since there's no message handler here
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  });
}


go.push({
  email_regex: function() {
    return new RegExp(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/);
  },
  password_regex: function() { return new RegExp(/[^\s]{5,}/); },

  complete_auth_from_cookie: function(){
    var user = $.cookie('gcuser');
    if (user) $.extend(window, eval('(' + user + ')'));
    go('#auth_complete');
  },

  auth_complete: function() {
    // The contents of This.user is deprecated.  It should be replaced 
    // with the contents of the gcuser cookie, or maybe the user item.
    This.user = This.user || {};
    $.extend(This.user, {
      tag: window.authority || 'pAnon', title: window.user_name, posx: 38, logged_in: true
    });
    This.user.atags = This.user.atags || '';

    go.trigger('will_user_ready');
    go.dispatch('user_ready') || go('#user_ready_default');
    go.trigger('did_user_ready');
  },
  
  will_user_ready: function() {
    $('body').toggleClass('logged_in',  window.authority != null);
    $('body').toggleClass('logged_out', window.authority == null);
  },
  
  did_user_ready: function() {
    $('body').removeClass('loading');
  },
  
  user_ready_default: function() {
    if (window.authority) {
      go.dispatch('user_ready_logged_in')  || go('#user_ready_logged_in_default');
    }
    else {
      go.dispatch('user_ready_logged_out');
    }
  },
  
  user_ready_logged_in_default: function() {
    watch_location();
    go('tool=start');
  },

  logout: function() {
    if (This.facebook_uid) FB.logout(go.f('#facebook_logout'));
    else go('#redirect("/api/logout")');
  },

  // We've heard back from facebook
  facebook_ready: function() {
    This.facebook_ready = true;
    // TODO: repaint some stuff?
  },

  // User logged into FB from a Groundcrew page
  facebook_login: go.f('#facebook_auth_in_gx'),
  facebook_logout: go.f('#redirect("/api/logout")'),

  // User account from FB needs to be synced with account in GX
  facebook_auth_in_gx: function() {
    $.post('/api/me/contact_methods', {'url': 'facebook:' + This.facebook_uid}, function(){
      var user = $.cookie('gcuser');
      if (user) $.extend(window, eval('(' + user + ')'));
      if (!This.login_after_page_load) window.location.reload();
      else go.dispatch('login') || window.location.reload();
    });
  },

  twitter_login: function() {
    var url = '/api/tconnect?go=' + window.location.href;
    if (window.current_stream) url += '&stream=' + window.current_stream;
    window.location.href = url;
  },

  report_error: function() {
    $.post('/api/bugreport', {issue: This.bugreport}, go.f('#notify_error'));
  },

  redirect: function(url) {
    window.location.href = url;
  },
  
  
  // signup specific
  
  mobile_form_submitted: function(){
    $.post(
      '/api/me/verifications', {
        'url': 'tel:' + This.form_data.mobile,
        'stream': current_stream
      }, go.f('#self_added')
    );
  },
  
  add_self: function() {
    $.post('/api/'+current_stream+'/members', go.f('#self_added'));
  },
  
  pw_form_submitted: function() {
    $.post('/api/me', {'password': This.form_data.pw}, go.f('tool=iphone'));
  },

  // roles & auth
  stream_role_organizer: function() {
    return window.stream_role == 'leader' || window.stream_role == 'organizer';
  },

  // data //
  viewer_url: function() { return '/'+current_stream; },
  invite_url: function() { return '/'+current_stream+'/signup'; },
  join_url: function() { return '/'+current_stream+'/join'; }
});

This.user = { tag: 'pAnon'};


// back compat
var fgo = go.f;
go.push(window.App = {});
