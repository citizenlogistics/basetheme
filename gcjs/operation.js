var most_recent_op = null;
var op_children = {};
var op_last_child = {};

function operation(city, uuid, name, vtype, thumb_url, lat, lng, loc, focii, notes, 
  authority_id, authority_name, created_ts, x, stream_id)
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
    atype: "assignment " + vtype,
    body: name,
    created_ts: created_ts,
    stream_id: stream_id
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
