go.push({
  login_form_submitted: function(data) {
    // TODO: handle error
    return $.post('/api/login', data, function() {
      go('#complete_auth_from_cookie');
      go('tool=');
    });
  }
});
