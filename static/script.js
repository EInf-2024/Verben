let token = 0

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

function login (){
    const username = document.getElementById('input-name').value
    const password = document.getElementById('input-password').value
    fetch(`http://127.0.0.1:5000/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then(response => response.json())
        .then(data => {
            token = data.token
            if (data.role === 'S'){
                susView()
            }
        })
        .catch(error => console.error('Fehler', error))
}

function susView (){
    toSuS()
    fetch(`http://127.0.0.1:5000/susView?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("username").innerHTML = `${data.username}`
            for (const tense in data.progress) {
                if (parseFloat(data.progress[tense]) != 0) {
                    const progressContainer = document.createElement('p');
                    progressContainer.id = 'progress-container';
                    if (data.progress.hasOwnProperty(tense)) {
                        progressContainer.innerHTML = `
                            ${tense} <progress id="progress-bar" value="${data.progress[tense]}" max="1"></progress>
                        `;
                    }
                    document.getElementById('user-info').appendChild(progressContainer);
                }
            }
            const container = document.getElementById("sus-right");
            for (const unit in data.units) {
                const unit_field = document.createElement('div');
                unit_field.textContent = `${data.units[unit]}`
                unit_field.setAttribute("data_id", `${unit}`)
                unit_field.classList.add('unit-field')
                container.appendChild(unit_field)
            }

        })
        .catch(error => console.error('Fehler', error))
}



document.getElementById("login-button").addEventListener("click",login)

document.getElementById("sus-right").addEventListener("click",function (event) {
    if (event.target.tagName === "DIV") {
        const objectId = event.target.getAttribute("data_id");
        const objectName = event.target.textContent
        document.getElementById('nav-unit-name').textContent = `${objectName}`
        document.getElementById('tense-form').innerHTML=``


        fetch(`http://127.0.0.1:5000/tenses?token=${encodeURIComponent(token)}&unit=${encodeURIComponent(objectId)}`)
            .then(response => response.json())
            .then(data => {
                for (const tense in data) {
                    if(data[tense]){
                        const tenseDiv = document.createElement('div');
                        tenseDiv.classList.add('tense');
                        tenseDiv.innerHTML = `<input type="checkbox" name="tense" value="${tense}"><label for="${tense}"></label>`;
                        tenseDiv.querySelector('label').textContent = tense;
                        document.getElementById("tense-form").appendChild(tenseDiv)

                    }
                }



            })

        toTenses()
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

