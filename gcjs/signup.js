Signup = {
  signup_form_submitted: function(data) {
    // TODO: handle error
    return $.post_with_squad('/people/join', data, function() {
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
    if (!data.m_sysid && Signup.request_user_mobile()) {
       var cont = confirm('Groundcrew works better with text messaging using your cell phone.\n\nClick Cancel to enter a mobile number, or OK to continue without one.');
       if (!cont) return "redo";
    }

    // TODO: handle error
    return $.post_with_squad('/agents/update', data, function() {
      go('#complete_auth_from_cookie');
      go.dispatch('signup_complete') || go('#signup_complete_default');
    });
  },

  signup_complete_default: function() {
    go('tool=');
  }
};

go.push(Signup);
