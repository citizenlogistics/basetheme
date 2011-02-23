var most_recent_item = null;
var item_children = {};
var fuzzfactor = {};
var seen = {};
var seenct = {};

function make_fuzzfactor(acc){
  var factor = 0.0005;
  if (acc == 'zip' || acc == 'city') factor = 0.05;
  var xfuzz = Math.random() * factor - factor/2.0;
  var yfuzz = Math.random() * factor - factor/2.0;
  return [xfuzz, yfuzz];
}

// item - an item on the map
function item(city, tag, title, thumb_url, lat, lng, atags, latch, comm, req, x){
  try {
    tag = tag.replace('Person__', '').replace('Landmark__', '');

    // ignore items without lat+lng
    if (!lat || !lng || (lat == 0 && lng == 0)) return null;

    // spread out items that are geocoded to a single common city/zip point
    var pos = lat+","+lng;
    if (seen[pos] && seen[pos] != tag){
      seenct[pos] = (seenct[pos]||0) + 1;
      if (!fuzzfactor[tag + pos]) fuzzfactor[tag + pos] = make_fuzzfactor(x.acc);
      lat = Number(lat) + fuzzfactor[tag + pos][0];
      lng = Number(lng) + fuzzfactor[tag + pos][1];
    } else seen[pos] = tag;
    
    var hidden = (seenct[pos] > 40);

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
      hidden: hidden,
      req: req,
      via_sys: via_sys
    }, x);    
  } catch(e) {
    go.err('item() error for ' + tag, e);
  }
  return null;
}

// TODO: speed test many off() calls in a row
function off(tag){
  try {
    if (!tag) return;
    tag = tag.replace('Person__', '').replace('Landmark__', '');
    if (tag.resource_type() == 'Agent') {
      Agents.remove(tag);
      Agents.here_changed();
    } else if (tag.resource_type() == 'Landmark') {
      Landmarks.remove(tag);
    }
    go.trigger('item_removed', tag);    
  } catch(e) {
    go.err('off() error for ' + tag, e);
  }
}


Agents = new Resource('Agent', {
  // TODO: This should be called Items, not Agents, because it runs for Landmarks too
  enhancer: function(agent) {
    if (GCLibClient.agent_enhanced) GCLibClient.agent_enhanced(agent);
  },

  changed: function(what_changed) {
    if (what_changed[This.user.tag]) $.extend(This.user, what_changed[This.user.tag]);

    $.each(what_changed, function(id, agenqt){
      if (GCLibClient.agent_changed) GCLibClient.agent_changed(agent);
    });

    if (Agents.something_added) {
      Agents.here_changed();
    }

    var new_cities = [];
    for (var w in what_changed) {
      if (w.slice(0, 1) == 'p') {
        // scan all recently changed items in what changed
        if (what_changed[w].city_id && ! cities[what_changed[w].city_id]) {
          // if city not in cities
          if (new_cities.indexOf(what_changed[w].city_id) < 0) {
            new_cities.push(what_changed[w].city_id);
          }
        }
      }
    }

    if (new_cities.length) {
      // get new cities
      $.get('/api/all', {ids:new_cities.map(function (i) {return 'c'+i;}).join(',')}, function (response) {
        for (var ci=0; ci < response.length; ci++) {
          var c = response[ci];
          city(c['id'], c['name'], c['lat'], c['lng']);
        }
        go.trigger('new_cities');
      }, 'json');
    }
  },

  here_changed: function(){
    This.agents = Agents.here();
    go.trigger('agents_here_changed');
  }
});


Landmarks = new Resource('Landmark', {});
