from django.urls import path
from .views import sale, stock, expences, sale_summary, expence_summary

urlpatterns = [
    path("sales/", sale.sales, name="getSales"),
    path("sale/<int:id>", sale.sale, name="sale"),
    path("stock", stock.stock, name="getStock"),
    path("stock/<uuid:id>", stock.getItem, name="stock"),
    path("expences", expences.expences, name="expences"),
    path("expence/<int:id>", expences.expence, name="expence"),
    path(
        "sale_summary/<str:name>",
        sale_summary.get_sales_by_name,
        name="sale_summary_name",
    ),
    path("sales_summary", sale_summary.get_all_sales, name="sale_summary"),
    path(
        "expence_summary/<str:name>",
        expence_summary.get_expence_by_name,
        name="expence_summary_name",
    ),
    path("expences_summary", expence_summary.get_all_expences, name="expences_summary"),
]
