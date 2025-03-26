let token = 0

function toSuS() {
    document.getElementById('navbar').classList.add('hidden');
    document.getElementById('login-view').classList.add('d-none');
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
    document.getElementById('check-answers-button').classList.add('hidden')
}

function toExercise() {
    document.getElementById('navbar').classList.remove('hidden');
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('sus-view').classList.add('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.remove('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');
    document.getElementById('check-answers-button').classList.remove('hidden')

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
    console.log('new Unit')
}
/*

All the functions for switching between different views.
//
 */

document.getElementById("login-button").addEventListener("click",login)
function login (){
    const username = document.getElementById('input-name').value
    const password = document.getElementById('input-password').value
    fetch(`http://127.0.0.1:5000/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
        .then(response => response.json())
        .then(data => {
            token = data.token
            if (data.role === 's'){
                susView()
            }
            if (data.role === 'l'){
                toLP()
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
            document.getElementById('user-info').innerHTML = ``
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
            container.innerHTML=``
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

document.getElementById("sus-right").addEventListener("click",function (event) {
    if (event.target.tagName === "DIV") {
        const objectId = event.target.getAttribute("data_id");
        const objectName = event.target.textContent
        const navbar = document.getElementById('nav-unit-name')
        navbar.textContent = `${objectName}`
        document.getElementById('navbar').setAttribute("selected_unit",`${objectId}`)

        fetch(`http://127.0.0.1:5000/tenses?token=${encodeURIComponent(token)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("tense-form").innerHTML=``
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
    const selectedTenses = [...document.querySelectorAll('input[name="tense"]:checked')]
        .map(checkbox => checkbox.value);
    const selected_unit = document.getElementById('navbar').getAttribute('selected_unit')

    fetch(`http://127.0.0.1:5000/training?token=${encodeURIComponent(token)}&tenses=${encodeURIComponent(selectedTenses.join(','))}&unit=${encodeURIComponent(selected_unit)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('exercise-view').innerHTML = ``
                for (const sentence of data) {
                    const sentence_container = document.createElement('div');
                    sentence_container.classList.add('gap-sentence');

                    sentence_container.innerHTML = `${sentence.start} <input type="text" class="gap-input" data-answer="${sentence.solution}" data-tense="${sentence.tense}">(${sentence.infinitive}) ${sentence.end}`;
                    sentence_container.setAttribute("solution", `${sentence.solution}`)
                    document.getElementById('exercise-view').appendChild(sentence_container);

                }
            })
    document.getElementById("check-answers-button").setAttribute("clicked",0)
    toExercise()
});

document.getElementById("check-answers-button").addEventListener("click",function (){

    let score = {
        "Present":[0,0],
        "Futur simple":[0,0],
        "Imparfait":[0,0],
        "Passe compose":[0,0],
        "Plus-que-parfait":[0,0]
    }
    const button_clicks = document.getElementById("check-answers-button").getAttribute("clicked")
    if (parseInt(button_clicks) === 1){
        document.getElementById("check-answers-button").classList.add("hidden")
    }
    const sentences = document.querySelectorAll('.gap-sentence');
    sentences.forEach(sentence => {
        const input = sentence.querySelector('.gap-input');
        const correctAnswer = input.getAttribute('data-answer');
        if (input.value === correctAnswer) {
            sentence.querySelector('.gap-input').classList.add('green-text')
            sentence.querySelector('.gap-input').classList.remove('red-text')
            if (button_clicks === "0"){
                const tense = input.getAttribute('data-tense')
                score[tense][1] += 1
                score[tense][0] += 1
            }
            // if it is the first, check the answers
            // if it is the second,add the solution at the end of the sentence.
        }
        else{
            sentence.querySelector('.gap-input').classList.add('red-text');
            sentence.querySelector('.gap-input').classList.remove('green-text');
            if (button_clicks === "0"){
                const tense = input.getAttribute('data-tense')
                score[tense][1] += 1
            }
        }
        if(button_clicks === "1"){
            const p = document.createElement("p");
            p.textContent = `${correctAnswer}`;
            sentence.appendChild(p);
        }

    });

    if(
        button_clicks === "0"
    ){
        fetch("http://127.0.0.1:5000/verify", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ score: score }) // Send the entire object
    })
    .then(response => {
    if (!response.ok) {
        console.error("Error:", response.statusText);
    } else {
        console.log("Score sent successfully");
    }
    })
    .catch(error => console.error("Fetch error:", error));
    }


    document.getElementById("check-answers-button").setAttribute("clicked",1)
});







document.getElementById("home-button").addEventListener("click",susView);



document.getElementById("new-unit").addEventListener("click",toCreate);
const destinations = document.getElementsByClassName("destination");

// Loop through each element and add an event listener
for (let i = 0; i < destinations.length; i++) {
    destinations[i].addEventListener("click", toTenses);
}

