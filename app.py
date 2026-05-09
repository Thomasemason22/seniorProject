from flask import Flask, jsonify, request
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
        "message": "Operations Dashboard API Running"
    }


@app.route("/operations")
def get_operations():
    operations = WarehouseOperation.query.all()

    return jsonify([
        op.to_dict() for op in operations
    ])


def build_operation(payload):
    gross_volume = int(payload.get("gross_volume") or payload.get("package_volume") or 0)
    scanned_volume = int(payload.get("scanned_volume") or gross_volume)
    staffing_level = int(payload.get("staffing_level") or 0)
    hours = float(payload.get("hours") or 0)
    overtime_hours = float(payload.get("overtime_hours") or 0)
    paid_day = float(payload.get("paid_day") or ((staffing_level * hours) + overtime_hours))
    planned_hours = float(payload.get("planned_hours") or (gross_volume / 265 if gross_volume else 0))
    actual_pph = float(payload.get("actual_pph") or (scanned_volume / paid_day if paid_day else 0))

    return WarehouseOperation(
        date=payload.get("date"),
        shift=payload.get("shift"),
        outbound_area=payload.get("outbound_area") or payload.get("belt"),
        area_group=payload.get("area_group"),
        belt=payload.get("belt") or payload.get("outbound_area"),
        package_volume=gross_volume,
        gross_volume=gross_volume,
        scanned_volume=scanned_volume,
        staffing_level=staffing_level,
        hours=round(hours, 2),
        paid_day=round(paid_day, 2),
        throughput=round(gross_volume / staffing_level, 2) if staffing_level else 0,
        actual_pph=round(actual_pph, 2),
        planned_pph=round(gross_volume / 265, 2) if gross_volume else 0,
        planned_hours=round(planned_hours, 2),
        overtime_hours=round(overtime_hours, 2),
        notes=payload.get("notes", ""),
    )


@app.route("/operations", methods=["POST"])
def create_operation():
    operation = build_operation(request.get_json() or {})
    db.session.add(operation)
    db.session.commit()

    return jsonify(operation.to_dict()), 201


@app.route("/operations/bulk", methods=["POST"])
def create_operations_bulk():
    records = request.get_json() or []
    operations = [build_operation(record) for record in records]

    db.session.add_all(operations)
    db.session.commit()

    return jsonify([operation.to_dict() for operation in operations]), 201


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
