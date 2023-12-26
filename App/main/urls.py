from django.urls import path
from .views import sale, stock, expences

urlpatterns = [
    path('sales/', sale.sales, name="getSales"),
    path('sale/<uuid:id>', sale.sale, name="sale"),
    path('stock', stock.stock, name="stock"),
    path('expences', expences.expences, name="expences"),
    path('expence/<uuid:id>', expences.expence, name="expence"),
]
