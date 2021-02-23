from django.urls import re_path, include, path
from rest_framework.routers import DefaultRouter

from xadmin_api import views
from xadmin_api.views import LoginView, CurrentUserView, UserSendCaptchaView, \
    UploadView, MenuView, UserChangePasswordView, UserLogoutView
from xadmin_api.views import TyAdminSysLogViewSet, TyAdminEmailVerifyRecordViewSet

router = DefaultRouter(trailing_slash=False)

router.register('permission', views.PermissionViewSet)
router.register('group', views.GroupViewSet)
router.register('user', views.UserViewSet)
router.register('content_type', views.ContentTypeViewSet)
router.register('ty_admin_sys_log', TyAdminSysLogViewSet)
router.register('ty_admin_email_verify_record', TyAdminEmailVerifyRecordViewSet)

urlpatterns = [
    re_path('^', include(router.urls)),
    path('login/account', LoginView.as_view(), name='   user_login'),
    path('currentUser', CurrentUserView.as_view(), name='user_current_user'),
    path('logout', UserLogoutView.as_view(), name='logout'),
    path('sendEmailCaptcha', UserSendCaptchaView.as_view(), name='user_send_captcha'),
    path('upload', UploadView.as_view(), name="rich_upload"),
    path('sys/menu', MenuView.as_view(), name="sys_menu"),
    path('change_password', UserChangePasswordView.as_view(), name="change_password"),
]
