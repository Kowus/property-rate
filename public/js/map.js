/*
 * property-rate ==> map
 * Created By barnabasnomo on 2/13/18 at 6:54 PM
 * @soundtrack Know Yourself - Drake
*/

const mapStyle = [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 33
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2e5d4"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5dac6"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5c6c6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e4d7c6"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fbfaf7"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#acbcc9"
            }
        ]
    }
];

// Escapes HTML characters in a template literal string, to prevent XSS.
// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
function sanitizeHTML(strings) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
    let result = strings[0];
    for (let i = 1; i < arguments.length; i++) {
        result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
            return entities[char];
        });
        result += strings[i];
    }
    return result;
}

function initMap() {
let json_payload = document.getElementById('mapuzzy').getAttribute('data-user-props');

    // Create the map.
    const map = new google.maps.Map(document.getElementsByClassName('mapuzzy')[0], {
        zoom: 13,
        center: {lat: 6.083333, lng: -0.250000},
        styles: mapStyle
    });

    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson('/geoJson?user='+document.getElementById('mapuzzy').getAttribute('data-user-id'));

    // Define the custom marker icons, using the store's "category".
    map.data.setStyle(feature => {
        return {
            icon: {
                url: `/images/icon_${feature.getProperty('category')}.png`,
                // url: '/images/1.jpg',
                scaledSize: new google.maps.Size(64, 64)
            }
        };
    });

    const apiKey = 'AIzaSyCS8YsRX1ZDf6gJezMV0UQuCkHr7oc-UGw';
    const infoWindow = new google.maps.InfoWindow();
    infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

    // Show the information for a store when its marker is clicked.
    map.data.addListener('click', event => {

        const category = event.feature.getProperty('category');
        const name = event.feature.getProperty('name');
        const description = event.feature.getProperty('description');
        const area = event.feature.getProperty('area');
        const san_code= event.feature.getProperty('sanitation_code');
        const use_code= event.feature.getProperty('use_code');
        const position = event.feature.getGeometry().get();
        const content = sanitizeHTML`
      <img style="float:left; width:200px; margin-top:30px" src="/images/logo_${category}.png">
      <div style="margin-left:220px; margin-bottom:20px;">
        <h2>${name}</h2><p>${description}</p>
        <p><b>Area: </b>${area}</p>
        <p><b>Use Code Class: </b>${use_code}</p>
        <p><b>Sanitation Class: </b>${san_code}</p>
        <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
      </div>
    `;

        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.open(map);
    });

}