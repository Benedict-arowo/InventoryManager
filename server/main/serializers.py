from rest_framework import serializers
from .models import Sale, Stock, Expence, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class StockSerializer(serializers.ModelSerializer):
    category = CategorySerializer(required=False, allow_null=True)

    class Meta:
        model = Stock
        fields = "__all__"


class SaleSerializer(serializers.ModelSerializer):
    item = StockSerializer(required=False, allow_null=True)

    class Meta:
        model = Sale
        fields = "__all__"


class ExpencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expence
        fields = "__all__"
