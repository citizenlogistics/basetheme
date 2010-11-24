Confirmation = {
  email_confirmed:  function() { return window.email_stage == 'confirmed'; },
  mobile_confirmed: function() { return window.mobile_stage == 'confirmed'; },
  need_email_confirmation:  function() { return window.email_stage == 'tentative'; },
  need_mobile_confirmation: function() { return window.mobile_stage == 'tentative'; },
  need_point_confirmation: function() { 
    return Confirmation.need_email_confirmation() || Confirmation.need_mobile_confirmation();
  },
  need_multiple_point_confirmation: function() {
    return Confirmation.need_email_confirmation() && Confirmation.need_mobile_confirmation();
  },
  pretty_user_mobile: function() {
    var m = window.user_mobile;
    if (!m) return '';
    m = m.replace('+1', '');
    if (m.length == 10) {
      m = m.substring(0, 3) + ' ' + m.substring(3, 6) + '-' + m.substring(6, 10);
    }
    return m;
  }
};

go.push(Confirmation);

// LATER: something like this would allow live updating of the confirmation div
// if (Confirmation.need_point_confirmation()) {
//   var streamId = window.location.href.split('/')[3];
//   var interval;
//   interval = setInterval(function(){
//     if (!need_point_confirmation()) return clearInterval(interval);
//     $.getScript('/api/auth.js?stream=' + streamId, function(){
//       window.paint();
//     });
//   }, 6*1000);
// }
