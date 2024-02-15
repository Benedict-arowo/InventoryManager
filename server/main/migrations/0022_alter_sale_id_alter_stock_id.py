# Generated by Django 5.0 on 2024-02-15 13:36

import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0021_sale_amount_paid_sale_status_alter_sale_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='sale',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='stock',
            name='id',
            field=models.UUIDField(default=uuid.UUID('6bee1ce6-a69e-49c1-9277-2f53b9fcc62f'), editable=False, primary_key=True, serialize=False),
        ),
    ]
