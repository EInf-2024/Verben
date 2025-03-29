let token = 0

function toSuS() {
    document.getElementById('navbar').classList.add('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.remove('hidden');
    document.getElementById('tense-selection-view').classList.add('hidden');
    document.getElementById('exercise-view').classList.add('hidden');
    document.getElementById('lp-view').classList.add('hidden');
    document.getElementById('new-unit-view').classList.add('hidden');
}

function toTenses() {
    document.getElementById('navbar').classList.remove('d-none');
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
    document.getElementById('login-view').classList.add('d-none');
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
                lpView()
            }
        })
        .catch(error => console.error('Fehler', error))
}

document.getElementById('lp-user-btn').addEventListener("click",lpView)

function lpView(){
    toLP()
    document.getElementById('lp-students').classList.add('d-none')
    fetch(`http://127.0.0.1:5000/lpview?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('lp-user-btn').textContent = data.username
            document.getElementById('lp-classes').innerHTML = ``
            document.getElementById('class-selection').innerHTML=``
            for (const cl in data.classes) {
                const grade = document.createElement('p');
                const grade_option = document.createElement('option')
                grade.innerHTML = `${data.classes[cl]}`
                grade_option.innerHTML = `${data.classes[cl]}`
                grade.setAttribute("data_id", `${cl}`)
                grade_option.setAttribute("data_id", `${cl}`)
                document.getElementById('lp-classes').appendChild(grade)
                document.getElementById('class-selection').appendChild(grade_option)


            }
            document.getElementById('lp-units').innerHTML=``
            for (const unit in data.units) {
                const unit_field = document.createElement('div');
                unit_field.classList.add('unit-field')
                unit_field.innerHTML = `${data.units[unit]}`
                unit_field.setAttribute("data_id", `${unit}`)
                document.getElementById('lp-units').appendChild(unit_field)
            }
        });
}

document.getElementById("lp-classes").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const classId = event.target.getAttribute("data_id");
        const objectName = event.target.textContent
        document.getElementById('lp-students').classList.remove('d-none')
        fetch(`http://127.0.0.1:5000/lpclass?token=${encodeURIComponent(token)}&class_id=${encodeURIComponent(classId)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('lp-units').innerHTML=``
                for (const unit in data.units) {
                const unit_field = document.createElement('div');
                unit_field.classList.add('unit-field')
                unit_field.innerHTML = `${data.units[unit]}`
                unit_field.setAttribute("data_id", `${unit}`)
                document.getElementById('lp-units').appendChild(unit_field)
            }
                document.getElementById('lp-students').innerHTML=``
                for (const student in data.sus_names) {
                    const student_field = document.createElement('p');
                    student_field.innerHTML = `${data.sus_names[student]}`
                    student_field.setAttribute("data_id", `${student}`)
                    document.getElementById('lp-students').appendChild(student_field)

                }
            })
    }
});



document.getElementById("lp-students").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const studentId = event.target.getAttribute("data_id");
        document.getElementById('lp-students').classList.remove('d-none')
        fetch(`http://127.0.0.1:5000/susview?token=${encodeURIComponent(studentId)}`)
            .then(response => response.json())
            .then(data => {
                const lpInfoContainer = document.getElementById('lp-units');
                lpInfoContainer.innerHTML = `${data.username}`
                for (const tense in data.progress) {
                    const progressContainer = document.createElement('p');
                    progressContainer.id = 'progress-container';
                    if (data.progress.hasOwnProperty(tense)) {
                        progressContainer.innerHTML = `
                        ${tense} <progress id="progress-bar" value="${data.progress[tense]}" max="1"></progress>`;
                    }
                    lpInfoContainer.appendChild(progressContainer);
                }
            })
    }
});


document.getElementById("new-unit").addEventListener("click",function(){
    document.getElementById('verb-list').innerHTML= ``
    document.getElementById('unit-name').value= ``
    document.getElementById('verb-input').value= ``
    document.getElementById('save-btn').classList.add('d-none')
    document.getElementById('delete-btn').classList.add('d-none')
    document.getElementById('home-btn').classList.remove('d-none')
    document.getElementById('create-btn').classList.remove('d-none')
    toCreate()
});

document.getElementById("home-btn").addEventListener("click", function (){
    document.getElementById('verb-list').innerHTML= ``
    document.getElementById('unit-name').value= ``
    document.getElementById('verb-input').value= ``
    toLP()
})

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the selected file
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file); // Append the file

    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
});






function susView (){
    toSuS()
    document.getElementById('percentage').innerHTML=''
    fetch(`http://127.0.0.1:5000/susview?token=${encodeURIComponent(token)}`)
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
    "Présent": [0, 0],
    "Passé composé": [0, 0],
    "Imparfait": [0, 0],
    "Plus-que-parfait": [0, 0],
    "Futur simple": [0, 0],
    "Conditionnel présent": [0, 0],
    "Conditionnel passé": [0, 0],
    "Subjonctif présent": [0, 0],
    "Subjonctif passé": [0, 0],
    "Impératif": [0, 0]
    };
    let cur_score = [0,0]
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
                cur_score[0] += 1
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
        cur_score[1] += 1
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
    const cp = cur_score[0] / cur_score[1]
    document.getElementById('percentage').innerHTML = `${cp *100}%`

    document.getElementById("check-answers-button").setAttribute("clicked",1)
});


document.getElementById("home-button").addEventListener("click",susView);




const destinations = document.getElementsByClassName("destination");

