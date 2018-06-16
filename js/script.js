var map;
var score = 0;
var doneAreas = new Array();
var gardenCoords = [
    [48.26754, 11.66511],
    [48.26754, 11.66611],
    [48.26854, 11.66611],
    [48.26824, 11.66481],
];
var garden;

function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;
  
    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
  
    if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }
    else {
      cancelFullScreen.call(doc);
    }
  }

$(document).ready(function() {    
    $('.user-response .start').on('click', function() {
        $('.start-view').hide();
        toggleFullScreen();
        mow();
    });
});

function mow() {
    $('.mowing-view').show();
    loadMap();
}

function loadMap() {
    //map = L.map('map').setView([48.15765, 11.59190], 19);
    map = L.map('map', {zoomControl: false}).setView([48.26789, 11.66561], 19);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZmFiaW9yaW5vIiwiYSI6ImNqaWgyamc1ejBhMTgzcXBtd3RncGZhcjMifQ.Hl3aEnoasoAJpbDdBCo-zQ'
    }).addTo(map);

    garden = L.polygon(/*[
        // English garden Munich
        [48.15730, 11.59140], // bottom left
        [48.15730, 11.59240], // top left
        [48.15830, 11.59240], // top right
        [48.15800, 11.59110], // bottom right
    ]*/ gardenCoords, {
        color: '#27ae60',
        fillColor: '#2ecc71',
        fillOpacity: 0.3
    })

    garden.addTo(map);

    simulateOtherPeople();
    
    GPSTracking();
}

function GPSTracking() {
    var currentPosition, currentAccuracy;
    
    function onLocationFound(e) {
        if(currentPosition) {        
            map.removeLayer(currentPosition);
            map.removeLayer(currentAccuracy);
        }

        var radius = e.accuracy / 2;

        currentPosition = L.marker(e.latlng).addTo(map);
        currentAccuracy = L.circle(e.latlng, radius).addTo(map);

        checkDoneAreas(currentPosition);
        addDoneArea(currentPosition);
    }

    map.on('locationfound', onLocationFound);
    
    setInterval(function() {
        map.locate({setView: true, maxZoom: 19});
    }, 3000);
}

function checkDoneAreas(currentPosition) {
    if(!garden.getBounds().contains(currentPosition.getLatLng())) {
        return;
    }
    
    var hasScored = true;
    for(var i = 0; i < doneAreas.length; i++) {
        var a = doneAreas[i];
        if(a.getBounds().contains(currentPosition.getLatLng())) {
            hasScored = false;
            break;
        }
    }

    if(hasScored) {
        score += 5;
        updateScore();
    }
}

var oldPosition = null;
function addDoneArea(newPosition) {
    if(!newPosition) return;
    if(!oldPosition) {
        oldPosition = newPosition;
        return;
    }

    var diff = 0.00005;
    
    var horizontalMovement = true;
    if(Math.abs(oldPosition._latlng.lng - newPosition._latlng.lng) > Math.abs(oldPosition._latlng.lat - newPosition._latlng.lat)) {
      horizontalMovement = false;  
    }

    var pos = [];

    if(!horizontalMovement) {
        pos = [
            [newPosition._latlng.lat + diff, newPosition._latlng.lng],
            [newPosition._latlng.lat - diff, newPosition._latlng.lng],
            [oldPosition._latlng.lat - diff, oldPosition._latlng.lng],
            [oldPosition._latlng.lat + diff, oldPosition._latlng.lng],
        ];
    }
    else {
        pos = [
            [newPosition._latlng.lat, newPosition._latlng.lng - diff],
            [newPosition._latlng.lat, newPosition._latlng.lng + diff],
            [oldPosition._latlng.lat, oldPosition._latlng.lng + diff],
            [oldPosition._latlng.lat, oldPosition._latlng.lng - diff],
        ]
    }

    var doneArea = L.polygon(pos, {
        color: '#e74c3c',
        stroke: false,
        fillOpacity: 0.3
    })/*.addTo(map)*/;

    doneAreas.push(doneArea);

    L.polyline([
        [oldPosition._latlng.lat, oldPosition._latlng.lng],
        [newPosition._latlng.lat, newPosition._latlng.lng],
    ], {
        color: '#e74c3c',
    }).addTo(map);

    oldPosition = newPosition;
}

function updateScore() {
    var scoreWrapper = $('.score');
    
    scoreWrapper.show();
    scoreWrapper.animate({
        'top': 0,
    }, 300, function() {
       var currentScoreWrapper = scoreWrapper.find('.current-score');
        var currentScore = parseInt(currentScoreWrapper.text());

        var incScoreInterval = setInterval(function() {
            currentScoreWrapper.text(currentScore);
            if (currentScore >= score) {
                clearInterval(incScoreInterval);

                scoreWrapper.delay(2000).animate({
                    'top': -66,
                }, 300, function() {
                    scoreWrapper.hide();
                });

                return;
            }
            currentScore++;
        }, 30);
    });   
}

function simulateOtherPeople() {
    /*var pos = [
        [48.26784, 11.66491],
        [48.26754, 11.66611],
        [48.26834, 11.66611],
        [48.26804, 11.66481],
    ];*/

    var pos = [
        [48.26825, 11.66534],
        [48.26831, 11.66536],
        [48.26833, 11.66556],
        [48.26821, 11.66566],
    ];

    var doneArea = L.polygon(pos, {
        color: '#f1c40f',
        stroke: false,
        fillOpacity: 0.3
    }).addTo(map);

    doneAreas.push(doneArea);
}