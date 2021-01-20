from django_filters import rest_framework as filters
from xadmin_api.custom import DateFromToRangeFilter
from django.contrib.auth.models import Permission, Group, User
from django.contrib.contenttypes.models import ContentType
from xadmin_api.models import TyAdminSysLog, TyAdminEmailVerifyRecord



class TyAdminSysLogFilter(filters.FilterSet):
    action_time = DateFromToRangeFilter(field_name="action_time")

    class Meta:
        model = TyAdminSysLog
        exclude = []


class TyAdminEmailVerifyRecordFilter(filters.FilterSet):
    send_time = DateFromToRangeFilter(field_name="send_time")

    class Meta:
        model = TyAdminEmailVerifyRecord
        exclude = []



class PermissionFilter(filters.FilterSet):
    content_type_text = filters.CharFilter(field_name="content_type")

    class Meta:
        model = Permission
        exclude = []

class GroupFilter(filters.FilterSet):

    class Meta:
        model = Group
        exclude = []

class UserFilter(filters.FilterSet):
    last_login = DateFromToRangeFilter(field_name="last_login")
    date_joined = DateFromToRangeFilter(field_name="date_joined")

    class Meta:
        model = User
        exclude = []

class ContentTypeFilter(filters.FilterSet):

    class Meta:
        model = ContentType
        exclude = []