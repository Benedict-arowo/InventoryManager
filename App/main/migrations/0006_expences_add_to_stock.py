# Generated by Django 5.0 on 2023-12-24 19:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_alter_sale_item_expences'),
    ]

    operations = [
        migrations.AddField(
            model_name='expences',
            name='add_to_stock',
            field=models.BooleanField(default=False),
        ),
    ]