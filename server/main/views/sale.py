from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .. import models
from ..serializers import SaleSerializer
import datetime
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from ..Components.CustomError import CustomException
from ..Components.sale.deleteSales import deleteSales

PAYMENT_METHOD_LIST = ["CASH", "CARD", "TRANSFER"]


def get_sales(date_str, end_date_str):
    if not date_str:
        date_str = datetime.date.today().strftime("%Y-%m-%d")
    if end_date_str:
        try:
            end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
        except ValueError:
            return {
                "data": {"error": "Invalid end date format. Use YYYY-MM-DD."},
                "status": status.HTTP_400_BAD_REQUEST,
            }

    try:
        date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {
            "data": {"error": "Invalid date format. Use YYYY-MM-DD."},
            "status": status.HTTP_400_BAD_REQUEST,
        }

    if end_date_str and end_date < date:
        return {
            "data": {"error": "End date must be greater than or equal to start date."},
            "status": status.HTTP_400_BAD_REQUEST,
        }

    filters = {}
    if not end_date_str:
        filters["created_at__date"] = date
    if end_date_str:
        filters["created_at__date__range"] = [date, end_date]
    # if name:
    #     filters["name__icontains"] = name

    # Filter sales based on the provided date
    sales = models.Sale.objects.filter(**filters).order_by("created_at")

    serializer = SaleSerializer(sales, many=True)
    return {
        "data": {"success": True, "data": serializer.data},
        "status": status.HTTP_200_OK,
    }


def create_sale(request):
    name = request["name"]
    quantity = request["quantity"]
    price = request["price"]
    amount_paid = request["amount_paid"]
    payment_method = request["payment_method"]
    user = request["user"]

    if not name:
        raise CustomException("name must be provided.", status.HTTP_400_BAD_REQUEST)
    if not quantity:
        raise CustomException("quantity must be provided.", status.HTTP_400_BAD_REQUEST)
    if not price:
        raise CustomException("price must be provided.", status.HTTP_400_BAD_REQUEST)
    if amount_paid != 0 and not amount_paid:
        raise CustomException(
            "amount_paid must be provided.", status.HTTP_400_BAD_REQUEST
        )
    if payment_method and not payment_method.upper() in PAYMENT_METHOD_LIST:
        raise CustomException(
            "valid payment_method must be provided.", status.HTTP_400_BAD_REQUEST
        )

    # To make it case insensitive
    name = name.lower()

    try:
        # There could be more than one item, having different prices hence why we need to make sure we only have one item.
        item = models.Stock.objects.filter(name=name)

        if len(item) == 0:
            raise models.Stock.DoesNotExist("Item does not exist")

        if len(item) > 1:
            # If there are more than one item, we ask for a price, and find the item based on the price.
            if not price:
                raise CustomException(
                    "price must be provided for this sale.", status.HTTP_400_BAD_REQUEST
                )
            item = get_object_or_404(models.Stock, name=name, price_per_unit=price)
        else:
            item = item[0]

        # If item is not a serivce, that's means they're buying an actual item that we have in stock hence why we make sure we have the item in stock.
        if not item.is_service:
            if item.quantity == 0:
                raise CustomException(
                    "This item is currently out of stock.", status.HTTP_400_BAD_REQUEST
                )
            if item.quantity < quantity:
                raise CustomException(
                    "Quantity is too high.", status.HTTP_400_BAD_REQUEST
                )
            if item.price_per_unit > price:
                raise CustomException(
                    "Invalid item price.", status.HTTP_400_BAD_REQUEST
                )
            # TODO: Check item's stock quantity
    except models.Stock.DoesNotExist:
        raise models.Stock.DoesNotExist("Item does not exist")

    # status & amount_paid

    item_total = price * quantity
    # If the amount_paid is greater than the item total, a change must be given back, it calculates that and saves the amount.
    change = amount_paid - item_total

    # Checks if the item is fully paid, a debt, or pending.
    if amount_paid >= item_total:
        itemStatus = "paid"
    elif amount_paid == 0:
        itemStatus = "debt"
    else:
        itemStatus = "pending"

    if amount_paid and not payment_method:
        raise CustomException(
            "payment_method must be provided.", status.HTTP_400_BAD_REQUEST
        )

    if payment_method:
        payment_method = payment_method.upper()
    else:
        payment_method = "NULL"

    # sold_by & payment method

    serializer = SaleSerializer(
        data={
            "quantity": request["quantity"],
            "price": request["price"],
            "amount_paid": request["amount_paid"],
            "user": request["user"],
        }
    )

    if serializer.is_valid():
        # Saving the new sale.
        serializer.save(
            total=item_total,
            item=item,
            status=itemStatus,
            amount_paid=amount_paid,
            payment_method=payment_method,
            sold_by=user,
            change=change,
        )

        # Updating the stock only if the item is not a service.
        if not item.is_service:
            item.quantity_sold = item.quantity_sold + quantity
            item.quantity = item.quantity - quantity
            item.save()

        return {
            "data": {"success": True, "data": serializer.data},
            "status": status.HTTP_201_CREATED,
        }
    raise Exception(serializer.errors, status.HTTP_500_INTERNAL_SERVER_ERROR)


