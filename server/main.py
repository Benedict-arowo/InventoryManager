import csv
import sqlite3
from datetime import datetime, date
import sys
import os
import argparse
from django.utils import timezone

ACCOUNTER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "accounter.settings")

import django

django.setup()

from main.models import Stock, Category, Sale, User


def import_data_from_csv(file_name, created_at_date):
    con = sqlite3.connect("db.sqlite3")
    cur = con.cursor()
    res = cur.execute("SELECT name FROM main_stock")
    itemsInStock = list(res.fetchall())
    items = []

    for item in itemsInStock:
        items.append(item[0].lower())

    # Make sure items exist in the database. If not, create them.
    with open(file_name, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        insertList = []
        for row in reader:
            if row["ID"] == "":
                break
            if not row["Name"].lower() in items:
                try:
                    price = float(row["Price Per Unit"].replace(",", ""))
                except ValueError:
                    print(row["Price Per Unit"])
                    print(f'Could not parse price for {row["Name"]}')
                    sys.exit(1)

                category, _ = Category.objects.get_or_create(name=row["Category"].capitalize())
                insertList.append(
                    Stock(
                        name=row["Name"],
                        category=category,
                        quantity=0,
                        price_per_unit=price,
                        quantity_sold=0,
                        low_stock_threshold=0,
                        is_service=False,
                        use_amount=True,
                        use_quantity=False,
                        created_at=created_at_date,
                        updated_at=created_at_date,
                    )
                )
                print(f"{row['Name']} does not exist... Creating it on `main_stock`")

        if len(insertList) != 0:
            Stock.objects.bulk_create(insertList)

        con.commit()

    with open(file_name, newline="") as csvfile:
        reader = csv.DictReader(csvfile)
        createList = []

        # Delete all records for the day first

        start_datetime = timezone.make_aware(timezone.datetime.combine(created_at_date, timezone.datetime.min.time()))
        end_datetime = timezone.make_aware(timezone.datetime.combine(created_at_date, timezone.datetime.max.time()))
        
        Sale.objects.filter(created_at__range=(start_datetime, end_datetime)).delete()

        for row in reader:
            if row["ID"] == "":
                break
            item, _ = Stock.objects.get_or_create(
                name=row["Name"],
                price_per_unit=float(row["Price Per Unit"].replace(",", "")),
            )
            
            # Add item to create item list
            createList.append(
                Sale(
                    item=item,
                    quantity=float(row["Quantity"].replace(",", "")),
                    amount_paid=float(row["Total"].replace(",", "")),
                    status="Paid",
                    price=float(row["Price Per Unit"].replace(",", "")),
                    total=float(row["Quantity"].replace(",", "")) * float(row["Price Per Unit"].replace(",", "")),
                    sold_by=User.objects.get(username="admin"),
                    created_at=created_at_date
                )
            )
            print(f"Creating {row['Name']} {row["Price Per Unit"]}")

        if len(createList) != 0:
            Sale._meta.get_field("created_at").auto_now_add = False
            Sale.objects.bulk_create(createList)
            Sale._meta.get_field('created_at').auto_now_add = True
        
    con.close()


if __name__ == "__main__":
    file_path = "../csv_files/25-02-24 - Updated.csv"  # Update with your file path
    rootDir = os.path.dirname(os.path.abspath(__file__))
    parentDir = os.path.abspath(os.path.join(rootDir, os.pardir))
    csvFilesDir = os.path.join(parentDir, "csv_files", "Feb")

    for subdir, dirs, files in os.walk(csvFilesDir):
        for file in files:
            if (file.endswith(".csv")):
                day, month, year = file.split("-")
                year = year.split(".")[0]
                file_path = os.path.join(csvFilesDir, file)
                record_date = timezone.make_aware(datetime(int('20' + year), int(month), int(day), 0, 0, 0))
                print(day, month, year)
                import_data_from_csv(file_path, record_date)


