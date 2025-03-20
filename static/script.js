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



document.getElementById("login-button").addEventListener("click",toSuS);
document.getElementById("home-button").addEventListener("click",toSuS);
document.getElementById("start-training-button").addEventListener("click",toTraining);
const destinations = document.getElementsByClassName("destination");

// Loop through each element and add an event listener
for (let i = 0; i < destinations.length; i++) {
    destinations[i].addEventListener("click", toTenses);
}

