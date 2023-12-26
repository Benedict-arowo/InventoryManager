from rest_framework import serializers
from .models import Sale, Stock, Expence

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = '__all__'

class ExpencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expence
        fields = '__all__'