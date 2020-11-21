var res = [];
var marker = L.marker([0, 0]);
var sindex;
var lindex;
async function getData() {
    document.getElementById("stateu").style.display = "none";
    document.getElementById("statebtn").style.display = "none";
    document.getElementById("o0").selected = true;
    document.getElementById("results").innerHTML = '<tr>    <th>Nombre del conjunto</th>    <th>Estado</th> </tr>';
    const response = await fetch('/entidad/data');
    const data = await response.json();
    var index = 0;
    data.forEach((don_i) => {
        var res_i = document.createElement("tr");
        if (don_i.idestado == 1 || don_i.idestado == 2) {
            res.push(don_i);
            res_i.id = `r${index}`
            res_i.style.cursor = "pointer";
            res_i.value = index;
            let s_i = index;
            res_i.onclick = () => { res_indexing(s_i) };
            index++;
        }
        res_i.innerHTML = `<td>${don_i.conjunto}</td> <td>${getState(don_i.idestado)}</td>`;
        document.getElementById("results").appendChild(res_i);
    });
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
}

function res_indexing(index) {
    var newCoord = res[index].ubicacion.split(",");
    newCoord = { lat: parseFloat(newCoord[0]), lng: parseFloat(newCoord[1]) };
    initializeMap(newCoord);
    try {
        document.getElementById(`r${lindex}`).style.backgroundColor = '';
    } catch (e) {}
    document.getElementById(`r${index}`).style.backgroundColor = 'rgba(148, 40, 37, 0.6)';
    lindex = index;
    document.getElementById("stateu").style.display = "block";
    if (res[index].idestado == 1) {
        document.getElementById("or").disabled = false;
        document.getElementById("oe").disabled = true;
    }
    if (res[index].idestado == 2) {
        document.getElementById("oe").disabled = false;
        document.getElementById("or").disabled = true;
    }
    if (res[index].idestado == 3) {
        document.getElementById("oe").disabled = true;
        document.getElementById("or").disabled = true;
    }
    sindex = index;
}

function updateS() {
    if (document.getElementById("stateu").value != 0) {
        document.getElementById("statebtn").style.display = "block";
    }
}

async function changeS() {
    await fetch(`/entidad/updatestate/${res[sindex].iddonaciones}/${document.getElementById("stateu").value}`);
    location.reload();
}

function initializeMap(lat_lng) {
    // document.getElementById("map").style.display = "block";
    try {
        map = L.map('map', { zoomControl: false }).setView([lat_lng.lat, lat_lng.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap Contributors </a>',
            maxZoom: 18,
            minZoom: 4
        }).addTo(map);
    } catch (e) {}
    marker.setLatLng(lat_lng).addTo(map);
}