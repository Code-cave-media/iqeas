from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from . import views

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  #to get the access token and refresh token
    path('login/get/profile/', views.get_tokens_for_user), # to get jwt tokens alogn with user credentials
    path('create/new/password', views.get_tokens_for_user),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create/user/' , views.CreateUser),    
    path('user/delete/<int:pk>/' , views.DeleteUser),    
    path('user/update/<int:pk>/' , views.UpdateUser) ,   
    path('user/update/password/<int:pk>/' , views.reset_password)    
]
