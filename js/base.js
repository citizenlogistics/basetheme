function reload_user_info(login, password){
  var squad_id = window.location.href.split('/')[3];
  if (squad_id.match(/start|login/)) squad_id = null;
  if (squad_id) squad_id = 's' + squad_id;
  window.invite_code = window.location.hash && window.location.hash.slice(1);
  $.ajax({ 
    async: false, 
    url: '/api/all',
    dataType: 'script',
    data: {
      login:login, 
      password:password,
      ids: ['me', squad_id, window.invite_code].join(','),
      callback: 'load_user_squad_and_invite'
    }
  });
}

function load_user_squad_and_invite(all){
  load_current_user(all[0]);
  load_current_squad(all[1]);
  load_current_invite(all[2]);
  go.onwards();
}

function load_current_user(user){
  window.stream_names = {};
  window.squad_roles  = {};
  window.current_user = {};
  if (!user.id) return;  
  window.current_user = user;
  
  // this is for legacy javascript code
  // gone are: mobile_sent_ts, email_stage, mobile_stage, session_status
  window.authority   = user.id;
  window.pw_set      = user.has_password;
  window.user_email  = user.email;
  window.user_mobile = user.phone;
  window.user_name   = user.name;
  window.user_bio    = user.bio;
  window.user_loc    = user.loc;
  window.user_thumb  = user.thumb_url;
  
  $.each(user.squad_roles, function(entry){ 
    var squad_id = entry[0];
    var name = entry[1];
    var role = entry[2];    
    window.stream_names[squad_id] = name;
    window.squad_roles[squad_id]  = role;
  });
}

function load_current_squad(squad){
  if (!squad.id) return;
  window.current_squad = {};
  
  // new style javascript
  window.current_squad = squad;
  
  // for legacy javascript
  window.current_stream = squad.id;  
  window.stream_role = window.squad_roles[squad.id];
  $.each(squad, function(k, v){ window["current_stream_" + k] = v; });
  window.current_stream_thumb   = squad.thumb_url;
  window.current_stream_systems = squad.systems_letters;
}

function load_current_invite(invite){
  if (!(invite && invite.squad_id)) return;
  window.current_invite = {};
  window.current_invite = invite;
}


reload_user_info();


