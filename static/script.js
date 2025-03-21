function toSuS() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    document.getElementById('tense-selection-container').classList.add('hidden');
    document.getElementById('gap-text-container').classList.add('hidden');
}

function toTenses() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('tense-selection-container').classList.remove('hidden');
    document.getElementById('gap-text-container').classList.add('hidden');
}

function toTraining() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('tense-selection-container').classList.add('hidden');
    document.getElementById('gap-text-container').classList.remove('hidden');

}

function toLP() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('tense-selection-container').classList.add('hidden');
    document.getElementById('gap-text-container').classList.add('hidden');
    document.getElementById('LP-view').classList.remove('hidden');

}
function toCreate() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById('tense-selection-container').classList.add('hidden');
    document.getElementById('gap-text-container').classList.add('hidden');
    document.getElementById('LP-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.remove('hidden');
}



document.getElementById("login-button").addEventListener("click", function () {
    let username = document.querySelector(".input-field[type='text']").value; // Get the input value

    if (username.includes("l")) {
        toLP();  // Execute toLP() if "l" is present
    } else if (username.includes("s")) {
        toSuS(); // Execute toSuS() if "s" is present
    } else {
        console.log("No valid character found!"); // Optional: Handle other cases
    }
});
document.getElementById("home-button").addEventListener("click",toSuS);
document.getElementById("start-training-button").addEventListener("click",toTraining);
document.getElementById("new-unit").addEventListener("click",toCreate);
const destinations = document.getElementsByClassName("destination");

// Loop through each element and add an event listener
for (let i = 0; i < destinations.length; i++) {
    destinations[i].addEventListener("click", toTenses);
}

