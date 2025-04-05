let token = 0 // Store user token
let selectedFiles = []; // Store selected files

function toSuS() {
    document.getElementById('navbar').classList.add('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.remove('d-none');
    document.getElementById('tense-selection-view').classList.add('d-none');
    document.getElementById('exercise-view').classList.add('d-none');
    document.getElementById('lp-view').classList.add('d-none');
    document.getElementById('new-unit-view').classList.add('d-none');
}

function toTenses() {
    document.getElementById('navbar').classList.remove('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.add('d-none');
    document.getElementById('tense-selection-view').classList.remove('d-none');
    document.getElementById('exercise-view').classList.add('d-none');
    document.getElementById('lp-view').classList.add('d-none');
    document.getElementById('new-unit-view').classList.add('d-none');
    document.getElementById('check-answers-button').classList.add('d-none')
}

function toExercise() {
    document.getElementById('navbar').classList.remove('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.add('d-none');
    document.getElementById('tense-selection-view').classList.add('d-none');
    document.getElementById('exercise-view').classList.remove('d-none');
    document.getElementById('lp-view').classList.add('d-none');
    document.getElementById('new-unit-view').classList.add('d-none');
    document.getElementById('check-answers-button').classList.remove('d-none')

}

function toLP() {
    document.getElementById('navbar').classList.add('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.add('d-none');
    document.getElementById('tense-selection-view').classList.add('d-none');
    document.getElementById('exercise-view').classList.add('d-none');
    document.getElementById('lp-view').classList.remove('d-none');
    document.getElementById('new-unit-view').classList.add('d-none');

}
function toCreate() {
    document.getElementById('navbar').classList.add('d-none');
    document.getElementById('login-view').classList.add('d-none');
    document.getElementById('sus-view').classList.add('d-none');
    document.getElementById('tense-selection-view').classList.add('d-none');
    document.getElementById('exercise-view').classList.add('d-none');
    document.getElementById('lp-view').classList.add('d-none');
    document.getElementById('new-unit-view').classList.remove('d-none');
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

    fetch(`/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`)
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
    document.getElementById('verb-list').innerHTML= ``
    document.getElementById('unit-name').value= ``
    document.getElementById('verb-input').value= ``
    selectedFiles = []
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-input').value = ``
    for (const option of document.getElementById('class-selection').options) {
        option.selected = false;
    }
    document.querySelector('.LP-left3-panel').style.marginLeft = '10%'
    document.querySelector('.LP-left3-panel').style.width = '82%'
    document.getElementById('lp-students').classList.add('d-none')




    fetch(`/lpview?token=${encodeURIComponent(token)}`)
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
                grade_option.value =`${cl}`
                grade.classList.add("class-circle", "d-flex", "align-items-center", "justify-content-center","bg-info","cursor-pointer","user-select-none")
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
    toLP()
}

document.getElementById("lp-classes").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const classId = event.target.getAttribute("data_id");
        document.querySelector('.LP-left3-panel').style.marginLeft = '25%'
        document.querySelector('.LP-left3-panel').style.width = '67%'
        document.getElementById('lp-students').classList.remove('d-none')


        fetch(`/lpclass?token=${encodeURIComponent(token)}&class_id=${encodeURIComponent(classId)}`)
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
                    student_field.classList.add("class-box", "d-flex", "align-items-center", "justify-content-center","bg-info","cursor-pointer","user-select-none")
                    document.getElementById('lp-students').appendChild(student_field)

                }
            })
    }
});



document.getElementById("lp-students").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const studentId = event.target.getAttribute("data_id");
        document.getElementById('lp-students').classList.remove('d-none')
        fetch(`/susview?token=${encodeURIComponent(studentId)}`)
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
    document.getElementById('save-btn').classList.add('d-none')
    document.getElementById('delete-btn').classList.add('d-none')
    document.getElementById('home-btn').classList.remove('d-none')
    document.getElementById('create-btn').classList.remove('d-none')
    toCreate()
});

document.getElementById("home-btn").addEventListener("click", function (){
    lpView()
})

