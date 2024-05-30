from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from ..models import Stock, Expence
from ..Components.CustomError import CustomException
from ..serializers import ExpencesSerializer


@api_view(["GET"])
def get_expence_by_name(request, name):
    if request.method == "GET":
        item = Stock.objects.get(name=name)
        if not item:
            raise CustomException("Item not found", status.HTTP_400_BAD_REQUEST)
        sales = Expence.objects.filter(item=item)

        return Response(
            {"success": True, "data": ExpencesSerializer(sales, many=True).data},
            status=status.HTTP_200_OK,
        )


@api_view(["GET"])
def get_all_expences(request):
    if request.method == "GET":
        sales = Expence.objects.all()
        return Response(
            {"success": True, "data": ExpencesSerializer(sales, many=True).data},
            status=status.HTTP_200_OK,
        )
    pass
