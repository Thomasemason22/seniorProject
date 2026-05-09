from flask import Flask, jsonify
from flask_cors import CORS

from analytics import calculate_kpis
from models import WarehouseOperation, db


app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()


@app.route("/")
def home():
    return {
        "message": "OutboundOps API Running"
    }


@app.route("/operations")
def get_operations():
    operations = WarehouseOperation.query.all()

    return jsonify([
        op.to_dict() for op in operations
    ])


@app.route("/kpis")
def get_kpis():
    return jsonify(calculate_kpis())


@app.route("/shift/<shift_name>")
def get_by_shift(shift_name):
    operations = WarehouseOperation.query.filter_by(
        shift=shift_name
    ).all()

    return jsonify([
        op.to_dict() for op in operations
    ])


if __name__ == "__main__":
    app.run(debug=True)
