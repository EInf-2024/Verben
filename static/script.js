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
        for (let i = 0; i < 10; i++){
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

document.getElementById("sus-right").addEventListener("click",function (event) {
    if (event.target.tagName === "DIV") {
        const objectId = event.target.getAttribute("data_id");
        toTenses()
        document.getElementById('nav-unit-name').textContent = `Unit${objectId}`
    }
});



document.getElementById("start-training-button").addEventListener("click",function (){
    document.getElementById('exercise-view').innerHTML = ``
    for (let i = 0; i < 5; i++){
        // Create the main div
    const sentence = document.createElement('div');
    sentence.classList.add('gap-sentence');
    sentence.innerHTML = 'Tu <input type="text" class="gap-input" data-answer="étais"> en retard ce matin.';
    document.getElementById('exercise-view').appendChild(sentence);
    toExercise()

    }

});

document.getElementById("check-answers-button").addEventListener("click",function (){
    const sentences = document.querySelectorAll('.gap-sentence');
    sentences.forEach(sentence => {
        const input = sentence.querySelector('.gap-input');
        const correctAnswer = input.getAttribute('data-answer');
        if (input.value === correctAnswer) {
            sentence.querySelector('.gap-input').classList.add('green-text')
        }
        else{
            sentence.querySelector('.gap-input').classList.add('red-text');
        }
        console.log(input.value === correctAnswer);
    });



});







document.getElementById("home-button").addEventListener("click",toSuS);
document.getElementById("new-unit").addEventListener("click",toCreate);
const destinations = document.getElementsByClassName("destination");

// Loop through each element and add an event listener
for (let i = 0; i < destinations.length; i++) {
    destinations[i].addEventListener("click", toTenses);
}