document.getElementById('delete-btn').addEventListener('click',function(){
    const unit_id = document.getElementById('unit-name').getAttribute('data_id')
    fetch(`/deleteunit?token=${encodeURIComponent(token)}&unit_id=${encodeURIComponent(unit_id)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }
            return response.text(); // Read response as text
    })
    .then(message => {
        console.log("Server response:", message); // Log the success message
    })
    .catch(error => console.error("Fetch error:", error));
    lpView()




});


// pdf file upload

document.getElementById("add-file-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
});
    // Handle file selection
document.getElementById('file-input').addEventListener('change', function(event) {
    const files = Array.from(event.target.files); // Convert FileList to Array
    selectedFiles = [...selectedFiles, ...files]; // Append new files instead of replacing

    //  Update file list display
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = ''; // Clear previous list
    selectedFiles.forEach(file => {
        const listItem = document.createElement('li');
        listItem.textContent = file.name;
        fileList.appendChild(listItem);
    });
});



//  Handle file & text upload on button click
document.getElementById('add-btn').addEventListener('click', function() {
    const formData = new FormData();

    //  Append files **only if there are selected files**
    selectedFiles.forEach(file => formData.append('pdfs', file));

    //  Append text (text is always sent, even if empty)
    formData.append("text", document.getElementById("verb-input").value);

    //  Send request (even if no files, but always with text)
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        for (const verb in data.verbs){

            console.log(verb)
            console.log(data.verbs[verb])
            const verb_container = document.createElement('li');
            verb_container.innerHTML = `✖${data.verbs[verb]}`
            verb_container.setAttribute('data_id',`${verb}`)
            verb_container.classList.add("d-flex", "align-items-center", "justify-content-center","cursor-pointer","user-select-none")
            document.getElementById('verb-list').appendChild(verb_container)
        }

    })
    .catch(error => console.error('Error:', error));

    selectedFiles = []
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-input').value = ``
    document.getElementById('verb-input').value= ``

});

// create unit

document.getElementById('create-btn').addEventListener('click',function(){

    const unit_name = document.getElementById('unit-name').value
    const selectElement = document.getElementById("class-selection");
    const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
    console.log(selectedValues); // Logs an array of selected values

    const verbList = document.querySelectorAll("#verb-list li");
    const verbs = Array.from(verbList).map(li => li.textContent.replace("✖", "").trim());
    console.log(verbs);

    let unit = {
        'token':`${token}`,
        'unit_name':`${unit_name}`,
        'selected_classes': selectedValues,
        'verbs': verbs,
    }

    fetch("/createunit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ unit: unit }) // Send the entire object
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error:", response.statusText);
        } else {
            console.log("unit sent successfully");
        }
    })
    .catch(error => console.error("Fetch error:", error));
    lpView()

});


document.getElementById("lp-units").addEventListener("click",function (event) {
    if (event.target.tagName === "DIV") {
        const objectId = event.target.getAttribute("data_id");

        fetch(`/getunit?token=${encodeURIComponent(token)}&unit_id=${encodeURIComponent(objectId)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('unit-name').value = data.unit_name
                document.getElementById('unit-name').setAttribute('data_id',objectId)

                const classKeys = Object.keys(data.classes); // Extract the keys
                for (const option of document.getElementById('class-selection').options) {
                    if (classKeys.includes(option.value)) {
                        option.selected = true;
                    }
                }
                for (const verb in data.verbs){
                    const verb_container = document.createElement('li');
                    verb_container.innerHTML = `✖${data.verbs[verb]}`
                    verb_container.setAttribute('data_id',`${verb}`)
                    verb_container.classList.add("d-flex", "align-items-center", "justify-content-center","cursor-pointer","user-select-none")
                    document.getElementById('verb-list').appendChild(verb_container)
                }

            })

        document.getElementById('save-btn').classList.remove('d-none')
        document.getElementById('delete-btn').classList.remove('d-none')
        document.getElementById('home-btn').classList.add('d-none')
        document.getElementById('create-btn').classList.add('d-none')
        toCreate()
    }
});

