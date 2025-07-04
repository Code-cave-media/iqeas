from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from myapp.models import CustomUser
from .utils import send_welcome_email
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def CreateUser(request):
    if request.user.role == "admin":
        username = request.data["username"]
        password = request.data["password"]
        phone = request.data["phone"]
        role = request.data["role"]
        email = request.data["email"]
        is_active = request.data["is_active"]
        if is_active == "true" or "True" :
            is_active = True
        else:
            is_active = False

        NewUser = CustomUser.objects.create_user(
            username=username,
            password=password,
            email=email,
            phone_number = phone,
            is_active = is_active,
            role = role
        )
        pk_Id = NewUser.pk
        send_welcome_email(username=username ,password= password , to_email=email ,  pk_Id=pk_Id)
        responce_data = {
            "status_code" : 5000,
            "detail" : "User Created Successfully",
        }
        return Response(responce_data)
    else:
        responce_data = {
            "status_code" : 5001,
            "detail" : "Forbidden ",
        }
        return Response(responce_data)





@api_view(['POST'])
@permission_classes([IsAuthenticated])
def DeleteUser(request,pk):
    if request.user.role == "admin":
        if CustomUser.objects.filter(pk = pk).exists():
            instance = CustomUser.objects.get(pk=pk)
            instance.delete()
            responce_data = {
                "status_code" : 5000,
                "detail" : "User Deleted Successfully",
            }
            return Response(responce_data)
        else:
            responce_data = {
                "status_code" : 5001,
                "detail" : "User not found ",
            }
            return Response(responce_data)
    else:
        responce_data = {
            "status_code" : 5001,
            "detail" : "Forbidden ",
        }
        return Response(responce_data)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def UpdateUser(request ,pk):
    if request.user.role == "admin":
        if CustomUser.objects.filter(pk = pk).exists():
            username = request.data["username"]
            password = request.data["password"]
            phone = request.data["phone"]
            role = request.data["role"]
            email = request.data["email"]
            is_active = request.data["is_active"]
            if is_active == "true" or "True" :
                is_active = True
            else:
                is_active = False

            CustomUser.objects.update(
                username=username,
                password=password,
                email=email,
                phone_number = phone,
                is_active = is_active,
                role = role
            )
            responce_data = {
                "status_code" : 5000,
                "detail" : "User updated Successfully",
            }
            return Response(responce_data)
        else:
            responce_data = {
                "status_code" : 5001,
                "detail" : "No user found ",
            }
            return Response(responce_data)
    else:
        responce_data = {
                "status_code" : 5001,
                "detail" : "forbiddden",
        }
        return Response(responce_data)


@api_view(['POST'])
def get_tokens_for_user(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'is_active': user.is_active,
                'role': user.role,
            }
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=400)
    

@api_view(["POST"])
def reset_password(request , pk):
    if CustomUser.objects.filter(pk =pk ).exists():
        new_password = request.data["password"]
        user_instance = CustomUser.objects.get(pk=pk)
        user_instance.set_password(new_password)  
        user_instance.save()
        responce_data = {
                "status_code" : 5000,
                "detail" : "User password changed Successfully",
            }
        return Response(responce_data)
    else:
        responce_data = {
                "status_code" : 5001,
                "detail" : "User Not Found",
            }
        return Response(responce_data)