function watch_location(){
  return navigator.geolocation && navigator.geolocation.watchPosition(function(position) {
    $.get('/api/checkin', {
      no_poll: true, // don't pull down messages, since there's no message handler here
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
    $('body').addClass('located');
  });
}

function table(cols, data, func, blank_msg){
  var table = $('<table/>');
  table.append(tag('tr', cols.map(function(col){ return tag('th', col); }).join('')));
  $.each(data, function(){
    var row_data = this;
    $.each(func(row_data), function() {
      var row = $(tag('tr', this.map(function(col){ return tag('td', col); }).join('')));
      row.data('row_data', row_data);
      table.append(row);
    });
  });
  if (data.length == 0) {
    blank_msg = blank_msg || '';
    table.append('<tr><td colspan="'+cols.length+'">'+blank_msg+'</td></tr>');
  }
  return table;
}

function tag(name, attrs) {
  var content = '';
  if (attrs == null) attrs = '';
  if (typeof attrs == "string" && attrs.length) attrs = {content: attrs};
  if (name.indexOf('.') >= 0) {
    var words = name.split('.');
    name = words[0];
    attrs['class'] = words.slice(1).join(' ');
  }
  if (name == 'a' && !attrs.href) attrs.href = '#';
  if (attrs.content) {
    content = attrs.content;
    delete attrs.content;
  }
  if (attrs.cls) {
    attrs['class'] = attrs.cls;
    delete attrs.cls;
  }
  var pairs = [];
  $.each(attrs, function(i, obj){ pairs.push({key:i, val: obj}); });
  var attr = pairs.map(function(x){ return x.key + "=\"" + x.val + "\""; }).join(' ');
  return "<" + name + " " + attr + ">" + content + "</" + name + ">";
}


go.push({
  email_regex: function() {
    return new RegExp(/^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/);
  },
  password_regex: function() { return new RegExp(/[^\s]{5,}/); },
  
  start: function(){
    go('#auth_complete');
  },
  
  complete_auth_from_cookie: function(){
    go('#auth_complete');
  },

  auth_complete: function() {
    // The contents of This.user is deprecated.  It should be replaced 
    // with the contents of the gcu cookie, or maybe the user item.
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

  user_ready_default: function() {
    if (window.authority) {
      go.dispatch('user_ready_logged_in')  || go('#user_ready_logged_in_default');
    }
    else {
      go.dispatch('user_ready_logged_out');
    }
    go('tool=start');
  },
  
  user_ready_logged_in_default: function() {
    watch_location();
  },

  logout: function() {
    if (This.facebook_uid) FB.logout(go.f('#facebook_logout'));
    else go('#redirect("/api/logout")');
  },

  // We've heard back from facebook
  facebook_ready: function() {
    This.facebook_ready = true;
    if (This.facebook_uid && !window.authority) go('#facebook_auth_in_gx');
    // TODO: repaint some stuff?
  },

  // User logged into FB from a Groundcrew page
  facebook_login: go.f('#facebook_auth_in_gx'),
  facebook_logout: go.f('#redirect("/api/logout")'),

  // User account from FB needs to be synced with account in GX
  facebook_auth_in_gx: function() {
    reload_user_info();
    if (This.tool == 'login') go('tool=');
    go.dispatch('did_login') || window.location.reload();
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

  flash: function(){
    var flash = $.cookie('flash');
    if (flash) {
      var modal_flash = $('.active.modal .flash');
      if (modal_flash.length) modal_flash.html(flash).show();
      else $.jGrowl(flash);

      $.cookie('flash', '');
    }
  },


  // signup specific
  
  watch_location: function() {
    navigator.geolocation && navigator.geolocation.watchPosition(function(position) {
      $.get('/api/checkin', {
        no_poll: true, // don't pull down messages, since there's no message handler here
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      $('body').addClass('located');
      window.user_loc = position.coords.latitude + ", " + position.coords.longitude;
      $('.magic').paint();
    });
  },
  
  
  verify_mobile: function(){
    if (!This.form_data.mobile || window.user_mobile) return go.onwards();
    $.post('/api/me/verifications', {
        'url': 'tel:' + This.form_data.mobile,
        'stream': current_stream
      }, go.onwards );
  },

  verify_email: function(){
    $.post('/api/me/verifications', {
        'url': 'email:' + This.form_data.email,
        'stream': current_stream
      }, go.onwards );
  },

  display_invite_info: function() {
    invite = window.current_invite;
    squad = window.current_squad;
    // TODO(misha): Ask Joe if "id" is the attribute name of the squad id.
    if (invite && squad && invite.squad_id == squad.id && invite.role) {
      return " as an " + invite.role;
    } else {
      return "";
    }
  },
  
  add_self: function() {
    This.form_data = This.form_data || {};
    if (window.invite_code) This.form_data.invite_code = window.invite_code;
    $.post('/api/s'+current_stream+'/members', This.form_data, go.onwards);
  },
  
  redirect_squad_page: function(page) {
    go('#redirect("/'+current_stream + page +'")');
  },
  
  invent_squad: function() {
    $.post('/api/me/squads', This.form_data, function(sid){
      window.current_stream = sid;
      go.onwards();
    });
  },
  
  submit_password: function() {
    $.post('/api/me', {'password': This.form_data.pw}, go.onwards);
  },

  current_stream_image: function(){
    return window.current_stream_image_url || window.current_stream_thumb;
  },

  // roles & auth
  stream_role_organizer: function() {
    return window.stream_role == 'leader' || window.stream_role == 'organizer';
  },

  // data //
  viewer_url: function() { return '/'+current_stream; },
  invite_url: function() { return '/'+current_stream+'/signup'; },
  forgot_password_url: function() { return '/'+current_stream+'/forgot_password'; },
  join_url: function() { return '/'+current_stream+'/join'; }
});

This.user = { tag: 'pAnon'};


// back compat
go.push(window.App = {});
