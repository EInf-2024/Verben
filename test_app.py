from flask import Flask, request, jsonify, render_template, g
from dotenv import load_dotenv
import os
import openai
import logging
import auth

app = Flask(__name__)
load_dotenv()  # Lädt Variablen aus der .env-Datei
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

@app.route('/')
def index():
    logging.info("Serving index.html")
    return render_template("index.html")

@app.route('/login', methods=['POST'])(auth.login)

@auth.route(app,"/susview", required_role=["student"], methods=['GET'])
def tosus():
    user_id = g.get("user_id")
    auth_role = g.get("auth_role")
    try:
        with auth.open() as (connection, cursor):
            # Username & department id aus Tabelle mf_student
            cursor.execute("SELECT username, department_id FROM mf_student WHERE id = %s", (user_id,))
            student_info = cursor.fetchone()
            if not student_info:
                return jsonify({"error": "Student nicht gefunden"}), 404
            # Username & department in variablen speichern
            username = student_info["username"]
            department_id = student_info["department_id"]

            # fortschritt von user holen und berechnen
            cursor.execute("SELECT * FROM fortschritt WHERE user_id = %s", (user_id,))
            progress_data = cursor.fetchone()
            progress = {}

            if progress_data:
                zeitformen = [
                    ("Présent", "present_right", "present_all"),
                    ("Passé composé", "passecompose_right", "passecompose_all"),
                    ("Imparfait", "imparfait_right", "imparfait_all"),
                    ("Plus-que-parfait", "plus-que-parfait_right", "plus-que-parfait_all"),
                    ("Futur simple", "futur_simple_right", "futur_simple_all"),
                    ("Conditionnel présent", "conditionnel_present_right", "conditionnel_present_all"),
                    ("Conditionnel passé", "conditionnel_passe_right", "conditionnel_passe_all"),
                    ("Subjonctif présent", "subjonctif_present_right", "subjonctif_present_all"),
                    ("Subjonctif passé", "subjonctif_passe_right", "subjonctif_passe_all"),
                    ("Impératif", "imperatif_right", "imperatif_all"),
                ] #Rechnen
                for label, right_key, all_key in zeitformen:
                    right = progress_data.get(right_key, 0)
                    total = progress_data.get(all_key, 0)
                    progress[label] = round(right / total, 2) if total > 0 else 0.0

            # unit_ids aus lz_unit_pro_klass holen
            cursor.execute("SELECT unit_id FROM lz_unit_pro_klass WHERE klasse_id = %s", (department_id,))
            unit_ids = cursor.fetchall()

            unit_names = {}#kommen nachher die Unitnamen rein
            if unit_ids:#?????
                unit_id_list = tuple([u["unit_id"] for u in unit_ids])
                # Aufpassen bei nur 1 Element in IN-Klausel (SQL erwartet (x,) nicht (x))
                if len(unit_id_list) == 1:
                    cursor.execute("SELECT unit_id, unit_name FROM lz_unit WHERE unit_id = %s", (unit_id_list[0],))
                else:
                    format_strings = ','.join(['%s'] * len(unit_id_list))
                    cursor.execute(f"SELECT unit_id, unit_name FROM lz_unit WHERE unit_id IN ({format_strings})", unit_id_list)

                units = cursor.fetchall()
                unit_names = {str(u["unit_id"]): u["unit_name"] for u in units}

            result = {
                "username": username,
                "progress": progress,
                "units": unit_names
            }

            return jsonify(result)

    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler : {str(e)}"}), 500

@app.route('/tenses', methods=['GET'])
def tenses():
    token = request.args.get('token')
    if token == '1':
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



@auth.route(app,"/training", required_role=["student"], methods=['GET'])
def training():
    token = request.args.get('token')
    selected_tenses = request.args.get('tenses')
    unit = request.args.get('unit')
    if token == '1':
        result = [{'start':'Quand j’étais petit, je','infinitive':'jouer','solution':'jouais','tense':'Imparfait','end':'au foot tous les jours.'},
                  {'start':'Demain, nous','infinitive':'partir','solution':'partirons','tense':'Futur simple','end':' en vacances à la mer.'},
                  {'start':'Chaque été, nous ','infinitive':'aller','solution':' allions','tense':'Imparfait','end':'à la plage avec ma famille.'},
                  {'start':'Hier, ils','infinitive':'voir','solution':'ont vu','tense':'Passé composé','end':'un film très intéressant.'},
                  {'start':'Si j’avais su, je','infinitive':'ne pas venir','solution':'ne serais pas venu','tense':'Plus-que-parfait','end':'à la fête'}]
        return jsonify(result)



@auth.route(app,"/verify", required_role=["student"], methods=['POST'])
def verify():
    data = request.get_json()  # Get JSON data
    score = data.get("score")  # Extract "score" object
    print("Received Score:", score)  # Debugging
    print(score["Imparfait"])
    return '', 204  # 204 No Content (no response needed)


@auth.route(app,"/lpview", required_role=["teacher"], methods=['GET'])
def tolp():
    token = request.args.get('token')
    if token == '1':
        result = {
            'username': 'Mrs.French ',
            'classes': {'1': 'G1A', '2': 'G1B', '3': 'G4H', '4': 'G1A', '5': 'G1B', '6': 'G4H', '7': 'G1A', '8': 'G1B', '9': 'G4H', '10': 'G1A', '11': 'G1B', '12': 'G4H'},
            'units': {
                '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3',
                '4': 'Unité 4', '5': 'Unité 5', '6': 'Unité 6', '7': 'Unité 7'}
        }
        return jsonify(result)


@auth.route(app,"/lpclass", required_role=["teacher"], methods=['GET'])
def lpclass():
    token = request.args.get('token')
    class_id = request.args.get('class_id')
    if token == '1':
        result = {
            'sus_names': {'1': 'AliceAliceAlice', '2': 'Bob', '3': 'Eve','4': 'Alice', '5': 'Bob', '6': 'Eve','7': 'Alice', '8': 'Bob', '9': 'Eve','10': 'Alice', '11': 'Bob', '12': 'Eve'},
            'units': {
                '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3'}
        }
        return jsonify(result)


# upload eines pdfs

@auth.route(app,"/upload", required_role=["teacher"], methods=['POST'])
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


@auth.route(app,"/getunit", required_role=["teacher"], methods=['GET'])
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


@auth.route(app,"createunit", required_role=["teacher"], methods=['POST'])
def createunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['selected_classes'])
    return '', 204


@auth.route(app,"/saveunit", required_role=["teacher"], methods=['POST'])
def saveunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['unit_id'])
    print(new_unit['selected_classes'])
    return '', 204

@auth.route(app,"/deleteunit", required_role=["teacher"], methods=['GET'])
def deleteunit():
    token = request.args.get('token')
    unit_id = request.args.get('unit_id')
    return "Unit deleted successfully", 200


if __name__ == '__main__':
    app.run()
