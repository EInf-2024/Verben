function toSuS() {
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.remove('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.add('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');
}

function toTenses() {
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.add('hidden');
    document.getElementById('tense-selection-view').classList.remove('hidden');
    document.getElementById('exercise-view').classList.add('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');
}

function toExercise() {
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.add('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.remove('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');

}

function toLP() {
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.add('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.add('hidden');
    document.getElementById('lp-view').classList.remove('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');

}
function toCreate() {
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.add('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.add('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.remove('hidden');
}
/*

All the functions for switching between different views.
//
 */


document.getElementById("login-button").addEventListener("click", function () {
    let username = document.querySelector(".input-field[type='text']").value; // Get the input value
    if (username.includes("l")) {
        toLP();  // Execute toLP() if "l" is present
    } else if (username.includes("s")) {
        toSuS(); // Execute toSuS() if "s" is present
        const name = document.getElementById("username");
        name.innerHTML = `${username}`
        const container = document.getElementById("sus-right");
        for (let i = 0; i < 3; i++){
                const unit_field = document.createElement('div');
                unit_field.textContent = `Unit${i+1}`
                unit_field.setAttribute("data_id", `${i+1}`)
                unit_field.classList.add('unit-field')
                container.appendChild(unit_field)
            }
    } else {
        console.log("No valid character found!"); // Optional: Handle other cases
    }
});


document.getElementById("home-button").addEventListener("click",toSuS);
document.getElementById("start-training-button").addEventListener("click",toExercise);
document.getElementById("new-unit").addEventListener("click",toCreate);
const destinations = document.getElementsByClassName("destination");

// Loop through each element and add an event listener
for (let i = 0; i < destinations.length; i++) {
    destinations[i].addEventListener("click", toTenses);
}

