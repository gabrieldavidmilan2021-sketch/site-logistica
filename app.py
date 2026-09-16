from flask import Flask, jsonify, request, send_from_directory
import sqlite3, json, os

BASE = os.path.dirname(os.path.abspath(__file__))
DB = os.environ.get("DB_PATH", os.path.join(BASE, "loja.db"))
app = Flask(__name__, static_folder=".", static_url_path="")

DEFAULT = {"vendas": [], "gastos": [], "investimentos": [], "tarefas": [], "produtos": []}

def normalize_data(data):
    source = data if isinstance(data, dict) else {}
    # Mantém campos adicionais para que versões futuras não descartem informações.
    normalized = dict(source)
    for key in DEFAULT:
        normalized[key] = source.get(key, []) if isinstance(source.get(key, []), list) else []
    return normalized

def init_db():
    with sqlite3.connect(DB) as con:
        con.execute("CREATE TABLE IF NOT EXISTS loja_data (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL)")
        row = con.execute("SELECT data FROM loja_data WHERE id=1").fetchone()
        if not row:
            con.execute("INSERT INTO loja_data(id,data) VALUES(1,?)", (json.dumps(DEFAULT, ensure_ascii=False),))

def read_data():
    with sqlite3.connect(DB) as con:
        row = con.execute("SELECT data FROM loja_data WHERE id=1").fetchone()
    try:
        data = json.loads(row[0]) if row else {}
    except Exception:
        data = {}
    return normalize_data(data)

def write_data(data):
    merged = normalize_data(data)
    with sqlite3.connect(DB) as con:
        con.execute("UPDATE loja_data SET data=? WHERE id=1", (json.dumps(merged, ensure_ascii=False),))

@app.get("/api/data")
def api_get_data():
    return jsonify(read_data())

@app.post("/api/data")
def api_save_data():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"ok": False, "error": "Dados inválidos"}), 400
    write_data(data)
    return jsonify({"ok": True, "data": read_data()})

@app.get("/")
def index():
    return send_from_directory(BASE, "index.html")

@app.get("/<path:path>")
def static_files(path):
    return send_from_directory(BASE, path)

init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
