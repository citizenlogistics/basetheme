var last_ev_id = null;
var last_ev_at = null;
Chats = [];

// event - anything that happened
function ev(city_id, venture_uuid, item_id, created_at, atype, msg, x,
            uuid, actor_id, squad_id, priv)
{
  x = x || {};
  venture_uuid = venture_uuid && venture_uuid.replace('Op__', '');
  item_id = item_id && item_id.replace('Person__', '');

  var annc_tag = uuid || x.uuid || ('e' + venture_uuid + item_id + created_at);
  if (last_ev_id == annc_tag && last_ev_at == created_at) return null;
  last_ev_id = annc_tag;
  last_ev_at = created_at;  
  x['msg'] = msg || x['msg'];

  var result = Anncs.add_or_update(annc_tag, {
    annc_tag: annc_tag,
    item_tag: item_id,
    created_at: created_at,
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
function event(annc_tag, created_at, atype, actor_tag, re, atags, city_id, item_tag, json_etc){
  annc_tag = annc_tag.replace('Annc__', 'e');
  item_tag = item_tag && item_tag.replace('Person__', '');
  actor_tag = actor_tag && actor_tag.replace('Person__', '');
  re = re && re.replace('Person__', '').replace('Op__', '');
  
  return Anncs.add_or_update(annc_tag, {
    annc_tag: annc_tag,
    item_tag: item_tag,
    created_at: created_at,
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
      if (!op_last_child[event.re] || (op_last_child[event.re].created_at || 0) < event.created_at)
      {
        // hack: ignore note event b/c the organizer probably created it and hence doesn't want the
        // operation to jump to the top of the sorted dropdown
        if (event.atype != 'note') op_last_child[event.re] = event;
      }
    } 
    var item = event.item_tag && event.item_tag.resource();
    item && item.recent_events && item.recent_events.push(event);
  },

  changed: function(what_changed) {
    $.each(what_changed, function(k, v){
      if (GCLibClient.event_changed) GCLibClient.event_changed(v);
    });
  }

});
