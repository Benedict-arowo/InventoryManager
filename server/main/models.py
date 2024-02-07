from django.db import models
import uuid
from django.utils import timezone


# Create your models here.
class TimeStampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Sale(TimeStampMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    item = models.ForeignKey(
        "Stock", related_name="sale_stock", on_delete=models.SET_NULL, null=True
    )
    price = models.IntegerField(default=0)
    quantity = models.IntegerField(default=1)
    total = models.IntegerField(default=0, editable=False)

    def __str__(self):
        formatted_created_at = timezone.localtime(self.created_at).strftime(
            "%a %b %d %H:%M:%S %Y"
        )
        return f"{self.name} - {self.total} @ {formatted_created_at}"


class Expence(TimeStampMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    # item = models.ForeignKey("Stock", related_name="expences_stock", on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    price = models.IntegerField(default=1)
    price_per_unit = models.IntegerField(default=0)
    selling_price_per_unit = models.IntegerField(default=0)
    add_to_stock = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} - {self.quantity}"


class Stock(TimeStampMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4(), editable=False)
    name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=0)
    price_per_unit = models.IntegerField(default=0)
    quantity_sold = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=1)

    class Meta:
        unique_together = [["name", "price_per_unit"]]

    def __str__(self):
        return f"{self.name} @ {self.price_per_unit} - {self.quantity} left"

    # TODO: Expiry dates fields
