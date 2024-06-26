from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .. import models
from ..serializers import StockSerializer
from ..Components.CustomError import CustomException
from ..services.create_stock import create_stock_item


@api_view(["GET", "POST"])
def stock(request):
    if request.method == "GET":
        items = models.Stock.objects.all()

        serializer = StockSerializer(items, many=True)

        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )
    elif request.method == "POST":
        if not request.user.is_authenticated:
            return Response(
                {"error": "You must be authenticated to access this route."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to access this route."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            itemData = {
                "name": request.data.get("name"),
                "category": request.data.get("category"),
                "low_stock_threshold": request.data.get("low_stock_threshold"),
                "is_service": request.data.get("is_service"),
                "type": request.data.get("type"),
            }
            newSale = create_stock_item(itemData)
            print(newSale)
            return Response(newSale["data"], status=newSale["status"])
        except models.Stock.DoesNotExist:
            return Response(
                {"error": "Item does not exist."}, status=status.HTTP_404_NOT_FOUND
            )
        except CustomException as e:
            return Response({"error": e.msg}, status=e.code)


@api_view(["GET", "PATCH", "DELETE"])
def getItem(request, id):
    if request.method == "GET":
        try:
            item = models.Stock.objects.get(id=id)
            serializer = StockSerializer(item)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        except models.Stock.DoesNotExist:
            return Response(
                {"status": False, "error": f"Item with ID `{id}` does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

    elif request.method == "PATCH":
        pass
    elif request.method == "DELETE":
        if not request.user.is_authenticated:
            return Response(
                {"error": "You must be authenticated to access this route."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not request.user.is_staff:
            return Response(
                {"error": "You do not have permission to access this route."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            item = models.Stock.objects.get(id=id).delete()
            return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
        except models.Stock.DoesNotExist:
            return Response(
                {"error": f"Item does with ID `{id}`not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )
