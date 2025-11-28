//----------------------------------------------
// MAP INITIALIZATION
//----------------------------------------------
const map = L.map("map").setView([14.5995, 120.9842], 13); // Manila default

// Light tiles
const lightTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19
}).addTo(map);

// Dark tiles
const darkTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
    maxZoom: 19
});

let markers = []; // store pins
let darkMode = localStorage.getItem("darkMode") === "enabled";

//----------------------------------------------
// APPLY DARK MODE ON LOAD
//----------------------------------------------
applyMode();

//----------------------------------------------
// DARK MODE TOGGLE BUTTON
//----------------------------------------------
document.getElementById("darkModeBtn").onclick = () => {
    darkMode = !darkMode;
    localStorage.setItem("darkMode", darkMode ? "enabled" : "disabled");
    applyMode();
};

function applyMode() {
    if (darkMode) {
        document.body.classList.add("dark-mode");
        map.removeLayer(lightTiles);
        darkTiles.addTo(map);
        document.getElementById("darkModeBtn").textContent = "☀️";
    } else {
        document.body.classList.remove("dark-mode");
        map.removeLayer(darkTiles);
        lightTiles.addTo(map);
        document.getElementById("darkModeBtn").textContent = "🌙";
    }
}

//----------------------------------------------
// CLICK ON MAP TO ADD A PIN
//----------------------------------------------
map.on("click", function (e) {
    let lat = e.latlng.lat;
    let lng = e.latlng.lng;

    openTaskPopup(lat, lng);
});

//----------------------------------------------
// CREATE POPUP WITH INPUT FIELDS
//----------------------------------------------
function openTaskPopup(lat, lng) {
    let popupContent = `
        <div>
            <label>Task:</label>
            <input id="taskTitle" placeholder="Task name">

            <label>Description:</label>
            <textarea id="taskDesc" placeholder="Details"></textarea>

            <label>Priority:</label>
            <select id="taskPriority">
                <option value="blue">Normal</option>
                <option value="green">Low</option>
                <option value="yellow">Medium</option>
                <option value="red">High</option>
            </select>

            <button onclick="saveTask(${lat}, ${lng})">Save Task</button>
        </div>
    `;

    L.popup()
        .setLatLng([lat, lng])
        .setContent(popupContent)
        .openOn(map);
}

//----------------------------------------------
// SAVE TASK + CREATE PIN
//----------------------------------------------
window.saveTask = function (lat, lng) {
    let title = document.getElementById("taskTitle").value;
    let desc = document.getElementById("taskDesc").value;
    let priority = document.getElementById("taskPriority").value;

    if (!title.trim()) {
        alert("Task title required!");
        return;
    }

    let marker = L.marker([lat, lng], {
        icon: L.icon({
            iconUrl: getMarkerColor(priority),
            iconSize: [30, 40],
            iconAnchor: [15, 40]
        })
    }).addTo(map);

    marker.bindPopup(`
        <b>${title}</b><br>
        ${desc}<br><br>
        <button onclick="deleteTask(${markers.length})">Delete</button>
    `);

    markers.push(marker);

    addTaskToSidebar(title, desc, priority);
    map.closePopup();
};

//----------------------------------------------
// SIDEBAR LIST
//----------------------------------------------
function addTaskToSidebar(title, desc, priority) {
    let div = document.createElement("div");
    div.className = "task-item";
    div.style.borderLeftColor = priority;
    div.innerHTML = `<b>${title}</b><br>${desc}`;
    document.getElementById("taskList").appendChild(div);
}

//----------------------------------------------
// DELETE PIN
//----------------------------------------------
window.deleteTask = function (index) {
    if (markers[index]) {
        map.removeLayer(markers[index]);
        markers[index] = null;
    }
};

//----------------------------------------------
// MARKER COLORS
//----------------------------------------------
function getMarkerColor(priority) {
    return {
        red: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        yellow: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
        green: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        blue: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
    }[priority];
}
