function reload_user(){
  var user = $.cookie('gcuser');
  if (user) $.extend(window, eval('(' + user + ')'));
}

$("body").bind("ajaxSend", function(){
  $(this).addClass('refresh');
}).bind("ajaxComplete", function(event, req, settings){
  $(this).removeClass('refresh');
});
