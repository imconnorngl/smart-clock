// Poll previous weather and time
let weather = getData("weather") || {}
let time = getData("time") || {}

// Setup Weather, Temperature, Date and Time on screen
document.querySelector('#tempText').innerHTML = `<img id="weatherIcon">${weather.temperature || 0}&deg;`
document.querySelector('#weatherIcon').src = `img/icons/${weather.weather || "113"}.png`
document.querySelector('#time').innerHTML = time.time || "00:00:00"
document.querySelector('#date').innerHTML = time.date || "1st January 2020"

// Setup Polling of Time
setInterval(() => getTimeDate(), 1000)
getTimeDate()

// Setup Polling of Temp
setInterval(() => getTemp, 5.4e+6)
getTemp()

// Setup Alarm Settings GUI
document.getElementById("alarmHours").innerHTML = (getData("alarm") || {}).time ? getData("alarm").time.split(":")[0] : "00"
document.getElementById("alarmMinutes").innerHTML = (getData("alarm") || {}).time ? getData("alarm").time.split(":")[1] : "00"
document.getElementById("alarmMinutes").classList.toggle("Time-Selected");
selectTime(`alarmHours`)

// Setup System Tray
document.getElementById("alarmActiveIcon").innerHTML = (getData("alarm") || {}).time ? `&#9835;` : ``
document.getElementById("alarmActiveText").innerHTML = (getData("alarm") || {}).time ? `${getData("alarm").time}` : ``

// Database
function setData(itemName, itemValue) {
    let databaseString = localStorage.getItem("local-db");
    let databaseObject = databaseString ? JSON.parse(databaseString) : {};
    databaseObject[itemName] = itemValue;
    localStorage.setItem("local-db", JSON.stringify(databaseObject));
    return itemValue;
}

function getData(itemName) {
    let databaseString = localStorage.getItem("local-db");
    let databaseObject = databaseString ? JSON.parse(localStorage.getItem("local-db")) : {};
    return databaseObject[itemName];
}

// Ripple 
document.getElementById("ripple").addEventListener('animationend', () => document.getElementById("ripple").classList.remove('active'));
function startRipple() {
    var ripple = document.getElementById("ripple")
    var posX = window.event.clientX;
    var posY = window.event.clientY;

    ripple.style.top = posY - 30
    ripple.style.left = posX - 30
    ripple.classList.add('active');
}

// Temperature, Date and Time
function dateOrdinal(date) {
    var end = date % 10
    var ordinal = (1 == end ? "st" : 2 == end ? "nd" : 3 == end ? "rd" : "th")
    return `${date}${ordinal}`
}

function getTimeDate() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var date = new Date()
    var alarm = (getData("alarm") || {}).time || ""
    if (alarm) if (`${alarm}:00` == date.toLocaleTimeString()) {
        var mode = getData("alarmMode") ? getData("alarmMode") : {}
        if (mode.mode == 1 && (mode.set ? new Date(mode.set).toDateString() : "") == date.toDateString()) startAlarm()
        if (mode.mode == 2 && (date.getDay() > 5 || date.getDay() < 1)) startAlarm()
        if (mode.mode == 5 && date.getDay() > 0 && date.getDay() < 6) startAlarm()
        if (mode.mode == 7) startAlarm()
    }

    document.querySelector('#time').innerHTML = date.toLocaleTimeString()
    document.querySelector('#date').innerHTML = `${dateOrdinal(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}`
    setData("time", { time: date.toLocaleTimeString(), date: `${dateOrdinal(date.getDate())} ${months[date.getMonth()]} ${date.getFullYear()}` });
}


async function getTemp() {
    try {
        var locationData = await fetch("http://ipinfo.io/json")
        var locationResponse = await locationData.json()
        var weatherData = await fetch(`http://api.weatherstack.com/current?access_key=<APIKEY>&query=${encodeURI(locationResponse.city)}`)
        var weatherResponse = await weatherData.json()
        setData("weather", { temperature: weatherResponse.current.temperature, weather: weatherResponse.current.weather_code });
        document.querySelector('#tempText').innerHTML = `<img id="weatherIcon">${weatherResponse.current.temperature || 0}&deg;`
        document.querySelector('#weatherIcon').src = `img/icons/${weatherResponse.current.weather_code || "113"}.png`
    } catch {
        console.error(`ERROR: Couldn't update temperature`)
    }
}

// Menu
function menuSwitch() {
    document.getElementById("menuSwitch").classList.toggle("change");
    document.getElementById("menu").classList.toggle("showMenu");
}


// Alarm 
function startAlarm() {
    document.getElementById("snooze").classList.toggle("showSnooze");
    var audio = document.getElementById("alarmAudio");
    audio.currentTime = 0;
    audio.play();
}

function stopAlarm() {
    document.getElementById("snooze").classList.toggle("showSnooze");
    var audio = document.getElementById("alarmAudio");
    audio.pause();
}

function snoozeAlarm() {
    document.getElementById("snooze").classList.toggle("showSnooze");
    var audio = document.getElementById("alarmAudio");
    audio.pause();
    setTimeout(() => startAlarm(), 10000);
}

function selectTime(type) {
    setData(`selectedTime`, type)
    document.getElementById("alarmHours").classList.toggle("Time-Selected");
    document.getElementById("alarmMinutes").classList.toggle("Time-Selected");
}

function IncrementTime() {
    var type = getData(`selectedTime`)
    var max = { alarmHours: 23, alarmMinutes: 59 }[type]
    var alarmHours = Number(document.getElementById(type).innerHTML)
    alarmHours++
    if (alarmHours > max) var alarmHours = 0
    document.getElementById(type).innerHTML = (alarmHours < 10 ? '0' : '') + alarmHours;
}

function DecrementTime() {
    var type = getData(`selectedTime`)
    var max = { alarmHours: 23, alarmMinutes: 59 }[type]
    var alarmTime = Number(document.getElementById(type).innerHTML)
    alarmTime--
    if (alarmTime < 0) var alarmTime = max
    document.getElementById(type).innerHTML = (alarmTime < 10 ? '0' : '') + alarmTime
}

function saveAlarm() {
    var alarmHours = document.getElementById("alarmHours").innerHTML
    var alarmMinutes = document.getElementById("alarmMinutes").innerHTML
    var mode = document.getElementById("alarmMode").value
    setData("alarmMode", { mode: mode, set: new Date() })
    setData("alarm", { time: `${alarmHours}:${alarmMinutes}` })
    menuSwitch()
    document.getElementById("alarmActiveIcon").innerHTML = getData("alarm").time ? `&#9835;` : ``
    document.getElementById("alarmActiveText").innerHTML = getData("alarm").time ? `${getData("alarm").time}` : ``
}

function resetAlarm() {
    setData("alarm", {})
    document.getElementById("alarmHours").innerHTML = "00"
    document.getElementById("alarmMinutes").innerHTML = "00"
    document.getElementById("alarmActiveIcon").innerHTML = getData("alarm").time ? `&#9835;` : ``
    document.getElementById("alarmActiveText").innerHTML = getData("alarm").time ? `${getData("alarm").time}` : ``
}
