from xadmin_api import views
from django.urls import re_path, include, path
from rest_framework.routers import DefaultRouter


router = DefaultRouter(trailing_slash=False)

from DataConnector.views import *
            
router.register('permission', views.PermissionViewSet)
    
router.register('group', views.GroupViewSet)
    
router.register('user', views.UserViewSet)
    
router.register('content_type', views.ContentTypeViewSet)
    
router.register('data_connect', DataConnectViewSet)
                    
urlpatterns = [
        re_path('^', include(router.urls)),
    ]
    