# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras  # returns rows as dicts

app = Flask(__name__)
CORS(app)

# ─── DB Connection ────────────────────────────────────
def get_db():
    return psycopg2.connect(
        host="localhost",
        database="speegile_native",      # 👈 your existing DB
        user="postgres",
        password="postgresql",
        port=5432
    )

# ─── CREATE ───────────────────────────────────────────
@app.route("/users", methods=["POST"])
def create_user():
    data = request.get_json()
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "INSERT INTO users (name, email, age) VALUES (%s, %s, %s) RETURNING *",
            (data["name"], data["email"], data.get("age"))
        )
        user = cur.fetchone()
        conn.commit()
        return jsonify(user), 201
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# ─── READ ALL ─────────────────────────────────────────
@app.route("/users", methods=["GET"])
def get_users():
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users ORDER BY id")
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users), 200

# ─── READ ONE ─────────────────────────────────────────
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200

# ─── UPDATE ───────────────────────────────────────────
@app.route("/users/<int:user_id>", methods=["PUT"])
def update_user(user_id):
    data = request.get_json()
    conn = get_db()
    cur  = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        cur.execute(
            "UPDATE users SET name=%s, email=%s, age=%s WHERE id=%s RETURNING *",
            (data["name"], data["email"], data.get("age"), user_id)
        )
        user = cur.fetchone()
        conn.commit()
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        cur.close()
        conn.close()

# ─── DELETE ───────────────────────────────────────────
@app.route("/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    conn = get_db()
    cur  = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = %s RETURNING id", (user_id,))
    deleted = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if not deleted:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": f"User {user_id} deleted"}), 200

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)