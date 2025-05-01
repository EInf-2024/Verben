from cmd import PROMPT

from flask import Flask, request, jsonify, render_template, g
from dotenv import load_dotenv
from pypdf import PdfReader
import json
import os
import openai
import logging
from pydantic import BaseModel
from typing import List
import auth
import traceback

app = Flask(__name__)
load_dotenv()  # Lädt Variablen aus der .env-Datei
api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI(api_key=api_key)

@app.route('/')
def index():
    logging.info("Serving index.html")
    return render_template("index.html")

@app.route('/index2')
def index2():
    logging.info("Serving index2.html")
    return render_template("index2.html")

app.route('/login', methods=['POST'])(auth.login)

#gut
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
            cursor.execute("SELECT * FROM lz_fortschritt WHERE user_id = %s", (user_id,))
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
        print("Fehler in /susview:", str(e))
        traceback.print_exc()
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

#gut
@app.route('/tenses', methods=['GET'])
def tenses():
    result = {
        "Présent": True,
        "Imparfait": True,
        "Passé composé": True,
        "Plus-que-parfait": True,
        "Futur simple": True,
        "Conditionnel présent": True,
        "Conditionnel passé": True,
        "Subjonctif présent": True,
        "Subjonctif passé": True,
        "Impératif": True
    }
    return jsonify(result)

#gut
@auth.route(app, "/training", required_role=["student"], methods=['GET'])
def training():
    try:
        unit_id = request.args.get("unit")
        selected_tenses = request.args.get("tenses")  # z.B. "Présent,Passé composé"
        if not unit_id or not selected_tenses:
            return jsonify({"error": 1, "message": "unit_id oder tenses fehlen"}), 400

        selected_tenses_list = selected_tenses.split(",")

        with auth.open() as (connection, cursor):
            # alle Verben_id zur unit_id
            cursor.execute("SELECT verb_id FROM lz_verb_pro_unit WHERE unit_id = %s", (unit_id,))
            verb_ids = [row["verb_id"] for row in cursor.fetchall()]
            #alle verben mit verbi_id
            format_strings = ','.join(['%s'] * len(verb_ids))
            cursor.execute(f"SELECT verb FROM lz_verb WHERE verb_id IN ({format_strings})", tuple(verb_ids))
            verbs = [row["verb"] for row in cursor.fetchall()]


        # Prompt für  KI
        prompt = f"""
        Du bist ein Französischlehrer. Erstelle genau 10 französische Lückensätze, um die Konjugation zu üben.
        - Verwende die folgenden Verben: {', '.join(verbs)}.
        - Nutze ausschließlich die folgenden Zeitformen und verwende jede mindestens einmal: {', '.join(selected_tenses_list)}.
        - Verwende auf keinen Fall andere Zeitformen als die die ich dir vorgegeben habe.
        - Jeder Satz soll grammatikalisch korrekt sein und eine eindeutige, klar erkennbare Konjugation enthalten.

        Erwartetes Ausgabeformat als JSON (Liste mit 10 Objekten, ohne zusätzlichen Text drumherum):
        [
          {{
            "start": "Quand j’étais petit, je",
            "infinitive": "jouer",
            "solution": "jouais",
            "tense": "Imparfait",
            "end": "au foot tous les jours."
          }},
          ...
        ]
        """
        # KI-Modell
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800,
            temperature=0.7,
        )

        # 4. Antwort parsen ???
        ai_result = response.choices[0].message.content.strip()

        # JSON sicher parsen ???
        import json
        try:
            sentences = json.loads(ai_result)
        except json.JSONDecodeError:
            return jsonify({"error": 1, "message": "KI-Antwort konnte nicht als JSON interpretiert werden."}), 500

        return jsonify(sentences)

    except Exception as e:
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

