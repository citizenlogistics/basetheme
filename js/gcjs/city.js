var cities = {};
var city_locs = {};

// city - a city in which there is groundcrew activity
function city(id, title, lat, lng, agent_count){
  try {
    var parts = title.split(', ');
    cities[id] = parts[0];
    city_locs[id] = [lat, lng];
  } catch(e) {
    go.err('city() error for ' + id, e);
  }
}