document.getElementById('save-btn').addEventListener('click',function(){

    const unit_name = document.getElementById('unit-name').value
    const unit_id = document.getElementById('unit-name').getAttribute('data_id')
    console.log(unit_id)
    const selectElement = document.getElementById("class-selection");
    const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
    console.log(selectedValues); // Logs an array of selected values

    const verbList = document.querySelectorAll("#verb-list li");
    const verbs = Array.from(verbList).map(li => li.textContent.replace("✖", "").trim());
    console.log(verbs);

    let unit = {
        'unit_id': unit_id,
        'token':`${token}`,
        'unit_name':`${unit_name}`,
        'selected_classes': selectedValues,
        'verbs': verbs,
    }
    console.log(unit)

    fetch("/saveunit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ unit: unit }) // Send the entire object
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error:", response.statusText);
        } else {
            console.log("unit sent successfully");
        }
    })
    .catch(error => console.error("Fetch error:", error));
    console.log('saved')
    lpView()
});


document.getElementById("verb-list").addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
        event.target.remove(); // Remove the clicked item
    }
});



// SuS functions



function susView (){
    toSuS()
    document.getElementById('percentage').innerHTML=''
    fetch(`/susview?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("sus-left-panel").innerHTML = `<h2 class="sus-username-text">${data.username}</h2>`

            for (const tense in data.progress) {
                if (parseFloat(data.progress[tense]) != 0) {
                    const progressContainer = document.createElement('p');
                    if (data.progress.hasOwnProperty(tense)) {
                        progressContainer.innerHTML = `
                            <div class="progress position-relative" style="width: 18vw; height: 2.5vw;">
                                <div class="progress-bar bg-info text-dark" role="progressbar" style="width: ${parseFloat(data.progress[tense])*100}%;"></div>
                                <span class="position-absolute w-100 text-center" style="font-size: 1.2vw; top: 50%; transform: translateY(-50%);">${tense}</span>
                            </div>
                        `;
                    }
                    document.getElementById('sus-left-panel').appendChild(progressContainer);
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

        fetch(`/tenses?token=${encodeURIComponent(token)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById("form-check-field").innerHTML=``
                for (const tense in data) {
                    if(data[tense]){
                        const tenseDiv = document.createElement('div');
                        tenseDiv.innerHTML=`
                          <input class="form-check-input" type="checkbox" name="tense" value="${tense}">
                          <label class="form-check-label" for="${tense}">${tense}</label>  
                        `
                        document.getElementById("form-check-field").appendChild(tenseDiv)
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
    fetch(`/training?token=${encodeURIComponent(token)}&tenses=${encodeURIComponent(selectedTenses.join(','))}&unit=${encodeURIComponent(selected_unit)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('exercise-view').innerHTML = ``
                for (const sentence of data) {
                    const sentence_container = document.createElement('div');
                    sentence_container.classList.add('gap-sentence');
                    sentence_container.innerHTML = `
                    ${sentence.start} 
                    <input type="text" class="gap-input" data-answer="${sentence.solution}" data-tense="${sentence.tense}">
                    (${sentence.infinitive}) 
                    ${sentence.end}
                    `;

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
        document.getElementById("check-answers-button").classList.add("d-none")
    }
    const sentences = document.querySelectorAll('.gap-sentence');
    sentences.forEach(sentence => {
        const input = sentence.querySelector('.gap-input');
        const correctAnswer = input.getAttribute('data-answer');
        if (input.value === correctAnswer) {
            sentence.querySelector('.gap-input').classList.add('text-success')
            sentence.querySelector('.gap-input').classList.remove('text-danger')
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
            sentence.querySelector('.gap-input').classList.add('text-danger');
            sentence.querySelector('.gap-input').classList.remove('text-success');
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

    if(button_clicks === "0"){
        fetch("/verify", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
            },
                body: JSON.stringify({ score: score }) // Send the entire object
            })
        .then(response => {
            if (!response.ok) {
                console.error("Error:", response.statusText);
            }
            else {
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