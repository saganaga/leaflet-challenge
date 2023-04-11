// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const platesUrl = "data/PB2002_boundaries.json";

// Perform a GET request to the query URL/
const earthquakesPromise = d3.json(queryUrl);
const platesPromise = d3.json(platesUrl);

Promise.all([earthquakesPromise, platesPromise]).then(function(results){
  createFeatures(results[0], results[1]);
});
// .then(function (data) {
//   // Once we get a response, send the data.features object to the createFeatures function.
//   createFeatures(data.features);
// });

// d3.json(platesUrl).then(function (data) {
//   // Once we get a response, send the data.features object to the createFeatures function.
//   createPlatesOverlay(data.features);
// });

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
    
function createFeatures(earthquakeData, platesData) {
  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
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

  let plates = L.geoJSON(platesData, {
    attribution: 'from https://github.com/fraxen/tectonicplates under Open Data Commons Attribution License'
  })

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Create the base layers.
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var USGS_USImagery = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20,
    attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
  });

  // Create a baseMaps object.
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "USGS Imagery": USGS_USImagery
  };

  // Create an overlay object to hold our overlay.
  let overlayMaps = {
    Earthquakes: earthquakes,
    Plates: plates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [street, earthquakes, plates]
  });

  // Create a layer control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

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
}
