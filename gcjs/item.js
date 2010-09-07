var most_recent_item = null;
var fuzzfactor = {};

function make_fuzzfactor(){
  var xfuzz = Math.random() * 0.05 - 0.025;
  var yfuzz = Math.random() * 0.05 - 0.025;
  return [xfuzz, yfuzz];
}

// item - an item on the map
function item(city, tag, title, thumb_url, lat, lng, atags, latch, comm, req, x){
  tag = tag.replace('Person__', '').replace('Landmark__', '');

  // ignore items without lat+lng
  if (!lat || !lng || lat == 0 || lng == 0) return null;

  // spread out items that are geocoded to a single common city/zip point
  if (x && (x.acc == 'zip' || x.acc == 'city') && lat && lng) {
    if (!fuzzfactor[tag]) fuzzfactor[tag] = make_fuzzfactor();
    lat = Number(lat) + fuzzfactor[tag][0];
    lng = Number(lng) + fuzzfactor[tag][1];
  }
  var via_sys = (comm && comm.split(/ /)[3] || '');
  return most_recent_item = Resource.add_or_update(tag, {
    city_id: city,
    title: title,
    thumb_url: thumb_url,
    lat: lat,
    lng: lng,
    atags: atags,
    latch: latch,
    comm: comm,
    req: req,
    via_sys: via_sys
  }, x);
}

// TODO: speed test many off() calls in a row
function off(tag){
  if (!tag) return;
  tag = tag.replace('Person__', '').replace('Landmark__', '');
  if (tag.resource_type() == 'Agent') {
    Agents.remove(tag);
    Agents.here_changed();
  } else if (tag.resource_type() == 'Landmark') {
    Landmarks.remove(tag);
  }
  go.trigger('item_removed', tag);
}


Agents = new Resource('Agent', {
  enhancer: function(agent) {
    agent.recent_events = [];
    if (GCLibClient.agent_enhanced) GCLibClient.agent_enhanced(agent);
  },
  
  changed: function(what_changed) {
    if (what_changed[This.user.tag]) $.extend(This.user, what_changed[This.user.tag]);

    $.each(what_changed, function(id, agent){
      if (GCLibClient.agent_changed) GCLibClient.agent_changed(agent);
    });
    
    if (Agents.something_added) {
      Agents.here_changed();
    }
  },
  
  here_changed: function(){
    This.agents = Agents.here();
    go.trigger('agents_here_changed');
  }
});


Landmarks = new Resource('Landmark', {
  enhancer: function(lm) {
    lm.recent_events = [];
  }
});
