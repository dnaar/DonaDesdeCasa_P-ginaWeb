var map;
var popup = L.popup();
var res = [];
var markers = []

function initializeMap() {
    map = L.map('map').setView([10.9596, -74.79183], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap Contributors </a>',
        maxZoom: 18,
        minZoom: 4
    }).addTo(map);
    loadData();
}
async function loadData() {
    const response = await fetch(`/loc/data`);
    const data = await response.json();
    data.forEach((don_i, index) => {
        var newLatLng = don_i.ubicacion.split(',');
        newLatLng = { lat: parseFloat(newLatLng[0]), lng: parseFloat(newLatLng[1]) };
        var iconurl;
        if (don_i.idestado == 0 || don_i.idestado == 4) {
            iconurl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
        }
        if (don_i.idestado == 1) {
            iconurl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png';
        }
        if (don_i.idestado == 2) {
            iconurl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png';
        }
        if (don_i.idestado == 3) {
            iconurl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
        }
        const Icon_i = L.icon({
            iconUrl: iconurl,
            shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png'
        });
        res.push(don_i);
        let marker = new L.marker(newLatLng, { icon: Icon_i }).addTo(map);
        marker.addEventListener('click', () => showData(index));
        markers.push(marker);
    });
}

function showData(index) {
    const string = "Conjunto: " + res[index].conjunto + " | Estado: " + getState(res[index].idestado);
    popup
        .setLatLng(markers[index].getLatLng())
        .setContent(string)
        .openOn(map);
}

function getState(state) {
    if (state == 0) {
        return "Incompleta";
    }
    if (state == 1) {
        return "Completa";
    }
    if (state == 2) {
        return "Recogida";
    }
    if (state == 3) {
        return "Entregada";
    }
    if (state == 4) {
        return "No Iniciada";
    }
}
initializeMap();