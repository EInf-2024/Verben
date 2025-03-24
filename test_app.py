from flask import Flask, jsonify,request, render_template

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET'])
def login():
    username = request.args.get('username')
    password = request.args.get('password')
    return jsonify({"role": "S", "token": 1})

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
    unit = request.args.get('unit')
    print(unit)
    if token == '1':
        result = {"présent":True,"passé":False,"futur":True,"passé composé":True}
        return jsonify(result)








if __name__ == '__main__':
    app.run()
