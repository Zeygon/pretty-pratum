var map;

$(document).ready(function() {
    $('.user-response .start').on('click', function() {
        $('.start-view').hide();
        mow();
    });
});

function mow() {
    $('.mowing-view').show();
    loadMap();
}

function loadMap() {
    map = L.map('map').setView([48.15765, 11.59190], 19);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZmFiaW9yaW5vIiwiYSI6ImNqaWgyamc1ejBhMTgzcXBtd3RncGZhcjMifQ.Hl3aEnoasoAJpbDdBCo-zQ'
    }).addTo(map);

    var polygon = L.polygon([
        [48.15730, 11.59140], // bottom left
        [48.15730, 11.59240], // top left
        [48.15830, 11.59240], // top right
        [48.15800, 11.59110], // bottom right
    ], {
        color: '#27ae60',
        fillColor: '#2ecc71',
        fillOpacity: 0.3
    }).addTo(map);
    
    GPSTracking();
}

function GPSTracking() {
    var currentPosition, currentAccuracy;
    
    function onLocationFound(e) {
        // If position defined, then remove the existing position marker and accuracy circle from the map
        if(currentPosition) {
            map.removeLayer(currentPosition);
            map.removeLayer(currentAccuracy);
        }

        var radius = e.accuracy / 2;

        currentPosition = L.marker(e.latlng).addTo(map);
        currentAccuracy = L.circle(e.latlng, radius).addTo(map);
    }

    map.on('locationfound', onLocationFound);

    function onLocationError(e) {
        alert(e.message);
    }
    
    map.on('locationerror', onLocationError);
    
    setInterval(function() {
        map.locate({setView: true, maxZoom: 19});
    }, 3000);
}