#gut
@auth.route(app, "/verify", required_role=["student"], methods=["POST"])
def verify():
    user_id = g.get("user_id")
    data = request.get_json()
    score = data.get("score")  # {"Présent": [0,0], ...}

    if not score:
        return jsonify({"error": 1, "message": "Kein Score-Daten erhalten."}), 400

    try:
        with auth.open() as (connection, cursor):
            # Prüfen ob Fortschrittseintrag existiert
            cursor.execute("SELECT * FROM lz_fortschritt WHERE user_id = %s", (user_id,))
            existing = cursor.fetchone()

            # Mapping von Zeitform-Namen auf Datenbank-Spaltennamen
            zeitform_mapping = {
                "Présent": ("present_right", "present_all"),
                "Passé composé": ("passe_compose_right", "passe_compose_all"),
                "Imparfait": ("imparfait_right", "imparfait_all"),
                "Plus-que-parfait": ("plus-que-parfait_right", "plus-que-parfait_all"),
                "Futur simple": ("futur_simple_right", "futur_simple_all"),
                "Conditionnel présent": ("conditionnel_present_right", "conditionnel_present_all"),
                "Conditionnel passé": ("conditionnel_passe_right", "conditionnel_passe_all"),
                "Subjonctif présent": ("subjonctif_present_right", "subjonctif_present_all"),
                "Subjonctif passé": ("subjonctif_passe_right", "subjonctif_passe_all"),
                "Impératif": ("imperatif_right", "imperatif_all")
            }

            if existing:
                # UPDATE: Bestehende Werte addieren
                update_fields = []
                update_values = []

                for zeitform, (right_field, all_field) in zeitform_mapping.items():
                    right, all_ = score.get(zeitform, (0, 0))

                    if all_ == 0:
                        continue  # Zeitform nicht geübt → überspringen

                    update_fields.append(f"{right_field} = {right_field} + %s")
                    update_values.append(right)

                    update_fields.append(f"{all_field} = {all_field} + %s")
                    update_values.append(all_)

                if update_fields:
                    sql_update = f"UPDATE lz_fortschritt SET {', '.join(update_fields)} WHERE user_id = %s"
                    cursor.execute(sql_update, (*update_values, user_id))
                    connection.commit()

            else:
                # INSERT: Neue Zeile anlegen
                columns = ["user_id"]
                values = [user_id]
                placeholders = ["%s"]

                for zeitform, (right_field, all_field) in zeitform_mapping.items():
                    right, all_ = score.get(zeitform, (0, 0))

                    if all_ == 0:
                        continue  # Zeitform nicht geübt → überspringen

                    columns.append(right_field)
                    placeholders.append("%s")
                    values.append(right)

                    columns.append(all_field)
                    placeholders.append("%s")
                    values.append(all_)

                if len(columns) > 1:  # Es gibt was zum Einfügen
                    sql_insert = f"INSERT INTO lz_fortschritt ({', '.join(columns)}) VALUES ({', '.join(placeholders)})"
                    cursor.execute(sql_insert, tuple(values))
                    connection.commit()

        return '', 204  # Erfolg, keine Antwort nötig

    except Exception as e:
        return jsonify({"error": 1, "message": f"Fehler beim Speichern des Fortschritts: {str(e)}"}), 500

#gut
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

#gut
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

#gut
@auth.route(app, "/upload", required_role=["teacher"], methods=["POST"])
def upload():
    try:
        text = request.form.get('text', '')
        files = request.files.getlist('pdfs')

        # PDF-Inhalt extrahieren
        pdf_texts = []
        for pdf_file in files:
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                content = page.extract_text()
                if content:
                    pdf_texts.append(content.strip())

        #  PDF + Text
        full_text = "\n".join([text] + pdf_texts)



        # KI-Prompt
        prompt = f"""
        Hier ist eine Liste von französischen Verben (Infinitivform). Bitte gib diese als JSON-Dictionary zurück, 
        nummeriert ab 1, in folgendem Beispielformat das ausschliesslich als Beispiel fungieren soll: 
        {{'1': 'manger', '2': 'parler', '3': 'aller', ...}}.

        Wichtig:
        - Gib **nur das Dictionary** zurück – keine Erklärungen, kein Fließtext.
        - Vermeide **Doppelungen** – jeder Eintrag soll nur einmal vorkommen.
        - Wenn Zeilen leer oder ungültig sind, ignoriere sie.

        *** VERBEN ***
        {full_text}
        """

        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        raw_output = response.choices[0].message.content.strip()
        # Versuch, die Ausgabe als JSON zu laden
        try:
            verbs = json.loads(raw_output)
        except Exception:
            traceback.print_exc()
            verbs = {"error": "Formatierung konnte nicht gelesen werden", "raw": raw_output}

        return jsonify({'verbs': verbs})

    except Exception as e:
        traceback.print_exc()
    return jsonify({"error": 1, "message": f"Fehler beim Hochladen oder Verarbeiten: {str(e)}"}), 500

#gut
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

