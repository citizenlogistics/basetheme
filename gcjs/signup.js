go.push({
  req_user_mobile: function() {
    if (window.user_mobile) return false;
    if (!window.current_stream_systems) return true;
    return window.current_stream_systems && window.current_stream_systems.contains('m');
  }
});
