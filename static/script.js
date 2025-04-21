let token = 0 // Store user token
let selectedFiles = []; // Store selected files


// functions to switch the view containers

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


//     Login view
document.getElementById("login-button").addEventListener("click",function (){
    const username = document.getElementById('input-name').value
    const password = document.getElementById('input-password').value

    fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: encodeURIComponent(username), password: encodeURIComponent(password) })
    })
        .then(response => response.json())
        .then(data => {
            token = data.access_token;
            role = data.role;
            if (data.role === 's'){
                susView()
            }
            if (data.role === 'l'){
                lpView()
            }
        })
        .catch(error => console.error('Fehler', error))
    
});


// function that leads to the LP view container
function lpView(){
    // clear edit view items
    document.getElementById('verb-list').innerHTML= ``
    document.getElementById('unit-name').value= ``
    document.getElementById('verb-input').value= ``
    selectedFiles = []
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-input').value = ``
    for (const option of document.getElementById('class-selection').options) {
        option.selected = false;
    }

    // set the width of the third panel right, so that there is no gap
    document.querySelector('.LP-left3-panel').style.marginLeft = '10%'
    document.querySelector('.LP-left3-panel').style.width = '82%'
    document.getElementById('lp-students').classList.add('d-none')

    // show units and not the progress of a student
    document.getElementById('lp-sus-progress').classList.add('d-none')
    document.getElementById('lp-units').classList.remove('d-none')

    // fetching the data needed to set up LP view
    fetch(`/lpview?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('lp-user-btn').textContent = data.username
            document.getElementById('lp-classes').innerHTML = ``
            document.getElementById('class-selection').innerHTML=``

            // set up the classes buttons in LP view and the classes options in edit view
            for (const cl in data.classes) {
                const grade = document.createElement('p');
                const grade_option = document.createElement('option')
                grade.innerHTML = `${data.classes[cl]}`
                grade_option.innerHTML = `${data.classes[cl]}`
                grade.setAttribute("data_id", `${cl}`)
                grade_option.value =`${cl}`
                grade.classList.add("class-circle", "d-flex", "align-items-center", "justify-content-center","lp-options","cursor-pointer","user-select-none")
                document.getElementById('lp-classes').appendChild(grade)
                document.getElementById('class-selection').appendChild(grade_option)
            }

            // set up the units of the LP
            document.getElementById('lp-units').innerHTML=``
            for (const unit in data.units) {
                const unit_field = document.createElement('p');
                unit_field.classList.add('unit-field')
                unit_field.innerHTML = `${data.units[unit]}`
                unit_field.setAttribute("data_id", `${unit}`)
                document.getElementById('lp-units').appendChild(unit_field)
            }

        })

    // actually switch to the LP view
    toLP()
}
document.getElementById('lp-user-btn').addEventListener("click",lpView)


// button click on a classes div will lead the display of all units for this class
document.getElementById("lp-classes").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const classId = event.target.getAttribute("data_id");

        // hide the progress and show the units
        document.getElementById('lp-sus-progress').classList.add('d-none')
        document.getElementById('lp-units').classList.remove('d-none')

        // set the right width for the third panel
        document.querySelector('.LP-left3-panel').style.marginLeft = '25%'
        document.querySelector('.LP-left3-panel').style.width = '67%'
        document.getElementById('lp-students').classList.remove('d-none')

        // get all the units and students of the selected class
        fetch(`/lpclass?token=${encodeURIComponent(token)}&class_id=${encodeURIComponent(classId)}`)
            .then(response => response.json())
            .then(data => {

                // clear the remaining units and add class specific units
                document.getElementById('lp-units').innerHTML=``
                for (const unit in data.units) {
                    const unit_field = document.createElement('div');
                    unit_field.classList.add('unit-field')
                    unit_field.innerHTML = `${data.units[unit]}`
                    unit_field.setAttribute("data_id", `${unit}`)
                    document.getElementById('lp-units').appendChild(unit_field)
                }

                // clear the remaining students and add class specific students
                document.getElementById('lp-students').innerHTML=``
                for (const student in data.sus_names) {
                    const student_field = document.createElement('p');
                    student_field.innerHTML = `${data.sus_names[student]}`
                    student_field.setAttribute("data_id", `${student}`)
                    student_field.classList.add("class-box", "d-flex", "align-items-center", "justify-content-center","lp-options","cursor-pointer","user-select-none")
                    document.getElementById('lp-students').appendChild(student_field)

                }
            })
        .catch(error => console.error('Fehler', error))
    }
});


// a click on a students name leads to the display of the progress of said student
document.getElementById("lp-students").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const studentId = event.target.getAttribute("data_id");

        // hide the progress and show the units and
        document.getElementById('lp-sus-progress').classList.remove('d-none')
        document.getElementById('lp-units').classList.add('d-none')

        // requesting the info about the user
        fetch(`/susview?token=${encodeURIComponent(studentId)}`)
            .then(response => response.json())
            .then(data => {

                // display the progress of the selected student
                const lpInfoContainer = document.getElementById('lp-sus-progress');
                lpInfoContainer.innerHTML = `${data.username}`
                for (const tense in data.progress) {
                    const progressContainer = document.createElement('p');
                    progressContainer.id = 'progress-container';
                        progressContainer.innerHTML = `
                            <div class="progress position-relative" style="width: 18vw; height: 2vw;">
                                <div class="progress-bar bg-info text-dark" role="progressbar" style="width: ${parseFloat(data.progress[tense])*100}%;"></div>
                                <span class="position-absolute w-100 text-center" style="font-size: 1.2vw; top: 50%; transform: translateY(-50%);">${tense}</span>
                            </div>
                        `;
                    lpInfoContainer.appendChild(progressContainer);
                }
            })
        .catch(error => console.error('Fehler', error))
    }
});

// a click on the create button will lead to the new unit view
document.getElementById("new-unit").addEventListener("click",function(){
    document.getElementById('save-btn').classList.add('d-none')
    document.getElementById('delete-btn').classList.add('d-none')
    document.getElementById('home-btn').classList.remove('d-none')
    document.getElementById('create-btn').classList.remove('d-none')
    toCreate()
});

// a click on a unit field will lead to the edit unit view
document.getElementById("lp-units").addEventListener("click",function (event) {
    if (event.target.tagName === "P") {
        const objectId = event.target.getAttribute("data_id");

        // requesting all the info about the clicked unit
        fetch(`/getunit?token=${encodeURIComponent(token)}&unit_id=${encodeURIComponent(objectId)}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('unit-name').value = data.unit_name
                document.getElementById('unit-name').setAttribute('data_id',objectId)

                // selecting the classes of the unit
                const classKeys = Object.keys(data.classes); // Extract the keys
                for (const option of document.getElementById('class-selection').options) {
                    if (classKeys.includes(option.value)) {
                        option.selected = true;
                    }
                }

                // setting up the verbs of the selected unit
                for (const verb in data.verbs){
                    const verb_container = document.createElement('li');
                    verb_container.innerHTML = `✖${data.verbs[verb]}`
                    verb_container.setAttribute('data_id',`${verb}`)
                    verb_container.classList.add("d-flex", "align-items-center", "justify-content-center","cursor-pointer","user-select-none")
                    document.getElementById('verb-list').appendChild(verb_container)
                }

            })
        .catch(error => console.error('Fehler', error))

        // hiding and displaying the right set of buttons
        document.getElementById('save-btn').classList.remove('d-none')
        document.getElementById('delete-btn').classList.remove('d-none')
        document.getElementById('home-btn').classList.add('d-none')
        document.getElementById('create-btn').classList.add('d-none')
        toCreate()
    }
});


