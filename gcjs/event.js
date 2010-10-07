var last_ev_id = null;
var last_ev_at = null;
Chats = [];

// event - anything that happened
function ev(city_id, venture_uuid, item_id, created_ts, atype, msg, x,
            uuid, actor_id, squad_id, priv)
{
  x = x || {};
  venture_uuid = venture_uuid && venture_uuid.replace('Op__', '');
  item_id = item_id && item_id.replace('Person__', '');

  var annc_tag = uuid || x.uuid || ('e' + venture_uuid + item_id + created_ts);
  if (last_ev_id == annc_tag && last_ev_at == created_ts) return null;
  last_ev_id = annc_tag;
  last_ev_at = created_ts;
  x['msg'] = msg || x['msg'];

  var result = Anncs.add_or_update(annc_tag, {
    annc_tag: annc_tag,
    item_tag: item_id,
    created_ts: created_ts,
    atype: atype,
    actor_tag: actor_id,
    re: venture_uuid,
    atags: atype,
    city_id: city_id,
    squad_id: squad_id,
    priv: priv
  }, x);

  if (atype == "chat" && result) Chats.push(Event.improve(result));
  return result;
}

// old style event, for backwards-compatibility
function event(annc_tag, created_ts, atype, actor_tag, re, atags, city_id, item_tag, json_etc){
  annc_tag = annc_tag.replace('Annc__', 'e');
  item_tag = item_tag && item_tag.replace('Person__', '');
  actor_tag = actor_tag && actor_tag.replace('Person__', '');
  re = re && re.replace('Person__', '').replace('Op__', '');
  
  return Anncs.add_or_update(annc_tag, {
    annc_tag: annc_tag,
    item_tag: item_tag,
    created_ts: created_ts,
    atype: atype,
    actor_tag: actor_tag,
    re: re,
    atags: atags,
    city_id: city_id
  }, json_etc);
}

// old style chat, for backwards-compatibility
function rem(who, when, what, oids, msg, title){
  return ev(null, null, who, when, what, msg, { 
    actor_title: title || (who && who.resource() && who.resource().title) || 'Unknown Organizer'
  });
};


Events = Anncs = new Resource('Annc', {

  enhancer: function(event) {
    if (event.re) {
      if (!op_children[event.re]) op_children[event.re] = [];
      op_children[event.re].push(event);
      op_agents[event.re] = op_counts[event.re] = null;
      if (!op_last_child[event.re] || (op_last_child[event.re].created_ts || 0) < event.created_ts)
      {
        // hack: ignore note event b/c the organizer probably created it and hence doesn't want the
        // operation to jump to the top of the sorted dropdown
        if (event.atype != 'note') op_last_child[event.re] = event;
      }
    }
    if (event.item_tag) {
      if (!item_children[event.item_tag]) item_children[event.item_tag] = [];
      item_children[event.item_tag].push(event);
    }
    if (event.actor_tag && event.item_tag != event.actor_tag) {
      if (!item_children[event.actor_tag]) item_children[event.actor_tag] = [];
      item_children[event.actor_tag].push(event);
    }
  },

  changed: function(what_changed) {
    $.each(what_changed, function(k, v){
      if (GCLibClient.event_changed) GCLibClient.event_changed(v);
    });
  },

  // Returns improved events, sorted by desc time.  q can be a Resource query string.
  events: function(q) {
    var events = typeof q == 'string' ?
      Anncs.find(q).sort_by('.created_ts', { order: 'desc' }) :
      Anncs.everything().slice(0).reverse();
    $.each(events, function(){ Event.improve(this); });
    return events;
   }

});

Event = {

  improve: function(ev) {
    ev.when = $time_and_or_date(ev.created_ts);
    ev.color = Event.color(ev);
    ev.item = ev.item || (ev.item_tag && ev.item_tag.resource());
    ev.item_title = ev.item_title || ev.item && ev.item.title;
    ev.item_thumb_url = ev.item && ev.item.thumb_url;
    ev.landmark = ev.landmark_tag && ev.landmark_tag.resource();
    ev.landmark_title = ev.landmark && ev.landmark.title;
    if (ev.re) {
      try {
        var op = ev.re.resource();
        ev.opname = op && op.title;        
      } catch(e) {
        go.err('error during ev.re.resource() for ev ' + ev, e);
      }
    }
    try { ev.actor = ev.actor_tag && ev.actor_tag.resource(); } catch(e) {
      go.err('error during ev.actor_tag.resource() for ev ' + ev, e);
    }
    ev.on_re = op ? '<span class="re"> on <a href="#@' + ev.re + '">a mission</a></span>' : '';
    ev.actor_title = ev.actor_title || (ev.actor && ev.actor.title) ||
                     ev.actor_name  || ev.item_title || 'UnknownUser';
    ev.actor_thumb_url = ev.actor && ev.actor.thumb_url;

    ev.what = (Event.whats[ev.atype] || "#{atype}").t(ev);
    return ev;
  },

  color: function(ev){
    if ($w(ev.atype).intersect($w('viewer timeout switched chat')).length > 0) return "invisible";
    if ($w('assigned msg pm').indexOf(ev.atype) >= 0) return "purple";
    if ($w('error warning').indexOf(ev.atype) >= 0) return "red";
    if ($w('reported').indexOf(ev.atype) >= 0) return "green";
    if ($w('signup').indexOf(ev.atype) >= 0) return "grey";
    return "";
  },

  whats: {

    // operations
    invited:    "invited #{msg}<span class='re'> to: <a href='#@#{re}'>#{opname}</a></span>",
    accepted:   "accepted<span class='re'>: <a href='#@#{re}'>#{opname}</a></span>",
    assigned:   "gave an assignment to <a href='#@#{item_tag}'>#{item_title}</a>#{on_re}: <span class='msg'>#{msg}</span>",
    declined:   "declined<span class='re'>: <a href='#@#{re}'>#{opname}</a></span>",
    completed:  "completed<span class='re'>: <a href='#@#{re}'>#{opname}</a></span>",
    answered:   "answered<span class='re'> <a href='#@#{re}'>a question</a></span>: <span class='msg'>#{msg}</span>",
    reported:   "reported#{on_re}: <span class='msg'>#{msg}</span>",

    // others
    msg:      "contacted agent <a href='#@#{item_tag}'>#{item_name}</a>#{on_re}: <span class='msg'>#{msg}</span>",
    pm:       "contacted the organizers#{on_re}: <span class='msg'>#{msg}</span>",
    chat:     ": <span class='msg'>#{msg}</span>",
    note:     "commented#{on_re}: <span class='msg'>#{msg}</span>",
    error:    "error#{on_re}: <span class='error'>#{msg}</span>",
    warning:  "warning#{on_re}: <span class='warning'>#{msg}</span>",

    // signups
    email_invited:    "sent a squad invitation to #{msg}",
    email_confirmed:  "accepted a squad invitation",
    mobile_contacted: "was contacted via SMS",
    signup:           "signed up!",
    import_completed: "import completed: #{msg}"

  }

};