def edit_sale(request, id):
    try:
        sale = models.Sale.objects.get(id=id)
    except models.Sale.DoesNotExist:
        return {
            "error": f"Sale with ID `{id}` not found.",
            status: status.HTTP_404_NOT_FOUND,
        }

    price_per_unit = request.data.get("price_per_unit")
    new_quantity = request.data.get("quantity")
    # price_per_unit, quantity_sold = request['data'].values()
    # Item

    InStock = models.Stock.objects.get(name=sale.item.name)
    if new_quantity:
        # Adds back the previous quantity, and removes the new quantity that has been given
        if new_quantity > InStock.quantity + sale.quantity:
            return {
                "error": {"error": "Quantity is too high."},
                "status": status.HTTP_400_BAD_REQUEST,
            }

        InStock.quantity = (InStock.quantity + sale.quantity) - new_quantity
        InStock.quantity_sold = (InStock.quantity_sold - sale.quantity) + new_quantity
        InStock.save()

        # Updates the sale item.
        sale.quantity = new_quantity
        sale.total = new_quantity * InStock.price_per_unit
        sale.save()

        serializer = SaleSerializer(sale)
        return {
            "data": {"success": True, "data": serializer.data},
            "status": status.HTTP_201_CREATED,
        }

    return {"data": {"success": sale, "data": sale}, "status": status.HTTP_200_OK}


@swagger_auto_schema(
    method="GET",
    manual_parameters=[
        openapi.Parameter(
            "date",
            openapi.IN_QUERY,
            description="Start date for sales data",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE,
            pattern="^\d{4}-\d{2}-\d{2}$",
            example="2023-01-21",
        ),
        openapi.Parameter(
            "end-date",
            openapi.IN_QUERY,
            description="End date for sales data",
            type=openapi.TYPE_STRING,
            format=openapi.FORMAT_DATE,
            pattern="^\d{4}-\d{2}-\d{2}$",
            example="2023-05-21",
        ),
        openapi.Parameter(
            "name",
            openapi.IN_QUERY,
            description="Filter sales by name",
            type=openapi.TYPE_STRING,
            example="Coke",
        ),
    ],
    responses={
        200: SaleSerializer(many=True),
        status.HTTP_400_BAD_REQUEST: "Bad Request",
    },
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid query parameters provided or wrong date format.",
    },
)
@swagger_auto_schema(
    method="POST",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "name": openapi.Schema(type=openapi.TYPE_STRING, example="Coke"),
            "quantity": openapi.Schema(type=openapi.TYPE_INTEGER, example=10),
            "price": openapi.Schema(type=openapi.TYPE_INTEGER, example=300),
        },
        required=["name", "quantity"],
    ),
    responses={
        201: SaleSerializer(),
        status.HTTP_400_BAD_REQUEST: "Bad Request",
        status.HTTP_401_UNAUTHORIZED: "Unauthorized",
        status.HTTP_404_NOT_FOUND: "Not Found",
    },
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid input data",
        status.HTTP_401_UNAUTHORIZED: "Unauthorized - User is not authenticated or lacks permission",
        status.HTTP_404_NOT_FOUND: "Not Found - Item does not exist on the server",
    },
)
@api_view(["GET", "POST"])
def sales(request):
    if request.method == "GET":
        date_str = request.GET.get("date")
        end_date_str = request.GET.get("end-date")
        name = request.GET.get("name")

        getSale = get_sales(date_str=date_str, end_date_str=end_date_str)
        return Response(getSale["data"], status=getSale["status"])
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
            saleData = {
                "name": request.data.get("name"),
                "quantity": request.data.get("quantity"),
                "price": request.data.get("price"),
                "amount_paid": request.data.get("amount_paid"),
                "user": request.user,
                "payment_method": request.data.get("payment_method"),
            }
            newSale = create_sale(saleData)
            return Response(newSale["data"], status=newSale["status"])
        except models.Stock.DoesNotExist:
            return Response(
                {"error": "Item does not exist."}, status=status.HTTP_404_NOT_FOUND
            )
        except CustomException as e:
            return Response({"error": e.msg}, status=e.code)


@api_view(["GET", "PATCH", "DELETE"])
def sale(request, id):
    if request.method == "GET":
        try:
            sale = models.Sale.objects.get(id=id)
            serializer = SaleSerializer(sale)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        except models.Sale.DoesNotExist:
            return Response(
                {"error": f"Sale with ID `{id}` not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
    elif request.method == "PATCH":
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
        # saleData = {
        #     "id": id,
        #     "data": {
        #         "name": request.data.get('name'),
        #         "price_per_unit": request.data.get('price_per_unit'),
        #         "quantity_sold": request.data.get('quantity_sold'),
        #     }
        # }

        newSale = edit_sale(request, id)
        if "data" in newSale:
            return Response(newSale["data"], status=newSale["status"])
        else:
            return Response(newSale["error"], status=newSale["status"])

    elif request.method == "DELETE":
        # try:
        #     sale = deleteSales(request, id)
        #     return Response(sale.data, status=sale.status)
        # except models.Sale.DoesNotExist:
        #     return Response(
        #         {"error": f"Sale with ID `{id}` not found."},
        #         status=status.HTTP_404_NOT_FOUND,
        #     )
        # except CustomException as e:
        #     return Response({"error": e}, status=e.code)

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
            sale_data = deleteSales(id)
            return Response({"data": sale_data["data"]}, status=sale_data["status"])

        except models.Sale.DoesNotExist:
            return Response(
                {"error": f"Sale with ID `{id}` not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except CustomException as e:
            return Response({"error": str(e)}, status=e.code)