// a click on the home button will lead back to the LP view
document.getElementById("home-btn").addEventListener("click", function (){
    lpView()
})

// the delete button will send the unit id to delete to flask and return to the LP view
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
    .catch(error => console.error("Fehler:", error));
    lpView()
});


// the create button will send all the data of the newly created unit to flask to be saved
document.getElementById('create-btn').addEventListener('click',function(){

    //get all the data
    const unit_name = document.getElementById('unit-name').value
    const selectElement = document.getElementById("class-selection");
    const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
    const verbList = document.querySelectorAll("#verb-list li");
    const verbs = Array.from(verbList).map(li => li.textContent.replace("✖", "").trim());
    console.log(verbs);

    // creating a new object to store the data in
    let unit = {
        'token':`${token}`,
        'unit_name':`${unit_name}`,
        'selected_classes': selectedValues,
        'verbs': verbs,
    }
    // sending all the data to flask
    fetch("/createunit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ unit: encodeURIComponent(unit) }) // Send the entire object
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error:", response.statusText);
        } else {
            console.log("unit sent successfully");
        }
    })
    .catch(error => console.error('Fehler', error))
    lpView()

});

// the save button does the same as the create button, but instead of creating a unit it will update one
document.getElementById('save-btn').addEventListener('click',function(){

    // get all the data
    const unit_name = document.getElementById('unit-name').value
    const unit_id = document.getElementById('unit-name').getAttribute('data_id')
    const selectElement = document.getElementById("class-selection");
    const selectedValues = Array.from(selectElement.selectedOptions).map(option => option.value);
    const verbList = document.querySelectorAll("#verb-list li");
    const verbs = Array.from(verbList).map(li => li.textContent.replace("✖", "").trim());

    // creating a object to store the data in
    let unit = {
        'unit_id': unit_id,
        'token':`${token}`,
        'unit_name':`${unit_name}`,
        'selected_classes': selectedValues,
        'verbs': verbs,
    }

    // sending the data to flask
    fetch("/saveunit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ unit: encodeURIComponent(unit) }) // Send the entire object
    })
    .then(response => {
        if (!response.ok) {
            console.error("Error:", response.statusText);
        } else {
            console.log("unit sent successfully");
        }
    })
    .catch(error => console.error('Fehler', error))
    console.log('saved')
    lpView()
});



