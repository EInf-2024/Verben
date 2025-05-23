

from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

#Test
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    print(username)
    return jsonify({"role": str(username), "token": 1})

@app.route('/susview', methods=['GET'])
def toSuS():
    token = request.args.get('token')
    result = {
        'username': 'Rudolf',
        'progress': {
            'Présent': 0.81,
            'Passé composé': 0.25,
            'Imparfait': 0.91,
            'Plus-que-parfait': 0.12,
            'Futur simple': 0.97,
            'Conditionnel présent': 0.98,
            'Conditionnel passé': 0.79,
            'Subjonctif présent': 0.17,
            'Subjonctif passé': 0.41,
            'Impératif': 0.73
        },
        'units': {
            '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3',
            '4': 'Unité 4', '5': 'Unité 5', '6': 'Unité 6', '7': 'Unité 7'
        }}
    return jsonify(result)



@app.route('/tenses', methods=['GET'])
def tenses():
    token = request.args.get('token')
    result = {
        "Présent": True,
        "Passé composé": True,
        "Imparfait": True,
        "Plus-que-parfait": True,
        "Futur simple": True,
        "Conditionnel présent": True,
        "Conditionnel passé": True,
        "Subjonctif présent": True,
        "Subjonctif passé": True,
        "Impératif": True
    }
    return jsonify(result)



@app.route('/training', methods=['GET'])
def training():
    token = request.args.get('token')
    selected_tenses = request.args.get('tenses')
    unit = request.args.get('unit')
    result = [{'start':'Quand j’étais petit, je','infinitive':'jouer','solution':'jouais','tense':'Imparfait','end':'au foot tous les jours.'},
              {'start':'Demain, nous','infinitive':'partir','solution':'partirons','tense':'Futur simple','end':' en vacances à la mer.'},
              {'start':'Chaque été, nous ','infinitive':'aller','solution':' allions','tense':'Imparfait','end':'à la plage avec ma famille.'},
              {'start':'Hier, ils','infinitive':'voir','solution':'ont vu','tense':'Passé composé','end':'un film très intéressant.'},
              {'start':'Si j’avais su, je','infinitive':'ne pas venir','solution':'ne serais pas venu','tense':'Plus-que-parfait','end':'à la fête'}]
    return jsonify(result)



@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()  # Get JSON data
    score = data.get("score")  # Extract "score" object
    print("Received Score:", score)  # Debugging
    print(score["Imparfait"])
    return '', 204  # 204 No Content (no response needed)


@app.route('/lpview', methods=['GET'])
def toLP():
    token = request.args.get('token')
    result = {
        'username': 'Mrs.French ',
        'classes': {'1': 'G1A', '2': 'G1B', '3': 'G4H', '4': 'G1A', '5': 'G1B', '6': 'G4H', '7': 'G1A', '8': 'G1B', '9': 'G4H', '10': 'G1A', '11': 'G1B', '12': 'G4H'},
        'units': {
            '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3',
            '4': 'Unité 4', '5': 'Unité 5', '6': 'Unité 6', '7': 'Unité 7'}
    }
    return jsonify(result)


@app.route('/lpclass', methods=['GET'])
def lpclass():
    token = request.args.get('token')
    class_id = request.args.get('class_id')
    result = {
        'sus_names': {'1': 'Rudolf', '2': 'Bob', '3': 'Eve','4': 'Alice', '5': 'Bob', '6': 'Eve','7': 'Alice', '8': 'Bob', '9': 'Eve','10': 'Alice', '11': 'Bob', '12': 'Eve'},
        'units': {
            '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3'}
    }
    return jsonify(result)


# upload eines pdfs

@app.route('/upload', methods=['POST'])
def upload():

    text = request.form.get('text')
    files = request.files.getlist('pdfs')  # Get multiple files

    saved_files = []
    for pdf in files:
        print(text)
        print(pdf.filename)
        saved_files.append(pdf.filename)

    result = {
        'verbs': {
            '1': 'Manger', '2': 'Parler', '3': 'Aimer', '4': 'Marcher',
            '5': 'Jouer', '6': 'Travailler', '7': 'Étudier'}
    }

    return jsonify(result)


@app.route('/getunit', methods=['GET'])
def getunit():
    token = request.args.get('token')
    unit_id = request.args.get('unit_id')
    result = {
        'unit_name': 'Unité 3',
        'classes': {'1': 'G1A', '2': 'G4H'},
        'verbs': {
            '1': 'Manger', '2': 'Parler', '3': 'Aimer', '4': 'Marcher',
            '5': 'Jouer', '6': 'Travailler', '7': 'Étudier', '8': 'Regarder',
            '9': 'Écouter', '10': 'Chanter', '11': 'Dormir', '12': 'Finir',
            '13': 'Vivre', '14': 'Aller', '15': 'Venir', '16': 'Lire',
            '17': 'Écrire', '18': 'Comprendre', '19': 'Savoir'
        }
    }
    return jsonify(result)


@app.route('/createunit', methods=['POST'])
def createunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['selected_classes'])
    return '', 204


@app.route('/saveunit', methods=['POST'])
def saveunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['unit_id'])
    print(new_unit['selected_classes'])
    return '', 204

@app.route('/deleteunit', methods=['GET'])
def deleteunit():
    token = request.args.get('token')
    unit_id = request.args.get('unit_id')
    return "Unit deleted successfully", 200


if __name__ == '__main__':
    app.run()
