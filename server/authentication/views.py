from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view

# Create your views here.
@api_view(['POST'])
def logout(request):      

    if not request.user.is_authenticated:    
        return Response({"error": "You must be authenticated to access this route."}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        refresh_token = request.data["refresh_token"]
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)