go.push({
  process_login: function() {
    return $.post_with_squad('/login', This.form_data, function() {
      go('#complete_auth_from_cookie'); 
      go.onwards();
    });
  },

  login_form_submitted: function(data) {
    reload_user_info(This.form_data.sysid, This.form_data.password);
    go('#complete_auth_from_cookie');
    go.dispatch('login_complete') || go('#login_complete_default');
  },

  login_complete_default: function() {
    go('tool=start');
  },

  send_reset_link: function() {
    console.debug(This.form_data);
    This.form_data.target = '/' + current_stream + '/reset_password';
    This.form_data.squad = window.current_stream;
    $.post('/api/one_time_auth', This.form_data, go.onwards);
  }

});
