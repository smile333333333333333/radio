/* =========================================================
   H.E.E. EMPLOYEE RADIO
   script.js
   ========================================================= */

const radio = document.querySelector(".radio");
const tuningDial = document.getElementById("tuningDial");
const frequencyDisplay = document.getElementById("frequency");
const stationName = document.getElementById("stationName");
const signalDisplay = document.getElementById("signal");

const powerButton = document.getElementById("powerButton");
const scanButton = document.getElementById("scanButton");
const volumeSlider = document.getElementById("volume");

const powerLight = document.getElementById("powerLight");
const radioAudio = document.getElementById("radioAudio");

const staticOverlay = document.getElementById("staticOverlay");
const warning = document.getElementById("warning");


/* =========================================================
   SETTINGS
   ========================================================= */

let radioOn = false;
let currentFrequency = 88.0;
let currentStation = null;
let stations = [];
let scanTimer = null;
let scanRunning = false;

const TUNING_RANGE = 0.08;


/* =========================================================
   FREQUENCY
   ========================================================= */

function getFrequency() {
    return Number(tuningDial.value) / 10;
}


function updateFrequency() {

    currentFrequency = getFrequency();

    frequencyDisplay.textContent =
        currentFrequency.toFixed(1);

    updateSignal();
    checkStation();
}


/* =========================================================
   SIGNAL
   ========================================================= */

function updateSignal() {

    if (!radioOn) {

        signalDisplay.textContent = "----------";
        return;

    }

    let strongestSignal = 0;

    for (const station of stations) {

        const distance =
            Math.abs(currentFrequency - station.frequency);

        if (distance <= TUNING_RANGE) {

            const strength =
                1 - distance / TUNING_RANGE;

            strongestSignal =
                Math.max(strongestSignal, strength);
        }
    }


    if (strongestSignal <= 0) {

        signalDisplay.textContent =
            "░░░░░░░░░░";

    } else if (strongestSignal < 0.25) {

        signalDisplay.textContent =
            "██░░░░░░░░";

    } else if (strongestSignal < 0.5) {

        signalDisplay.textContent =
            "████░░░░░░";

    } else if (strongestSignal < 0.75) {

        signalDisplay.textContent =
            "███████░░░";

    } else {

        signalDisplay.textContent =
            "██████████";

    }
}


/* =========================================================
   FIND STATION
   ========================================================= */

function checkStation() {

    if (!radioOn) return;

    let closestStation = null;
    let closestDistance = Infinity;

    for (const station of stations) {

        const distance =
            Math.abs(currentFrequency - station.frequency);

        if (
            distance <= TUNING_RANGE &&
            distance < closestDistance
        ) {

            closestDistance = distance;
            closestStation = station;
        }
    }


    if (closestStation) {

        tuneToStation(
            closestStation,
            closestDistance
        );

    } else {

        loseStation();
    }
}


/* =========================================================
   TUNE TO STATION
   ========================================================= */

function tuneToStation(station, distance) {

    if (currentStation === station) {
        return;
    }

    stopAudio();

    currentStation = station;

    stationName.textContent =
        station.name;

    playStation(station);
}


/* =========================================================
   PLAY A SECTION OF AN AUDIO FILE
   ========================================================= */

function playStation(station) {

    if (!station.file) {

        stationName.textContent =
            station.name + " — NO AUDIO";

        return;
    }


    radioAudio.src = station.file;

    radioAudio.volume =
        Number(volumeSlider.value);


    /*
       Jump to the beginning of this recording
       inside audio1.mp3 or audio2.mp3.
    */

    radioAudio.currentTime =
        station.start;


    radioAudio.play().catch(() => {
        console.log("Waiting for audio permission.");
    });
}


/* =========================================================
   STOP AUDIO
   ========================================================= */

function stopAudio() {

    radioAudio.pause();

    radioAudio.currentTime = 0;
}


/* =========================================================
   AUDIO END POSITION
   ========================================================= */

radioAudio.addEventListener(
    "timeupdate",
    function () {

        if (!currentStation) return;

        if (
            currentStation.end &&
            radioAudio.currentTime >=
            currentStation.end
        ) {

            /*
               Recording has reached the end of its
               section inside the combined MP3.
            */

            radioAudio.pause();

            radioAudio.currentTime =
                currentStation.start;

        }
    }
);


/* =========================================================
   LOSE STATION
   ========================================================= */

