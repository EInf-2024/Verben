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

@auth.route(app,"/susview", required_role=["student", "teacher"], methods=['GET'])
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
    user_id = g.get("user_id")
    try:
        with auth.open() as (connection, cursor):
            #department_id von user
            cursor.execute("SELECT department_id FROM mf_student WHERE id = %s", (user_id,))
            student = cursor.fetchone()

            if not student:
                return jsonify({"error": 1, "message": "Student nicht gefunden"}), 404

            department_id = student["department_id"]

            #alle zeitform_id die zur department_id gehören
            cursor.execute("SELECT zeitform_id FROM lz_zeitform_klasse WHERE klasse_id = %s", (department_id,))
            zeitform_ids_raw = cursor.fetchall()
            zeitform_ids = tuple([z["zeitform_id"] for z in zeitform_ids_raw])

            # falls keine Zeitformen gefunden
            if not zeitform_ids:
                return jsonify({})

            #alle Zeitformen anhand der zeitform_id
            if len(zeitform_ids) == 1:
                cursor.execute("SELECT name FROM lz_zeitform WHERE zeitform_id = %s", (zeitform_ids[0],))
            else:
                format_strings = ','.join(['%s'] * len(zeitform_ids))
                cursor.execute(
                    f"SELECT name FROM lz_zeitform WHERE zeitform_id IN ({format_strings})",
                    zeitform_ids
                )
            result = cursor.fetchall()

            return jsonify(result)
    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

#!!!AI aufgabensätze mit KI erstellen
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

#Score des Schülers in datenbank speichern
@auth.route(app,"/verify", required_role=["student"], methods=['POST'])
def verify():
    data = request.get_json()  # Get JSON data
    score = data.get("score")  # Extract "score" object
    print("Received Score:", score)  # Debugging
    print(score["Imparfait"])
    return '', 204  # 204 No Content (no response needed)


@auth.route(app, "/lpview", required_role=["teacher"], methods=['GET'])
def tolp():
    user_id = g.get("user_id")
    try:
        with auth.open() as (connection, cursor):
            result = {
                "username": "",
                "classes": {},
                "units": {}
            }

            # Username aus mf_teacher
            cursor.execute("SELECT abbreviation FROM mf_teacher WHERE id = %s", (user_id,))
            teacher = cursor.fetchone()
            if teacher:
                result["username"] = teacher["abbreviation"]

            # Klassenname + ID aus mf_department
            cursor.execute("SELECT id, label FROM mf_department WHERE teacher_id = %s", (user_id,))
            klassen = cursor.fetchall()
            klassen_dict = {str(k["id"]): k["label"] for k in klassen}
            result["classes"] = klassen_dict

            klasse_ids = list(klassen_dict.keys())

            # Unit-IDs aus lz_unit_pro_klass
            if klasse_ids:
                format_strings = ','.join(['%s'] * len(klasse_ids))
                cursor.execute(
                    f"SELECT DISTINCT unit_id FROM lz_unit_pro_klass WHERE klasse_id IN ({format_strings})",
                    klasse_ids
                )
                unit_ids_raw = cursor.fetchall()
                unit_ids = [str(u["unit_id"]) for u in unit_ids_raw]

                # Unit-Namen aus lz_unit
                if unit_ids:
                    format_strings = ','.join(['%s'] * len(unit_ids))
                    cursor.execute(
                        f"SELECT unit_id, unit_name FROM lz_unit WHERE unit_id IN ({format_strings})",
                        unit_ids
                    )
                    units = cursor.fetchall()
                    result["units"] = {str(u["unit_id"]): u["unit_name"] for u in units}

            return jsonify(result)
    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

@auth.route(app, "/lpclass", required_role=["teacher"], methods=['GET'])
def lpclass():
    user_id = g.get("user_id")
    class_id = request.args.get('class_id')

    try:
        with auth.open() as (connection, cursor):
            result = {
                'sus_names': {},
                'units': {}
            }

            # Schüler mit class_id
            cursor.execute("SELECT id, username FROM mf_student WHERE department_id = %s", (class_id,))
            sus = cursor.fetchall()
            result["sus_names"] = {str(s["id"]): s["username"] for s in sus}

            # Unit-IDs der Klasse
            cursor.execute("SELECT unit_id FROM lz_unit_pro_klass WHERE klasse_id = %s", (class_id,))
            unit_ids = [str(u["unit_id"]) for u in cursor.fetchall()]

            # Unit-Namen
            if unit_ids:
                format_strings = ','.join(['%s'] * len(unit_ids))
                cursor.execute(
                    f"SELECT unit_id, unit_name FROM lz_unit WHERE unit_id IN ({format_strings})",
                    unit_ids
                )
                units = cursor.fetchall()
                result["units"] = {str(u["unit_id"]): u["unit_name"] for u in units}

            return jsonify(result)

    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler : {str(e)}"}), 500


