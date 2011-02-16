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
  }
});