// pdf file upload placeholder button action
document.getElementById("add-file-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
});


// Handle file selection
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0]; // Get the single selected file
    const fileList = document.getElementById('file-list');

    fileList.innerHTML = file ? `<li>${file.name}</li>` : '';
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
    .catch(error => console.error('Fehler', error))

    //after the files have been sent, clear the input
    selectedFiles = []
    document.getElementById('file-list').innerHTML = '';
    document.getElementById('file-input').value = ``
    document.getElementById('verb-input').value= ``

});

// delete verbs if clicked on
document.getElementById("verb-list").addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
        event.target.remove(); // Remove the clicked item
    }
});


// SuS view setup
function susView (){

    // reset the percentage of the navbar
    document.getElementById('percentage').innerHTML=''

    // get all the info of a student
    fetch(`/susview?token=${encodeURIComponent(token)}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("sus-left-panel").innerHTML = `<h2 class="sus-username-text">${data.username}</h2>`

            // set up the progress of a student
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

            // set up all the available units
            const container = document.getElementById("sus-right");
            container.innerHTML=``
            for (const unit in data.units) {
                const unit_field = document.createElement('p');
                unit_field.textContent = `${data.units[unit]}`
                unit_field.setAttribute("data_id", `${unit}`)
                unit_field.classList.add('unit-field')
                container.appendChild(unit_field)
            }
        })
        .catch(error => console.error('Fehler', error))
    toSuS()
}


// get a click on a unitfield
document.getElementById("sus-right").addEventListener("click",function (event) {
    document.getElementById('start-training-button').classList.remove('d-none')
    if (event.target.tagName === "P") {
        const objectId = event.target.getAttribute("data_id");
        const objectName = event.target.textContent
        const navbar = document.getElementById('nav-unit-name')
        navbar.textContent = `${objectName}`
        document.getElementById('navbar').setAttribute("selected_unit",`${objectId}`)

        // fetch data and set up the tenses to choose
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
        .catch(error => console.error('Fehler', error))
        toTenses()
    }
});


// sets up the training view
document.getElementById("start-training-button").addEventListener("click",function (){
    document.getElementById('start-training-button').classList.add('d-none')
    const selectedTenses = [...document.querySelectorAll('input[name="tense"]:checked')]
        .map(checkbox => checkbox.value);
    const selected_unit = document.getElementById('navbar').getAttribute('selected_unit')

    // creates the sentences that are sent back by flask
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
                <p>(${sentence.tense})</p>
                `;

                sentence_container.setAttribute("solution", `${sentence.solution}`)
                document.getElementById('exercise-view').appendChild(sentence_container);

            }
        })
    .catch(error => console.error('Fehler', error))
    document.getElementById("check-answers-button").setAttribute("clicked",0)
    toExercise()
});



// corrects the sentences and sends back the results
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

    // correct sentences and display if they're correct or not
    sentences.forEach(sentence => {
        const input = sentence.querySelector('.gap-input');
        const correctAnswer = input.getAttribute('data-answer');
        if (input.value === correctAnswer) {
            sentence.querySelector('.gap-input').classList.add('text-success')
            sentence.querySelector('.gap-input').classList.remove('text-danger')
            cur_score[0] += 1
            if (button_clicks === "0"){
                const tense = input.getAttribute('data-tense')
                score[tense][1] += 1
                score[tense][0] += 1
            }
        }
        else{
            sentence.querySelector('.gap-input').classList.add('text-danger');
            sentence.querySelector('.gap-input').classList.remove('text-success');
            if (button_clicks === "0"){
                const tense = input.getAttribute('data-tense')
                score[tense][1] += 1
            }
        }

        // if it is the first click, it will only correct the sentences and send back the score
        // if it is the second click, it will add the solution at the end of the sentence
        cur_score[1] += 1
        if(button_clicks === "1"){
            const p = document.createElement("p");
            p.textContent = `${correctAnswer}`;
            p.classList.add("fw-bold")
            sentence.appendChild(p);
        }

    });

    //send back the score
    if(button_clicks === "0"){
        fetch("/verify", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
            },
                body: JSON.stringify({ score: encodeURIComponent(score) }) // Send the entire object
            })
        .then(response => {
            if (!response.ok) {
                console.error("Error:", response.statusText);
            }
            else {
                console.log("Score sent successfully");
            }
            })
        .catch(error => console.error('Fehler', error))
        }

        const cp = cur_score[0] / cur_score[1]
        document.getElementById('percentage').innerHTML = `${cp *100}% correct`
        document.getElementById("check-answers-button").setAttribute("clicked",1)
});

document.getElementById("home-button").addEventListener("click",susView);