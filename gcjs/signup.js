Signup = {
  signup_form_submitted: function(data) {
    if (!data.name) {
      alert('Please provide your name!');
      return "redo";
    }
    if (!data.e_sysid) {
      alert('Please provide your email address!');
      return "redo";
    }
    if (!valid_email(data.e_sysid)) {
      alert('Your email address appears to be invalid.');
      return "redo";
    }
    if (!data.password || data.password.length < 5) {
      alert('Please provide a password at least 5 characters long!');
      return "redo";
    }

    // TODO: handle error
    return $.post('/api/people/join', data, function() {
      go('#complete_auth_from_cookie');
      go('tool=signup_details');
    });
  },

  request_user_mobile: function() {
    if (window.user_mobile) return false;
    if (!window.current_stream_systems) return true;
    return window.current_stream_systems && window.current_stream_systems.contains('m');
  },

  // TODO: go needs to handle multipart/form-data
  signup_details_form_submitted: function(data) {
    if (!data.loc) {
      alert('Please provide your location!');
      return "redo";
    }

    if (!data.m_sysid && Signup.request_user_mobile()) {
       var cont = confirm('Groundcrew works better with text messaging using your cell phone.\n\nClick Cancel to enter a mobile number, or OK to continue without one.');
       if (!cont) return "redo";
    }

    // TODO: handle error
    return $.post('/api/agents/update', data, function() {
      go('#complete_auth_from_cookie');
      go('tool=');
    });
  }
};

go.push(Signup);
