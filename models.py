from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class WarehouseOperation(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    date = db.Column(db.String(50))
    shift = db.Column(db.String(50))
    outbound_area = db.Column(db.String(100))
    area_group = db.Column(db.String(50))
    belt = db.Column(db.String(50))

    package_volume = db.Column(db.Integer)
    gross_volume = db.Column(db.Integer)
    scanned_volume = db.Column(db.Integer)
    staffing_level = db.Column(db.Integer)
    hours = db.Column(db.Float)
    paid_day = db.Column(db.Float)
    throughput = db.Column(db.Float)
    actual_pph = db.Column(db.Float)
    planned_pph = db.Column(db.Float)
    planned_hours = db.Column(db.Float)
    overtime_hours = db.Column(db.Float)
    notes = db.Column(db.Text)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "shift": self.shift,
            "outbound_area": self.outbound_area,
            "area_group": self.area_group,
            "belt": self.belt,
            "package_volume": self.package_volume,
            "gross_volume": self.gross_volume,
            "scanned_volume": self.scanned_volume,
            "staffing_level": self.staffing_level,
            "hours": self.hours,
            "paid_day": self.paid_day,
            "throughput": self.throughput,
            "actual_pph": self.actual_pph,
            "planned_pph": self.planned_pph,
            "planned_hours": self.planned_hours,
            "overtime_hours": self.overtime_hours,
            "notes": self.notes or "",
        }


class TrailerCubeRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    date = db.Column(db.String(50))
    shift = db.Column(db.String(50))
    trailer_id = db.Column(db.String(80))
    destination = db.Column(db.String(120))
    pd = db.Column(db.String(50))
    belt = db.Column(db.String(80))
    package_count = db.Column(db.Integer)
    used_cube = db.Column(db.Float)
    trailer_capacity = db.Column(db.Float)
    load_quality = db.Column(db.String(50))
    departure_time = db.Column(db.String(50))
    notes = db.Column(db.Text)

    def to_dict(self):
        utilization = (self.used_cube / self.trailer_capacity) * 100 if self.trailer_capacity else 0

        return {
            "id": self.id,
            "date": self.date,
            "shift": self.shift,
            "trailer_id": self.trailer_id,
            "destination": self.destination,
            "pd": self.pd,
            "belt": self.belt,
            "package_count": self.package_count,
            "used_cube": self.used_cube,
            "trailer_capacity": self.trailer_capacity,
            "cube_utilization": round(utilization, 2),
            "load_quality": self.load_quality,
            "departure_time": self.departure_time,
            "notes": self.notes or "",
        }
