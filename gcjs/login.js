function login_by_cookie(){
  This.user = This.user || {};
  $.extend(This.user, {
    tag: window.authority || 'Anon', title: window.user_name, posx: 38, logged_in: true
  });
  This.user.atags = This.user.atags || '';
  if (window.authority) $(function(){ $('body').addClass( 'logged_in' ); });
  else $(function(){ $('body').addClass( 'logged_out' ); });
}
