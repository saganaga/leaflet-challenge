// Creating the map object, set center on Salt Lake City, Utah
let myMap = L.map("map", {
    center: [40.7608, -111.8910],
    zoom: 5
  });
    
  // Adding the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
   
  // Use the "Past 7 Days All Earthquakes" link to get the GeoJSON data
  let link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
  const legendColors = ["#A4F600", "#DDF402", "#F7DB11", "#FEB72A", "#FCA35E", "#FF5F65"];
  const legendLabels = ["-10-10", "10-30", "30-50", "50-70", "70-90", "90+"]
  function getColor(z) {
    // console.log(z);
    // Assume range is 0 to 100; broken into ranges of 20m width
    if(z < 10) {
      return legendColors[0];
    }
    if(z < 30) {
      return legendColors[1];
    }
    if(z < 50) {
      return legendColors[2];
    }
    if(z < 70) {
      return legendColors[3];
    }
    if(z < 90) {
      return legendColors[4];
    }
    return legendColors[5];
  }
  
  // Getting our GeoJSON data
  d3.json(link).then(function(data) {
  
    // Creating a GeoJSON layer with the retrieved data
    const geojson = L.geoJson(data,{
      pointToLayer: (feature, latlng) => {
        // console.log(feature);
        return L.circleMarker(latlng, {
          radius: feature.properties.mag*5,
          color: "black",
          weight: 1,
          fillOpacity: 1.0,
          fillColor: getColor(feature.geometry.coordinates[2]),
        }
      )},
      // Each point has a tooltip with the magnitude, location and depth
      onEachFeature: function(feature, layer) {
        layer.bindPopup(`
          Magnitude: ${feature.properties.mag}<br /><br />
          Location<br />
          &nbsp;&nbsp;Longitude: ${feature.geometry.coordinates[0]}<br />
          &nbsp;&nbsp;Latitude: ${feature.geometry.coordinates[1]}<br /><br />
          Depth: ${feature.geometry.coordinates[2]}
        `);
        }
    });
    console.log(geojson);
    geojson.addTo(myMap);
  
  
    // Set up the legend
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
      let div = L.DomUtil.create("div", "info legend");
      
      div.innerHTML = `<ul>${
        legendLabels.map(function(legendLabel, index) {
          return `<li><span class="legendBox" style="background-color: ${legendColors[index]}">&nbsp;</span>&nbsp;${legendLabel}</li>`;
        }).join("")
      }</ul>`;
      return div;
    };
  
    // Adding the legend to the map
    legend.addTo(myMap);
  
  });
  