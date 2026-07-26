/* =========================================================
   H.E.E. RADIO
   secrets.js
   Hidden frequencies and ARG events
   ========================================================= */

const SECRET_STATIONS = [

    {
        frequency: 90.9,
        name: "UNLISTED SIGNAL",
        message: "SIGNAL DETECTED",
        unlocked: false
    },

    {
        frequency: 97.7,
        name: "H.E.E. INTERNAL",
        message: "AUTHORIZED PERSONNEL ONLY",
        unlocked: false
    },

    {
        frequency: 103.3,
        name: "UNKNOWN SOURCE",
        message: "TRANSMISSION ACTIVE",
        unlocked: false
    },

    {
        frequency: 107.1,
        name: "████████████",
        message: "DO NOT LISTEN",
        unlocked: false
    }

];


/* =========================================================
   SECRET FREQUENCY CHECK
   ========================================================= */

function checkSecretFrequency(frequency) {

    for (const secret of SECRET_STATIONS) {

        const distance =
            Math.abs(frequency - secret.frequency);

        if (distance <= 0.04) {

            triggerSecretStation(secret);

            return true;
        }
    }

    return false;
}


/* =========================================================
   SECRET STATION
   ========================================================= */

function triggerSecretStation(secret) {

    if (!radioOn) return;

    stationName.textContent =
        secret.name;

    signalDisplay.textContent =
        "██████████";


    /*
       Visual interference makes secret stations
       feel different from normal stations.
    */

    if (typeof staticBurst === "function") {
        staticBurst(500);
    }

    if (typeof radioGlitch === "function") {
        radioGlitch(350);
    }


    /*
       Secret stations can eventually trigger
       audio, messages, clues, or other events.
    */

    if (secret.frequency === 107.1) {

        warning.textContent =
            "UNAUTHORIZED FREQUENCY";

        warning.classList.add("visible");

        setTimeout(() => {

            warning.classList.remove("visible");

        }, 2500);

    }

}


/* =========================================================
   CHECK TUNING
   ========================================================= */

if (typeof tuningDial !== "undefined") {

    tuningDial.addEventListener("input", () => {

        if (
            typeof radioOn !== "undefined" &&
            radioOn === true
        ) {

            checkSecretFrequency(
                Number(tuningDial.value) / 10
            );

        }

    });

}


/* =========================================================
   FUTURE ARG FUNCTIONS
   ========================================================= */

/*
   These are intentionally simple for now.

   Later we can make a recording unlock another
   frequency, require a specific tuning sequence,
   react to a code from another H.E.E. website,
   or hide messages inside the radio.
*/


function unlockSecretFrequency(frequency) {

    const secret =
        SECRET_STATIONS.find(
            station => station.frequency === frequency
        );

    if (secret) {

        secret.unlocked = true;

        console.log(
            "SECRET FREQUENCY UNLOCKED:",
            frequency
        );

    }

}


function isSecretUnlocked(frequency) {

    const secret =
        SECRET_STATIONS.find(
            station => station.frequency === frequency
        );

    return secret ? secret.unlocked : false;

}


/* =========================================================
   INITIALIZE
   ========================================================= */

console.log("H.E.E. RADIO SECRET SYSTEM ONLINE.");
