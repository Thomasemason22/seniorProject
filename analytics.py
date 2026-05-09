import pandas as pd

from models import WarehouseOperation


def calculate_kpis():
    records = WarehouseOperation.query.all()
    data = [record.to_dict() for record in records]

    if not data:
        return {
            "total_volume": 0,
            "total_scanned": 0,
            "avg_throughput": 0,
            "avg_staffing": 0,
            "total_overtime": 0,
            "total_paid_day": 0,
            "avg_pph": 0,
            "planned_hours": 0,
        }

    df = pd.DataFrame(data)

    return {
        "total_volume": int(df["gross_volume"].sum()),
        "total_scanned": int(df["scanned_volume"].sum()),
        "avg_throughput": round(df["throughput"].mean(), 2),
        "avg_staffing": round(df["staffing_level"].mean(), 2),
        "total_paid_day": round(df["paid_day"].sum(), 2),
        "avg_pph": round(df["actual_pph"].mean(), 2),
        "planned_hours": round(df["planned_hours"].sum(), 2),
        "total_overtime": round(df["overtime_hours"].sum(), 2),
    }
