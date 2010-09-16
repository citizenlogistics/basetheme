go.push({
  login_form_submitted: function(data) {
    if (!data.sysid) {
      alert('Please provide an email address of phone number!');
      return "redo";
    }
    if (!data.password) {
      alert('Please provide a password!');
      return "redo";
    }

    // TODO: handle error
    return $.post('/api/login', data, function() {
      go('#complete_auth_from_cookie');
      go('tool=');
    });
  }
});
