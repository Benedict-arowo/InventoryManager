from django.contrib import admin
from . import models
# Register your models here.

admin.site.register(models.Sale)
admin.site.register(models.Stock)
admin.site.register(models.Expence)