# upload eines pdfs KI soll es in text/ objekte zurückgeben/ in Datenbank speichern
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


@auth.route(app, "/getunit", required_role=["teacher"], methods=["GET"])
def getunit():
    user_id = g.get("user_id")
    unit_id = request.args.get('unit_id')

    try:
        with auth.open() as (connection, cursor):

            # Unit-Name holen
            cursor.execute("SELECT unit_name FROM lz_unit WHERE unit_id = %s", (unit_id,))
            unit = cursor.fetchone()
            unit_name = unit["unit_name"] if unit else "Unbekannt"

            # Klasse-IDs zur Unit finden
            cursor.execute("SELECT klasse_id FROM lz_unit_pro_klass WHERE unit_id = %s", (unit_id,))
            klasse_ids = cursor.fetchall()
            klasse_id_list = [k["klasse_id"] for k in klasse_ids]

            classes = {}
            if klasse_id_list:
                format_strings = ','.join(['%s'] * len(klasse_id_list))
                cursor.execute(
                    f"SELECT id, label FROM mf_department WHERE id IN ({format_strings})",
                    tuple(klasse_id_list)
                )
                klasse_data = cursor.fetchall()
                classes = {str(k["id"]): k["label"] for k in klasse_data}

            # Verb-IDs der Unit
            cursor.execute("SELECT verb_id FROM lz_verb_pro_unit WHERE unit_id = %s", (unit_id,))
            verb_ids = cursor.fetchall()
            verb_id_list = [v["verb_id"] for v in verb_ids]

            verbs = {}
            if verb_id_list:
                format_strings = ','.join(['%s'] * len(verb_id_list))
                cursor.execute(
                    f"SELECT verb_id, verb FROM lz_verb WHERE verb_id IN ({format_strings})",
                    tuple(verb_id_list)
                )
                verb_data = cursor.fetchall()
                verbs = {str(v["verb_id"]): v["verb"] for v in verb_data}

        # Ergebnis zusammenbauen
        result = {
            'unit_name': unit_name,
            'classes': classes,
            'verbs': verbs
        }
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

#Neue Infos wie unit_name, klassen, verben etc erstellen und an Datenbank geben
@auth.route(app,"createunit", required_role=["teacher"], methods=['POST'])
def createunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['selected_classes'])
    return '', 204

#unit welche schon erstellt sind, einzelne verben aber gelöscht/ hinzugefügt werden
@auth.route(app,"/saveunit", required_role=["teacher"], methods=['POST'])
def saveunit():
    data = request.get_json()  # Get JSON data
    new_unit = data.get("unit")
    print(new_unit['verbs'])
    print(new_unit['unit_name'])
    print(new_unit['unit_id'])
    print(new_unit['selected_classes'])
    return '', 204

@auth.route(app, "/deleteunit", required_role=["teacher"], methods=['POST'])
def deleteunit():
    user_id = g.get("user_id")
    unit_id = request.args.get('unit_id')

    try:
        with auth.open() as (connection, cursor):

            # Löscht Einträge in lz_unit_pro_klass
            delete_klass_query = "DELETE FROM lz_unit_pro_klass WHERE unit_id = %s"
            cursor.execute(delete_klass_query, (unit_id,))

            # verb_id's aus lz_verb_pro_unit mit unit_id
            get_verbs_query = "SELECT verb_id FROM lz_verb_pro_unit WHERE unit_id = %s"
            cursor.execute(get_verbs_query, (unit_id,))
            verb_ids = cursor.fetchall()

            # löscht verben
            verb_id_list = [v["verb_id"] for v in verb_ids]
            format_strings = ','.join(['%s'] * len(verb_id_list))
            cursor.execute(f"DELETE FROM lz_verb WHERE verb_id IN ({format_strings})", tuple(verb_id_list))

            # löscht einträge verb_pro_unit
            delete_verbs_query = "DELETE FROM lz_verb_pro_unit WHERE unit_id = %s"
            cursor.execute(delete_verbs_query, (unit_id,))

            # löscht eintrag in unit
            delete_unit_query = "DELETE FROM lz_unit WHERE unit_id = %s"
            cursor.execute(delete_unit_query, (unit_id,))
            connection.commit()

        return jsonify({"success": True, "message": "Unit wurde erfolgreich gelöscht."}), 200
    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500


if __name__ == '__main__':
    app.run()
