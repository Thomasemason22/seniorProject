from random import choice, randint, uniform

from faker import Faker

from app import app
from models import WarehouseOperation, db


fake = Faker()

area_profiles = [
    {
        "group": "Unload",
        "belts": [f"UL {number}" for number in range(1, 7)],
        "gross_range": (42000, 60000),
        "staffing_range": (24, 42),
        "hours_range": (6.5, 9.5),
    },
    {
        "group": "Outbounds",
        "belts": [f"PD {number}" for number in range(1, 19)],
        "gross_range": (10000, 12000),
        "scan_range": (6000, 8000),
        "staffing_range": (6, 14),
        "hours_range": (5.5, 8.5),
    },
    {
        "group": "Airsort",
        "belts": ["Airsort"],
        "gross_range": (7500, 14000),
        "staffing_range": (8, 18),
        "hours_range": (5.5, 8.0),
    },
    {
        "group": "Sort Aisle",
        "belts": [f"SRT {number}" for number in range(1, 7)],
        "gross_range": (8500, 18000),
        "staffing_range": (8, 20),
        "hours_range": (6.0, 9.0),
    },
    {
        "group": "Small Sort",
        "belts": ["Small Sort"],
        "gross_range": (6500, 15500),
        "staffing_range": (8, 22),
        "hours_range": (6.0, 8.5),
    },
    {
        "group": "Irregulars",
        "belts": ["Irregulars"],
        "gross_range": (1500, 4800),
        "staffing_range": (4, 10),
        "hours_range": (5.0, 8.0),
    },
    {
        "group": "Indirect",
        "belts": ["Indirect"],
        "gross_range": (800, 2500),
        "staffing_range": (4, 12),
        "hours_range": (5.0, 8.5),
    },
    {
        "group": "Metro",
        "belts": [f"Metro {number}" for number in range(1, 5)],
        "gross_range": (4200, 9800),
        "staffing_range": (5, 13),
        "hours_range": (5.5, 8.5),
    },
]

shifts = ["Day", "Twilight", "Night"]


def seed_database(record_count=1000):
    with app.app_context():
        db.drop_all()
        db.create_all()

        for _ in range(record_count):
            profile = choice(area_profiles)
            belt = choice(profile["belts"])
            staffing = randint(*profile["staffing_range"])
            gross_volume = randint(*profile["gross_range"])
            scanned_volume = randint(*profile["scan_range"]) if profile["group"] == "Outbounds" else 0
            hours = round(uniform(*profile["hours_range"]), 2)
            overtime_hours = round(uniform(0, 2.5), 2)

            if hours > 8:
                overtime_hours = round(overtime_hours + (hours - 8), 2)

            paid_day = round((staffing * hours) + overtime_hours, 2)
            pph_volume = scanned_volume if profile["group"] == "Outbounds" else gross_volume
            actual_pph = round(pph_volume / paid_day, 2) if paid_day else 0
            planned_pph = round(gross_volume / 265, 2)
            planned_hours = planned_pph

            record = WarehouseOperation(
                date=str(fake.date_between(start_date="-6M", end_date="today")),
                shift=choice(shifts),
                outbound_area=belt,
                area_group=profile["group"],
                belt=belt,
                package_volume=gross_volume,
                gross_volume=gross_volume,
                scanned_volume=scanned_volume,
                staffing_level=staffing,
                hours=hours,
                paid_day=paid_day,
                throughput=round(gross_volume / staffing, 2),
                actual_pph=actual_pph,
                planned_pph=planned_pph,
                planned_hours=planned_hours,
                overtime_hours=overtime_hours,
                notes="",
            )

            db.session.add(record)

        db.session.commit()


if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully.")
