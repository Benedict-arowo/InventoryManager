from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ..models import Sale, Stock
from ..Components.CustomError import CustomException
from ..serializers import SaleSerializer


@api_view(["GET"])
def get_sales_by_name(request, name):
    if request.method == "GET":
        item = Stock.objects.get(name=name)
        if not item:
            raise CustomException("Item not found", status.HTTP_400_BAD_REQUEST)
        sales = Sale.objects.filter(item=item)

        return Response(
            {"success": True, "data": SaleSerializer(sales, many=True).data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def get_all_sales(request):
    if request.method == "GET":
        sales = Sale.objects.all()
        return Response(
            {"success": True, "data": SaleSerializer(sales, many=True).data},
            status=status.HTTP_200_OK,
        )
    pass
