from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .. import models
from ..serializers import ExpencesSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
import datetime


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
    ],
    responses={
        200: ExpencesSerializer(many=True),
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
            "price": openapi.Schema(type=openapi.TYPE_INTEGER, example=6000),
            "add_to_stock": openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            "selling_price_per_unit": openapi.Schema(
                type=openapi.TYPE_INTEGER, example=300
            ),
        },
        required=["name", "quantity", "price"],
    ),
    responses={
        201: ExpencesSerializer(),
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
def expences(request):
    if request.method == "GET":
        date_str = request.GET.get("date")
        end_date_str = request.GET.get("end-date")
        name = request.GET.get("name")

        # A month
        max_days = 30

        # If a date isn't specified, it defaults to the current date
        if not date_str:
            date_str = datetime.date.today().strftime("%Y-%m-%d")
            print(date_str)

        # If an end date is specified, it tries to format the date into a useable format
        if end_date_str:
            try:
                end_date = datetime.datetime.strptime(end_date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid end date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Tries to format the start date aka date_str into a usable format.
        try:
            date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If end date is less than start date, an error is returned.
        if end_date_str and end_date < date:
            return Response(
                {"error": "End date must be greater than or equal to start date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # If the difference between start and end date is more than the specified maximum date then an error is returned
        if end_date_str and (end_date - date).days > max_days:
            return Response(
                {
                    "error": f"Difference between given dates can't be more than {max_days}."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        filters = {}

        if not end_date_str:
            filters["created_at__date"] = date
        if end_date_str:
            filters["created_at__date__range"] = [date, end_date]
        if name:
            filters["name__icontains"] = name

        getExpences = models.Expence.objects.filter(**filters).order_by("created_at")
        serializer = ExpencesSerializer(getExpences, many=True)

        return Response(
            {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
        )
    elif request.method == "POST":
        name = request.data.get("name")
        quantity = request.data.get("quantity")
        price = request.data.get("price")
        add_to_stock = request.data.get("add_to_stock")
        selling_price_per_unit = request.data.get("selling_price_per_unit")

        if not name or not price or not quantity:
            return Response(
                {"error": "Name, price, and quantity must be provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ExpencesSerializer(data=request.data)
        if serializer.is_valid():
            try:
                if add_to_stock:
                    if selling_price_per_unit is None:
                        return Response(
                            {
                                "error": "selling_price_per_unit must be provided before being able to add item to stock."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    inStock = models.Stock.objects.get(
                        name=name, price_per_unit=selling_price_per_unit
                    )
                    inStock.quantity = inStock.quantity + quantity
                    inStock.save()
            except models.Stock.DoesNotExist:
                if add_to_stock:
                    if selling_price_per_unit is None:
                        return Response(
                            {
                                "error": "selling_price_per_unit must be provided before being able to add item to stock."
                            },
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    models.Stock.objects.create(
                        name=name,
                        quantity=quantity,
                        price_per_unit=selling_price_per_unit,
                    )

            serializer.save(price_per_unit=price / quantity)
            return Response(
                {"success": True, "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )


@swagger_auto_schema(
    method="GET",
    responses={
        status.HTTP_200_OK: ExpencesSerializer(),
        status.HTTP_400_BAD_REQUEST: "Bad Request",
        status.HTTP_404_NOT_FOUND: "Not Found",
        status.HTTP_401_UNAUTHORIZED: "Unauthorized",
    },
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid query parameters provided or wrong date format.",
        status.HTTP_401_UNAUTHORIZED: {
            "error": "You must be authenticated to access this route."
        },
        status.HTTP_404_NOT_FOUND: {"error": f"Expence with ID `{id}` not found."},
    },
)
@swagger_auto_schema(
    method="DELETE",
    responses={
        status.HTTP_204_NO_CONTENT: "No Content",
        status.HTTP_400_BAD_REQUEST: "Bad Request",
        status.HTTP_404_NOT_FOUND: "Not Found",
        status.HTTP_401_UNAUTHORIZED: "Unauthorized",
    },
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid query parameters provided or wrong date format.",
        status.HTTP_401_UNAUTHORIZED: {
            "error": "You must be authenticated to access this route."
        },
        status.HTTP_404_NOT_FOUND: {"error": "Expence with ID `id` not found."},
    },
)
@api_view(["GET", "DELETE"])
def expence(request, id):
    if request.method == "GET":
        try:
            expenceInstance = models.Expence.objects.get(id=id)
            serializer = ExpencesSerializer(expenceInstance)
            return Response(
                {"success": True, "data": serializer.data}, status=status.HTTP_200_OK
            )
        except models.Expence.DoesNotExist:
            return Response(
                {"error": f"Expence with ID `{id}` not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

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
            expenceInstance = models.Expence.objects.get(id=id)
            if expenceInstance.add_to_stock == True:
                inStock = models.Stock.objects.get(
                    name=expenceInstance.name,
                    price_per_unit=expenceInstance.selling_price_per_unit,
                )

            # if expenceInstance.add_to_stock == True and not inStock:
            # return Response({"error": f"Item is no longer in stock."}, status=status.HTTP_400_BAD_REQUEST)

            # Add's the item back to the stock
            if expenceInstance.add_to_stock == True and inStock:
                if inStock.quantity - expenceInstance.quantity < 0:
                    return Response(
                        {"error": f"Insufficient amount in stock."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                inStock.quantity = inStock.quantity - expenceInstance.quantity
                inStock.save()

            expenceInstance.delete()
            return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
        except models.Expence.DoesNotExist:
            return Response(
                {"error": f"Expence with ID `{id}` not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except models.Stock.DoesNotExist:
            return Response(
                {"error": f"Item is no longer in stock."},
                status=status.HTTP_400_BAD_REQUEST,
            )
