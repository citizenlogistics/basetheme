var most_recent_op = null;
var op_children = {};
var op_agents = {};
var op_counts = {};
var op_last_child = {};

function operation(city, uuid, name, vtype, thumb_url, lat, lng, loc, focii, notes, 
  authority_id, authority_name, created_ts, x, stream_id, type)
{
  focii = focii && focii.replace(/Person__/g, '').replace(/Landmark__/g, '');
  authority_id = authority_id && authority_id.replace('Person__', '');

  // HACK to work around extra param added to op
  if (typeof created_ts == 'object' && !x) {
    x = created_ts;
    created_ts = null;
  }
  most_recent_op = Resource.add_or_update(uuid, {
    city_id: Number(city),
    lat:lat,
    lng:lng,
    thumb_url:thumb_url,
    city:Number(city),
    title: name,
    focii: focii,
    architect: authority_id,
    architect_name: authority_name,
    atype: "assignment " + vtype,
    body: name,
    created_ts: created_ts,
    stream_id: stream_id,
    type: type
  }, x);
  return most_recent_op;
}


// old style operation, for backwards-compatibility
function op(city, tag, title, focii, architect, atype, body, x){
  tag = tag.replace('Op__', '');
  focii = focii && focii.replace(/Person__/g, '').replace(/Landmark__/g, '');
  architect = architect && architect.replace('Person__', '');
  
  return most_recent_op = Resource.add_or_update(tag, {
    city_id: city,
    title: title,
    focii: focii,
    architect: architect,
    atype: atype,
    body: body
  }, x);
}

Ops = new Resource('Op', {
  enhancer: function(x){
    if (!op_children[x.id]) op_children[x.id] = [];
    x.site = x.site || (x.focii && x.focii.split(' ')[0]);
    x.thumb_url = x.thumb_url || (x.site && x.site.resource() && x.site.resource().thumb_url);
    if (GCLibClient.op_enhanced) GCLibClient.op_enhanced(x);
  }
});

Operation = {
  improve: function(op) {
    op.when = op.created_ts > 0 ? $time_and_or_date(op.created_ts) : '';
    var title = op.title && op.title.indexOf('Question') == 0 ? op.title : 'Mission: ' + op.title;
    op.what = '<a href="#@' + op.id + '">' + title + '</a>';
  },

  counts: function(op_id) {
    Operation.coalesce(op_id);
    return op_counts[op_id];
  },

  agents: function(op_id) {
    Operation.coalesce(op_id);
    return op_agents[op_id];
  },

  coalesce: function(op_id) {
    if (op_counts[op_id] && op_agents[op_id]) return;
    var counts = op_counts[op_id] = {};
    var agents = op_agents[op_id] = {};

    var state_types = $w('accepted completed declined answered reported');
    $.each(op_children[op_id] || {}, function(i, ev){
      var parsed_type = ev.atype;
      if (ev.msg_parsed) parsed_type = parsed_type + ' ' + ev.msg_parsed;

      counts[parsed_type] = counts[parsed_type] || 0;

      if (state_types.contains(ev.atype)) {
        counts[parsed_type] += 1;
        if (ev.item_tag) {
          agents[ev.item_tag] = parsed_type;
          // completion states overide others
          if (ev.atype == 'completed' || ev.atype == 'answered') agents[ev.item_tag] = parsed_type;
        }
      }
      else if (ev.atype == 'invited') {
        var m = ev.msg && ev.msg.match(/\d+/);
        counts[parsed_type] += Number(m && m[0]) || 0;
      }
    });
  },

  last_update_ts: function(x) {
    if (op_last_child[x.id] && op_last_child[x.id].created_ts > 0) return op_last_child[x.id].created_ts;
    return x.created_ts || 0;
  }
};
