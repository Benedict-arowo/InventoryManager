from rest_framework.response import Response
from rest_framework import status
from ... import models
from ...Components.CustomError import CustomException


def deleteSales(id):
    # if not request.user.is_authenticated:
    #     return Response(
    #         {"error": "You must be authenticated to access this route."},
    #         status=status.HTTP_401_UNAUTHORIZED,
    #     )

    # if not request.user.is_staff:
    #     return Response(
    #         {"error": "You do not have permission to access this route."},
    #         status=status.HTTP_401_UNAUTHORIZED,
    #     )

    try:
        sale = models.Sale.objects.get(id=id)
        item = models.Stock.objects.get(name=sale.name)

        # Add's the item back to the stock
        item.quantity = item.quantity + sale.quantity
        item.quantity_sold = item.quantity_sold - sale.quantity
        item.save()

        # Delete the sale
        sale.delete()

        return {"data": {"success": True}, "status": status.HTTP_204_NO_CONTENT}
    except models.Sale.DoesNotExist:
        raise CustomException("Quantity not found.", status.HTTP_404_NOT_FOUND)
    except Exception as e:
        raise CustomException(str(e), code=status.HTTP_500_INTERNAL_SERVER_ERROR)
