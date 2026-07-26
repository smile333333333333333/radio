/* =========================================================
   H.E.E. RADIO
   effects.js
   Radio static, interference, and visual effects
   ========================================================= */

const radioElement = document.querySelector(".radio");
const staticElement = document.getElementById("staticOverlay");
const stationDisplay = document.getElementById("stationName");
const signalElement = document.getElementById("signal");

let effectTimer = null;
let lastSignalStrength = 0;


/* =========================================================
   SIGNAL EFFECT
   ========================================================= */

function setRadioSignal(strength) {

    lastSignalStrength = strength;

    if (!staticElement) return;

    if (strength <= 0) {

        staticElement.classList.add("active");

        if (signalElement) {
            signalElement.textContent = "░░░░░░░░░░";
        }

        return;
    }


    staticElement.classList.remove("active");


    if (strength < 0.25) {

        signalElement.textContent =
            "██░░░░░░░░";

    } else if (strength < 0.5) {

        signalElement.textContent =
            "████░░░░░░";

    } else if (strength < 0.75) {

        signalElement.textContent =
            "███████░░░";

    } else {

        signalElement.textContent =
            "██████████";

    }

}


/* =========================================================
   STATIC BURST
   ========================================================= */

function staticBurst(duration = 250) {

    if (!staticElement) return;

    staticElement.classList.add("active");

    setTimeout(() => {

        if (lastSignalStrength > 0) {
            staticElement.classList.remove("active");
        }

    }, duration);

}


/* =========================================================
   RADIO GLITCH
   ========================================================= */

function radioGlitch(duration = 150) {

    if (!radioElement) return;

    radioElement.classList.add("glitch");

    setTimeout(() => {

        radioElement.classList.remove("glitch");

    }, duration);

}


/* =========================================================
   RANDOM INTERFERENCE
   ========================================================= */

function randomInterference() {

    if (!window.radioOn) return;

    const chance = Math.random();

    if (chance < 0.08) {

        staticBurst(
            Math.floor(Math.random() * 250) + 100
        );

        radioGlitch(
            Math.floor(Math.random() * 150) + 50
        );

    }

}


/* =========================================================
   START EFFECT LOOP
   ========================================================= */

function startRadioEffects() {

    if (effectTimer) {
        clearInterval(effectTimer);
    }

    effectTimer = setInterval(() => {

        randomInterference();

    }, 3000);

}


/* =========================================================
   STOP EFFECT LOOP
   ========================================================= */

function stopRadioEffects() {

    if (effectTimer) {

        clearInterval(effectTimer);

        effectTimer = null;

    }

    if (staticElement) {
        staticElement.classList.remove("active");
    }

}


/* =========================================================
   TUNING STATIC
   ========================================================= */

if (typeof tuningDial !== "undefined") {

    tuningDial.addEventListener("input", () => {

        if (
            typeof radioOn !== "undefined" &&
            radioOn === true
        ) {

            staticBurst(80);

        }

    });

}


/* =========================================================
   START
   ========================================================= */

startRadioEffects();
