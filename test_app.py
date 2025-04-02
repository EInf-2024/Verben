from flask import Flask, jsonify,request, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login', methods=['GET'])
def login():
    username = request.args.get('username')
    password = request.args.get('password')
    return jsonify({"role": str(username), "token": 1})

#

@app.route('/susView', methods=['GET'])
def toSuS():
    token = request.args.get('token')
    if token == '1':
        result = {
            'username': 'Rudolf',
            'progress': {'past': 0.1, 'future': 0.0, 'present': 1,'passé composé':.75},
            'units': {
                '1': 'Unité 1', '2': 'Unité 2', '3': 'Unité 3',
                '4': 'Unité 4', '5': 'Unité 5', '6': 'Unité 6', '7': 'Unité 7'
            }}
        return jsonify(result)



@app.route('/tenses', methods=['GET'])
def tenses():
    token = request.args.get('token')
    if token == '1':
        result = {"présent":True,"passé":False,"futur":True,"passé composé":True}
        return jsonify(result)



@app.route('/training', methods=['GET'])
def training():
    token = request.args.get('token')
    selected_tenses = request.args.get('tenses')
    unit = request.args.get('unit')
    if token == '1':
        result = [{'start':'Quand j’étais petit, je','infinitive':'jouer','solution':'jouais','tense':'Imparfait','end':'au foot tous les jours.'},
                  {'start':'Demain, nous','infinitive':'partir','solution':'partirons','tense':'Futur simple','end':' en vacances à la mer.'},
                  {'start':'Chaque été, nous ','infinitive':'aller','solution':' allions','tense':'Imparfait','end':'à la plage avec ma famille.'},
                  {'start':'Hier, ils','infinitive':'voir','solution':'ont vu','tense':'Passe compose','end':'un film très intéressant.'},
                  {'start':'Si j’avais su, je','infinitive':'ne pas venir','solution':'ne serais pas venu','tense':'Plus-que-parfait','end':'à la fête'}]
        return jsonify(result)



@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()  # Get JSON data
    score = data.get("score")  # Extract "score" object
    print("Received Score:", score)  # Debugging
    print(score["Imparfait"])
    return '', 204  # 204 No Content (no response needed)




if __name__ == '__main__':
    app.run()
