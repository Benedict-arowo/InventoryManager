from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .. import models 
from ..serializers import ExpencesSerializer
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema


@swagger_auto_schema(
    method='GET',
    manual_parameters=[
        openapi.Parameter('date', openapi.IN_QUERY, description="Start date for sales data", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, pattern="^\d{4}-\d{2}-\d{2}$", example="2023-01-21"),
        openapi.Parameter('end-date', openapi.IN_QUERY, description="End date for sales data", type=openapi.TYPE_STRING, format=openapi.FORMAT_DATE, pattern="^\d{4}-\d{2}-\d{2}$", example="2023-05-21"),
    ],
    responses={200: ExpencesSerializer(many=True), status.HTTP_400_BAD_REQUEST: "Bad Request"},
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid query parameters provided or wrong date format.",
    },
)
@swagger_auto_schema(
    method='POST',
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'name': openapi.Schema(type=openapi.TYPE_STRING, example='Coke'),
            'quantity': openapi.Schema(type=openapi.TYPE_INTEGER, example=10),
            'price': openapi.Schema(type=openapi.TYPE_INTEGER, example=6000),
            'add_to_stock': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
            'selling_price_per_unit': openapi.Schema(type=openapi.TYPE_INTEGER, example=300),
        },
        required=['name', 'quantity', 'price'],
    ),
    responses={201: ExpencesSerializer(), status.HTTP_400_BAD_REQUEST: "Bad Request", status.HTTP_401_UNAUTHORIZED: "Unauthorized", status.HTTP_404_NOT_FOUND: "Not Found"},
    error_responses={
        status.HTTP_400_BAD_REQUEST: "Bad Request - Invalid input data",
        status.HTTP_401_UNAUTHORIZED: "Unauthorized - User is not authenticated or lacks permission",
        status.HTTP_404_NOT_FOUND: "Not Found - Item does not exist on the server"
    },
    
)
@api_view(['GET', 'POST'])
def expences(request):
    if request.method == 'GET':
        getExpences = models.Expence.objects.all()
        serializer = ExpencesSerializer(getExpences, many=True)
        return Response({ "success": True, "data": serializer.data }, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        name = request.data.get('name')
        quantity = request.data.get('quantity')
        price = request.data.get('price')
        add_to_stock = request.data.get('add_to_stock')
        selling_price_per_unit = request.data.get('selling_price_per_unit')

        if not name or not price or not quantity:
            return Response({"error": "Name, price, and quantity must be provided." }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ExpencesSerializer(data=request.data)
        if serializer.is_valid():
            try:
                if add_to_stock:
                    if selling_price_per_unit is None:
                        return Response({"error": "selling_price_per_unit must be provided before being able to add item to stock." }, status=status.HTTP_400_BAD_REQUEST)
                    inStock = models.Stock.objects.get(name=name, price_per_unit=selling_price_per_unit)
                    inStock.quantity = inStock.quantity + quantity
                    inStock.save()
            except models.Stock.DoesNotExist:
                if add_to_stock:
                    if selling_price_per_unit is None:
                        return Response({"error": "selling_price_per_unit must be provided before being able to add item to stock." }, status=status.HTTP_400_BAD_REQUEST)
                    models.Stock.objects.create(name=name, quantity=quantity, price_per_unit=selling_price_per_unit)

            serializer.save(price_per_unit=price/quantity)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({"error": serializer.errors }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def expence(request, id):
    if request.method == 'GET':
        try:
            expenceInstance = models.Expence.objects.get(id=id)
            serializer = ExpencesSerializer(expenceInstance)
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_200_OK)
        except models.Expence.DoesNotExist:
            return Response({"error": f"Expence with ID `{id}` not found."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'PATCH':
        if not request.user.is_authenticated:
            return Response({"error": "You must be authenticated to access this route."}, status=status.HTTP_401_UNAUTHORIZED)

        if not request.user.is_staff:
            return Response({"error": "You do not have permission to access this route."}, status=status.HTTP_401_UNAUTHORIZED)

        name = request.data.get('name')
        quantity = request.data.get('quantity')
        price = request.data.get('price')
        add_to_stock = request.data.get('add_to_stock')
        try:
            expenceInstance = models.Expence.objects.get(id=id)
            if name:
                expenceInstance.name = name

            if add_to_stock and add_to_stock == False:
                pass
            elif add_to_stock and add_to_stock == True:
                pass

            if quantity:
                expenceInstance.quantity = quantity

            if price:
                expenceInstance.price = price

            expenceInstance.save()
            serializer = ExpencesSerializer(expenceInstance)
            return Response({ 'success' : True, "data": serializer.data}, status=status.HTTP_200_OK)
        except models.Expence.DoesNotExist:
            return Response({"error": f"Expence with ID `{id}` not found."}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return Response({"error": "You must be authenticated to access this route."}, status=status.HTTP_401_UNAUTHORIZED)

        if not request.user.is_staff:
            return Response({"error": "You do not have permission to access this route."}, status=status.HTTP_401_UNAUTHORIZED)

        try:        
            expenceInstance = models.Expence.objects.get(id=id)
            inStock = models.Stock.objects.get(name=expenceInstance.name, price_per_unit=expenceInstance.price)

            # Add's the item back to the stock
            if expenceInstance.inStock:
                inStock.quantity = inStock.quantity + expenceInstance.quantity
                inStock.save()        
            return Response({"success": True}, status=status.HTTP_204_NO_CONTENT)
        except models.Sale.DoesNotExist:
            return Response({"error": f"Expence with ID `{id}` not found."}, status=status.HTTP_404_NOT_FOUND)