function loseStation() {

    if (currentStation !== null) {

        stopAudio();

        currentStation = null;
    }

    stationName.textContent =
        "NO SIGNAL";
}


/* =========================================================
   POWER
   ========================================================= */

function togglePower() {

    radioOn = !radioOn;


    if (radioOn) {

        radio.classList.remove("off");

        powerLight.classList.add("on");

        powerButton.classList.add("active");

        powerButton.textContent =
            "POWER ON";

        warning.classList.remove("visible");

        updateFrequency();

    } else {

        radio.classList.add("off");

        powerLight.classList.remove("on");

        powerButton.classList.remove("active");

        powerButton.textContent =
            "POWER";

        stopAudio();

        currentStation = null;

        stationName.textContent =
            "RADIO OFF";

        signalDisplay.textContent =
            "----------";

        staticOverlay.classList.remove("active");

        stopScan();
    }
}


/* =========================================================
   VOLUME
   ========================================================= */

function updateVolume() {

    radioAudio.volume =
        Number(volumeSlider.value);
}


/* =========================================================
   SCAN
   ========================================================= */

function startScan() {

    if (!radioOn) return;


    if (scanRunning) {

        stopScan();
        return;
    }


    scanRunning = true;

    scanButton.textContent =
        "STOP SCAN";


    let frequency =
        getFrequency();


    scanTimer = setInterval(() => {

        frequency += 0.1;


        if (frequency > 108.0) {
            frequency = 88.0;
        }


        tuningDial.value =
            Math.round(frequency * 10);

        updateFrequency();

    }, 70);
}


function stopScan() {

    scanRunning = false;

    scanButton.textContent =
        "SCAN";


    if (scanTimer) {

        clearInterval(scanTimer);

        scanTimer = null;
    }
}


/* =========================================================
   CONTROLS
   ========================================================= */

tuningDial.addEventListener(
    "input",
    updateFrequency
);

powerButton.addEventListener(
    "click",
    togglePower
);

scanButton.addEventListener(
    "click",
    startScan
);

volumeSlider.addEventListener(
    "input",
    updateVolume
);


/* =========================================================
   KEYBOARD TUNING
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (!radioOn) return;


        let value =
            Number(tuningDial.value);


        if (event.key === "ArrowRight") {
            value += 1;
        }

        if (event.key === "ArrowLeft") {
            value -= 1;
        }

        if (event.key === "ArrowUp") {
            value += 5;
        }

        if (event.key === "ArrowDown") {
            value -= 5;
        }


        value =
            Math.max(
                880,
                Math.min(1080, value)
            );


        tuningDial.value =
            value;

        updateFrequency();
    }
);


/* =========================================================
   LOAD STATIONS
   ========================================================= */

async function loadStations() {

    try {

        const response =
            await fetch("stations.txt");


        if (!response.ok) {
            throw new Error(
                "stations.txt could not be loaded."
            );
        }


        const text =
            await response.text();


        parseStations(text);

    } catch (error) {

        console.error(error);

        stationName.textContent =
            "STATION LIST ERROR";
    }
}


/* =========================================================
   PARSE STATIONS
   ========================================================= */

/*
   New format:

   frequency|name|audio file|start|end

   Example:

   92.1|STACY'S MOM|audio1.mp3|11.448|210.840
*/

function parseStations(text) {

    stations = [];


    const lines =
        text.split(/\r?\n/);


    for (const line of lines) {

        const trimmed =
            line.trim();


        if (!trimmed) continue;

        if (trimmed.startsWith("#")) {
            continue;
        }


        const parts =
            trimmed.split("|");


        if (parts.length < 5) {
            continue;
        }


        const frequency =
            Number(parts[0]);


        const name =
            parts[1].trim();


        const file =
            parts[2].trim();


        const start =
            Number(parts[3]);


        const end =
            Number(parts[4]);


        if (
            Number.isNaN(frequency) ||
            Number.isNaN(start) ||
            Number.isNaN(end)
        ) {

            continue;
        }


        stations.push({

            frequency: frequency,

            name: name,

            file: file,

            start: start,

            end: end

        });
    }


    updateFrequency();
}


/* =========================================================
   INITIAL STATE
   ========================================================= */

radio.classList.add("off");

frequencyDisplay.textContent =
    "88.0";

stationName.textContent =
    "RADIO OFF";

signalDisplay.textContent =
    "----------";


/* =========================================================
   START
   ========================================================= */

loadStations();
