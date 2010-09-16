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
  facebook_ready: function() {
    This.facebook_ready = true;
    // TODO: check for twitter below too
    if (This.facebook_ready) go.trigger('social_logins_ready');
  },
  
  social_logins_ready: function() {
    // get tokens from server if necessary
    if (This.facebook_uid && !window.authority) return go('#fetch_login_token_from_facebook');
    
    // otherwise user ready
    go.trigger('will_user_ready');
    go.dispatch('user_ready') || go('#user_ready_default');
    go.trigger('did_user_ready');
  },
  
  will_user_ready: function() {
    if (window.authority) $('body').addClass( 'logged_in' );
    else $('body').addClass( 'logged_out' );
  },
  
  did_user_ready: function() {
    $('body').removeClass('loading');
  },
  
  user_ready_default: function() {
    if (window.authority) go.dispatch('user_ready_logged_in') || go('#user_ready_logged_in_default');
    else go.dispatch('user_ready_logged_out') || go('#redirect("/login")');
  },
  
  user_ready_logged_in_default: function() {
    watch_location();
    go('tool=start');
  },
  
  
  facebook_login: go.f('#fetch_login_token_from_facebook'),
  
  fetch_login_token_from_facebook: function() {
    $.post('/api/me/contact_methods', {'url': 'facebook:' + This.facebook_uid}, function(){
      var user = $.cookie('gcuser');
      if (user) $.extend(window, eval('(' + user + ')'));
      if (!This.login_after_page_load) window.location.reload();
      else go.dispatch('login') || window.location.reload();
    });
  },
  
  report_error: function() {
    $.post('/api/bugreport', {issue: This.bugreport}, go.f('#notify_error'));
  },
  
  facebook_logout: function(){ 
    go('#redirect("/api/logout")');
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
    $.post('/api/'+current_stream+'/members', go.f('#added_self_to_stream'));
  },
  
  added_self_to_stream: function() {
    if (window.user_mobile) go('#self_added_need_mobile');
    else go('#self_added');
  },
  
  self_added_mobile_needed: go.f('tool=get_mobile'),
  
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
