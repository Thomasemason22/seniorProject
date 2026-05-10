from datetime import timedelta
from random import randint, uniform

from faker import Faker

from app import app
from models import WarehouseOperation, db


fake = Faker()

BUILDING_MAX_PACKAGES_PER_HOUR = 60000
SORT_HOURS_RANGE = (3.0, 5.0)
SORT_VOLUME_RANGE = (150000, 300000)

area_profiles = [
    {
        "group": "Unload",
        "belts": [f"UL {number}" for number in range(1, 7)],
        "share": 0.20,
        "staffing_range": (18, 30),
        "hours_range": (6.5, 9.5),
    },
    {
        "group": "Outbounds",
        "belts": [f"PD {number}" for number in range(1, 19)],
        "share": 0.55,
        "scan_rate_range": (0.82, 0.96),
        "max_pd_scans": 8000,
        "staffing_range": (6, 14),
        "hours_range": (5.5, 8.5),
    },
    {
        "group": "Airsort",
        "belts": ["Airsort"],
        "share": 0.04,
        "staffing_range": (8, 18),
        "hours_range": (5.5, 8.0),
    },
    {
        "group": "Sort Aisle",
        "belts": [f"SRT {number}" for number in range(1, 7)],
        "share": 0.10,
        "staffing_range": (8, 20),
        "hours_range": (6.0, 9.0),
    },
    {
        "group": "Small Sort",
        "belts": ["Small Sort"],
        "share": 0.04,
        "staffing_range": (8, 22),
        "hours_range": (6.0, 8.5),
    },
    {
        "group": "Irregulars",
        "belts": ["Irregulars"],
        "share": 0.02,
        "staffing_range": (4, 10),
        "hours_range": (5.0, 8.0),
    },
    {
        "group": "Indirect",
        "belts": ["Indirect"],
        "share": 0.01,
        "staffing_range": (4, 12),
        "hours_range": (5.0, 8.5),
    },
    {
        "group": "Metro",
        "belts": [f"Metro {number}" for number in range(1, 5)],
        "share": 0.04,
        "staffing_range": (5, 13),
        "hours_range": (5.5, 8.5),
    },
]

shifts = ["Day", "Twilight", "Midnight"]


def spread_volume(total_volume, parts):
    weights = [uniform(0.85, 1.15) for _ in range(parts)]
    weight_total = sum(weights)
    volumes = [int(total_volume * weight / weight_total) for weight in weights]
    volumes[-1] += total_volume - sum(volumes)

    return volumes


def seed_database(days=30):
    with app.app_context():
        db.drop_all()
        db.create_all()

        start_date = fake.date_between(start_date="-6M", end_date="-1M")

        for day_offset in range(days):
            sort_date = start_date + timedelta(days=day_offset)

            for shift in shifts:
                sort_hours = uniform(*SORT_HOURS_RANGE)
                sort_capacity = int(BUILDING_MAX_PACKAGES_PER_HOUR * sort_hours)
                sort_total = randint(
                    SORT_VOLUME_RANGE[0],
                    min(SORT_VOLUME_RANGE[1], sort_capacity),
                )

                for profile in area_profiles:
                    group_total = int(sort_total * profile["share"])
                    belt_volumes = spread_volume(group_total, len(profile["belts"]))

                    for belt, gross_volume in zip(profile["belts"], belt_volumes):
                        staffing = randint(*profile["staffing_range"])
                        hours = round(uniform(*profile["hours_range"]), 2)
                        overtime_hours = round(uniform(0, 1.5), 2)

                        if hours > 8:
                            overtime_hours = round(overtime_hours + (hours - 8), 2)

                        if profile["group"] == "Outbounds":
                            scan_rate = uniform(*profile["scan_rate_range"])
                            scanned_volume = min(
                                profile["max_pd_scans"],
                                int(gross_volume * scan_rate),
                            )
                        else:
                            scanned_volume = 0

                        paid_day = round((staffing * hours) + overtime_hours, 2)
                        pph_volume = scanned_volume if profile["group"] == "Outbounds" else gross_volume
                        actual_pph = round(pph_volume / paid_day, 2) if paid_day else 0
                        planned_hours = round(gross_volume / 265, 2)

                        record = WarehouseOperation(
                            date=str(sort_date),
                            shift=shift,
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
                            planned_pph=round(gross_volume / 265, 2),
                            planned_hours=planned_hours,
                            overtime_hours=overtime_hours,
                            notes="",
                        )

                        db.session.add(record)

        db.session.commit()


if __name__ == "__main__":
    seed_database()
    print("Database seeded successfully.")
