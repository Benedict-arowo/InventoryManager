# data = {
#     "name": request.data.get("name"),
#     "category": request.data.get("category"),
#     "low_stock_threshold": request.data.get("low_stock_threshold"),
#     "is_service": request.data.get("is_service"),
#     "type": request.data.get("type"),
# }

from rest_framework import status
from ..Components.CustomError import CustomException
from ..serializers import StockSerializer
from ..models import Category


def create_stock_item(itemData):
    name = itemData["name"]
    category = itemData["category"]
    low_stock_threshold = itemData["low_stock_threshold"]
    is_service = itemData["is_service"]
    type = itemData["type"]

    if not name:
        raise CustomException("name must be provided.", status.HTTP_400_BAD_REQUEST)
    if not category:
        raise CustomException("category must be provided.", status.HTTP_400_BAD_REQUEST)

    try:
        category = Category.objects.get(name=category)
        serializer = StockSerializer(
            data={
                "name": name,
                "low_stock_threshold": low_stock_threshold,
                "is_service": is_service,
            }
        )

        if serializer.is_valid():
            serializer.save(category=category)

            return {
                "data": {"success": True, "data": serializer.data},
                "status": status.HTTP_201_CREATED,
            }

        raise CustomException(
            "Something went wrong...", status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Category.DoesNotExist:
        raise CustomException("Invalid category provided.", status.HTTP_400_BAD_REQUEST)
