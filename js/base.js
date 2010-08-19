function reload_user(){
  var user = $.cookie('gcuser');
  if (user) $.extend(window, eval('(' + user + ')'));
}

