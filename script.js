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
   RADIO SETTINGS
   ========================================================= */

let radioOn = false;

let currentFrequency = 88.0;

let currentStation = null;

let currentAudio = null;

let stations = [];

let scanTimer = null;

let scanRunning = false;


/*
   How close the player needs to be to a station.

   Example:
   Station = 94.5
   Player = 94.50

   Perfect signal.

   Player = 94.55

   Still close enough to hear it.
*/

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
   SIGNAL STRENGTH
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
                1 - (distance / TUNING_RANGE);

            if (strength > strongestSignal) {
                strongestSignal = strength;
            }

        }

    }


    if (strongestSignal <= 0) {

        signalDisplay.textContent =
            "░░░░░░░░░░";

        return;
    }


    if (strongestSignal < 0.25) {

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
   STATION CHECK
   ========================================================= */

function checkStation() {

    if (!radioOn) {
        return;
    }


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

        tuneToStation(closestStation, closestDistance);

    } else {

        loseStation();

    }

}


/* =========================================================
   TUNE TO STATION
   ========================================================= */

function tuneToStation(station, distance) {

    if (currentStation === station) {

        stationName.textContent =
            station.name;

        return;
    }


    stopCurrentAudio();


    currentStation = station;

    stationName.textContent =
        station.name;


    if (!station.audio) {

        return;
    }


    playStationAudio(station, distance);

}


/* =========================================================
   PLAY STATION
   ========================================================= */

function playStationAudio(station, distance) {

    /*
       Audio files will be supplied by audio1.js
       and audio2.js later.

       The station object will contain an audio
       reference that points to one of those files.
    */

    let audioSource = getAudioSource(station.audio);


    if (!audioSource) {

        stationName.textContent =
            station.name + " — NO AUDIO";

        return;
    }


    currentAudio = new Audio();

    currentAudio.src = audioSource;

    currentAudio.volume =
        Number(volumeSlider.value);

    currentAudio.loop =
        station.loop === true;


    currentAudio.play().catch(() => {

        /*
           Browsers may block audio until the user
           interacts with the page.

           The power button already counts as
           user interaction.
        */

    });


    radioAudio.src = audioSource;

    radioAudio.volume =
        Number(volumeSlider.value);

}


/* =========================================================
   AUDIO SOURCE FINDER
   ========================================================= */

function getAudioSource(audioName) {

    if (!audioName) {
        return null;
    }


    /*
       audio1.js and audio2.js will create a global
       AUDIO_LIBRARY object.

       Example:

       AUDIO_LIBRARY = {
           "tape1": "data:audio/mp3;base64,..."
       }
    */

    if (
        typeof AUDIO_LIBRARY !== "undefined" &&
        AUDIO_LIBRARY[audioName]
    ) {

        return AUDIO_LIBRARY[audioName];

    }


    /*
       This also allows normal filenames later
       if we decide to use them.
    */

    if (
        typeof audioName === "string" &&
        (
            audioName.includes(".mp3") ||
            audioName.includes(".wav") ||
            audioName.includes(".ogg")
        )
    ) {

        return audioName;

    }


    return null;

}


/* =========================================================
   LOSE STATION
   ========================================================= */

function loseStation() {

    if (currentStation !== null) {

        stopCurrentAudio();

        currentStation = null;

    }


    stationName.textContent =
        "NO SIGNAL";

}


/* =========================================================
   STOP AUDIO
   ========================================================= */

function stopCurrentAudio() {

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        currentAudio = null;

    }


    radioAudio.pause();

    radioAudio.currentTime = 0;

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

        stopCurrentAudio();

        currentStation = null;

        stationName.textContent =
            "RADIO OFF";

        signalDisplay.textContent =
            "----------";

        staticOverlay.classList.remove("active");

    }

}


/* =========================================================
   VOLUME
   ========================================================= */

function updateVolume() {

    const volume =
        Number(volumeSlider.value);


    if (currentAudio) {
        currentAudio.volume = volume;
    }


    radioAudio.volume = volume;

}


/* =========================================================
   SCANNING
   ========================================================= */

function startScan() {

    if (!radioOn) {
        return;
    }


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
   TUNING EVENTS
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
    function(event) {

        if (!radioOn) {
            return;
        }


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
                Math.min(
                    1080,
                    value
                )
            );


        tuningDial.value =
            value;


        updateFrequency();

    }
);


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
   STATION LOADER
   ========================================================= */

/*
   stations.txt will be loaded when we create that file.

   This function is intentionally separate so the
   station system stays easy to modify.
*/

async function loadStations() {

    try {

        const response =
            await fetch("stations.txt");


        if (!response.ok) {
            throw new Error("stations.txt not found");
        }


        const text =
            await response.text();


        parseStations(text);


    } catch (error) {

        console.warn(
            "Station list could not be loaded yet."
        );

    }

}


/* =========================================================
   STATION LIST PARSER
   ========================================================= */

function parseStations(text) {

    stations = [];


    const lines =
        text.split(/\r?\n/);


    for (const line of lines) {

        const trimmed =
            line.trim();


        if (!trimmed) {
            continue;
        }


        if (trimmed.startsWith("#")) {
            continue;
        }


        const parts =
            trimmed.split("|");


        if (parts.length < 3) {
            continue;
        }


        const frequency =
            Number(parts[0]);


        const name =
            parts[1].trim();


        const audio =
            parts[2].trim();


        if (Number.isNaN(frequency)) {
            continue;
        }


        stations.push({

            frequency: frequency,

            name: name,

            audio: audio,

            loop: false

        });

    }


    updateFrequency();

}


/* =========================================================
   START
   ========================================================= */

loadStations();
