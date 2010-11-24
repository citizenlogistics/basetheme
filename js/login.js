go.push({
  login_form_submitted: function(data) {
    return $.post_with_squad('/login', data, function() {
      go('#complete_auth_from_cookie');
      go.dispatch('login_complete') || go('#login_complete_default');
    });
  },

  login_complete_default: function() {
    go('tool=');
  }
});
