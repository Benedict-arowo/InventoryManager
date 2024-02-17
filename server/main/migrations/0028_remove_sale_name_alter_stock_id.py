# Generated by Django 5.0 on 2024-02-16 20:23

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0027_sale_change_alter_stock_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sale',
            name='name',
        ),
        migrations.AlterField(
            model_name='stock',
            name='id',
            field=models.UUIDField(default=uuid.UUID('f7f78d91-05bf-492b-b87f-d4b1cc9961fa'), editable=False, primary_key=True, serialize=False),
        ),
    ]