#funktioniert nicht
@auth.route(app, "/createunit", required_role=["teacher"], methods=["POST"])
def createunit():
    try:
        data = request.get_json()
        verbs = data.get("unit", {}).get("verbs", [])
        print(verbs)
        unit_name = data.get("unit", {}).get("unit_name", "")
        print(unit_name)
        class_ids = data.get("unit", {}).get("selected_classes", [])
        print(class_ids)

        if not verbs or not unit_name or not class_ids:
            return jsonify({"error": 1, "message": "Fehlende Eingabedaten"}), 400

        with auth.open() as (connection, cursor):
            # 1. Neue Unit erstellen
            cursor.execute("INSERT INTO lz_unit (unit_name) VALUES (%s)", (unit_name,))
            new_unit_id = cursor.lastrowid

            # 3. Neue Einträge in lz_unit_pro_klass erstellen
            for class_id in class_ids:
                cursor.execute(
                    "INSERT INTO lz_unit_pro_klass (klasse_id, unit_id) VALUES (%s, %s)",
                    (class_id, new_unit_id)
                )

            # 4. Verben in lz_verb speichern
            verb_ids = []
            for verb in verbs:
                cursor.execute(
                    "INSERT INTO lz_verb (verb) VALUES (%s)", (verb,)
                )
                verb_id = cursor.lastrowid
                verb_ids.append(verb_id)

            # 5. Verknüpfung zwischen Verben und Unit speichern
            for verb_id in verb_ids:
                cursor.execute(
                    "INSERT INTO lz_verb_pro_unit (unit_id, verb_id) VALUES (%s, %s)",
                    (new_unit_id, verb_id)
                )

            # Alles speichern
            connection.commit()

        return jsonify({"error": 0, "message": "Unit erfolgreich erstellt"}), 201

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500

#funktioniert nicht
@auth.route(app, "/saveunit", required_role=["teacher"], methods=['POST'])
def saveunit():
    try:
        data = request.get_json()
        new_unit = data.get("unit")
        verbs = new_unit['verbs']
        unit_name = new_unit['unit_name']
        unit_id = new_unit['unit_id']
        class_ids = new_unit['selected_classes']
        with auth.open() as (connection, cursor):

            ### 1. Unit Name prüfen und ggf. aktualisieren
            cursor.execute("SELECT unit_name FROM lz_unit WHERE unit_id = %s", (unit_id,))
            existing_unit = cursor.fetchone()

            if existing_unit and existing_unit['unit_name'] != unit_name:
                cursor.execute(
                    "UPDATE lz_unit SET unit_name = %s WHERE unit_id = %s",
                    (unit_name, unit_id)
                )

            ### 3. Verbindungen Unit <-> Klassen prüfen und ergänzen
            cursor.execute("SELECT klasse_id FROM lz_unit_pro_klass WHERE unit_id = %s", (unit_id,))
            existing_class_ids = [row['klasse_id'] for row in cursor.fetchall()]

            for class_id in class_ids:
                if class_id not in existing_class_ids:
                    cursor.execute(
                        "INSERT INTO lz_unit_pro_klass (klasse_id, unit_id) VALUES (%s, %s)",
                        (class_id, unit_id)
                    )

            ### 4. Verben prüfen, neue Verben speichern
            verb_ids = []

            if verbs:
                format_strings = ','.join(['%s'] * len(verbs))
                cursor.execute(
                    f"SELECT verb_id, verb FROM lz_verb WHERE verb IN ({format_strings})",
                    tuple(verbs)
                )
                existing_verbs = {row['verb']: row['verb_id'] for row in cursor.fetchall()}

                for verb in verbs:
                    if verb in existing_verbs:
                        verb_ids.append(existing_verbs[verb])
                    else:
                        cursor.execute(
                            "INSERT INTO lz_verb (verb) VALUES (%s)",(verb,)
                        )
                        new_verb_id = cursor.lastrowid
                        verb_ids.append(new_verb_id)


            ### 5. Verbindungen Unit <-> Verben prüfen und ergänzen
            cursor.execute("SELECT verb_id FROM lz_verb_pro_unit WHERE unit_id = %s", (unit_id,))
            existing_verb_ids = [row['verb_id'] for row in cursor.fetchall()]

            for verb_id in verb_ids:
                if verb_id not in existing_verb_ids:
                    cursor.execute(
                        "INSERT INTO lz_verb_pro_unit (unit_id, verb_id) VALUES (%s, %s)",
                        (unit_id, verb_id)
                    )

            connection.commit()
            return '', 204

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": 1, "message": f"Interner Fehler beim Speichern der Unit: {str(e)}"}), 500

#funktioniert nicht
@auth.route(app, "/deleteunit", required_role=["teacher"], methods=['POST','GET'])
def deleteunit():
    print("Delete unit")
    unit_id = request.args.get('unit_id')
    print(unit_id)

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
        print("Fehler in /deletunit:", str(e))
        traceback.print_exc()
        return jsonify({"error": 1, "message": f"Interner Fehler: {str(e)}"}), 500


if __name__ == '__main__':
    app.run()
