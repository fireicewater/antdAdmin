import logging
from copy import deepcopy
from enum import Enum
from typing import Any

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import QuerySet
from django.db.models.fields.files import ImageFieldFile, FieldFile
from django.http import Http404
from django_filters import RangeFilter
from django_filters.fields import DateRangeField
from django_filters.rest_framework import DjangoFilterBackend
from django_filters.widgets import RangeWidget
from rest_framework import mixins, exceptions
from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.filters import SearchFilter
from rest_framework.generics import GenericAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework.settings import api_settings
from rest_framework.views import APIView, set_rollback
from rest_framework.viewsets import ViewSetMixin

from xadmin_api.pagination import CustomPageNumberPagination
from xadmin_api.ty_settings import MAX_LIST_DISPLAY_COUNT
from xadmin_api.utils import log_save

logger = logging.getLogger()


class ShowTypeEnum(Enum):
    # 不提示错误
    SILENT = 0
    # 警告信息提示
    WARN_MESSAGE = 1
    # 错误信息提示
    ERROR_MESSAGE = 2
    # 通知提示
    NOTIFICATION = 4
    # 页面跳转
    REDIRECT = 9


class BaseResponseData(object):
    """
       自定义统一返回
    """
    # 统一error返回
    __errors = {
        200: '服务器成功返回请求的数据。',
        201: '新建或修改数据成功。',
        202: '一个请求已经进入后台排队（异步任务）。',
        204: '删除数据成功。',
        400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
        401: '用户没有权限（令牌、用户名、密码错误）。',
        403: '没有操作权限',
        404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
        406: '请求的格式不可得。',
        410: '请求的资源被永久删除，且不会再得到的。',
        422: '当创建一个对象时，发生一个验证错误。',
        500: '服务器发生错误，请检查服务器。',
        502: '网关错误。',
        503: '服务不可用，服务器暂时过载或维护。',
        504: '网关超时。',
    }

    def __init__(self, success: bool, **kwargs):
        self.success = success
        self.data = kwargs["data"] if "data" in kwargs else None
        self.errorCode = kwargs["errorCode"] if "errorCode" in kwargs else None
        self.errorMessage = kwargs["errorMessage"] if "errorMessage" in kwargs else None
        showType = kwargs.get("showType")
        if showType:
            self.showType = showType

    @staticmethod
    def success(data: Any, **kwargs) -> Response:
        if data:
            response_data = BaseResponseData(success=True, data=data)
        else:
            response_data = BaseResponseData(success=True)
        return Response(response_data.__dict__, **kwargs)

    @staticmethod
    def error(errorCode: int, errorMessage: str = "", **kwargs) -> Response:
        if errorMessage == "":
            errorMessage = BaseResponseData.__errors[errorCode]
        data = BaseResponseData(success=False, errorCode=errorCode, errorMessage=errorMessage,
                                showType=ShowTypeEnum["ERROR_MESSAGE"].value)
        return Response(data.__dict__, **kwargs)


def custom_exception_handler(exc, context):
    logger.error('请求出错：{}'.format(exc), exc_info=True)
    error_message = ""
    # 事务回滚
    set_rollback()
    if hasattr(exc, "detail"):
        detail = exc.detail
        if isinstance(detail, list):
            for key, values in exc.detail.items():
                error_message += str(values[0])
        else:
            error_message = detail
    # 处理404 错误
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
        headers = {}
        if getattr(exc, 'auth_header', None):
            headers['WWW-Authenticate'] = exc.auth_header
        if getattr(exc, 'wait', None):
            headers['Retry-After'] = '%d' % exc.wait
        if isinstance(exc.detail, (list, dict)):
            data = exc.detail
        else:
            data = {'detail': exc.detail}
        response = Response(data, status=exc.status_code, headers=headers)
    elif isinstance(exc, exceptions.APIException):
        response = BaseResponseData.error(422, error_message)
    elif isinstance(exc, ValidationError):
        response = BaseResponseData.error(422, error_message)
    elif isinstance(exc, PermissionDenied):
        response = BaseResponseData.error(403)
    else:
        response = BaseResponseData.error(500)
    return response


class GenericViewSet(ViewSetMixin, GenericAPIView):
    """
    The GenericViewSet class does not provide any actions by default,
    but does include the base set of generic view behavior, such as
    the `get_object` and `get_queryset` methods.
    """
    pass


class MtyModelViewSet(mixins.CreateModelMixin,
                      mixins.RetrieveModelMixin,
                      mixins.UpdateModelMixin,
                      mixins.DestroyModelMixin,
                      mixins.ListModelMixin,
                      GenericViewSet):
    pass


class CsrfExemptSessionAuthentication(SessionAuthentication):

    def enforce_csrf(self, request):
        return


class MtyCustomExecView(APIView):

    def get_exception_handler(self):
        return custom_exception_handler


class CustomPermissions(permissions.DjangoModelPermissions):
    action_map = {
        "list": '%(app_label)s.view_%(model_name)s',
        "retrieve": '%(app_label)s.view_%(model_name)s',
        "create": '%(app_label)s.add_%(model_name)s',
        "update": '%(app_label)s.change_%(model_name)s',
        "destroy": '%(app_label)s.delete_%(model_name)s',
    }

    def get_action_permissions(self, action, model_cls):
        kwargs = {
            'app_label': model_cls._meta.app_label,
            'action': action,
            'model_name': model_cls._meta.model_name,
        }
        """
        Given a model and an HTTP method, return the list of permission
        codes that the user is required to have.
        """
        perm = self.action_map.get(action, '%(app_label)s.%(action)s_%(model_name)s')
        return [perm % kwargs]

    def has_permission(self, request, view):
        if not request.user or (
                not request.user.is_authenticated and self.authenticated_users_only):
            return False
        queryset = self._queryset(view)
        permissions = self.get_action_permissions(view.action, queryset.model)
        return request.user.has_perms(permissions)


class XadminViewSet(MtyModelViewSet):
    pagination_class = CustomPageNumberPagination
    filter_backends = (DjangoFilterBackend, SearchFilter)
    permission_classes = (CustomPermissions,)

    def get_exception_handler(self):
        return custom_exception_handler

    def list(self, request, *args, **kwargs):
        api_settings.DATETIME_FORMAT = '%Y-%m-%d %H:%M:%S'
        if "all" in request.query_params and len(request.query_params.keys()) == 1:
            self.pagination_class = None
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return BaseResponseData.success(data=serializer.data)

    def create(self, request, *args, **kwargs):
        try:
            # data = deepcopy(request.data)
            # del_dict = {}
            self_serializer_class = self.get_serializer_class()
            serializer = self_serializer_class(data=request.data)
            serializer.is_valid(raise_exception=True)
            # for key, value in del_dict.items():
            #     serializer.validated_data[key] = value
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            # ret = Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            ret = BaseResponseData.success(data=serializer.data, headers=headers)
            log_save(user=request.user.username, request=self.request, flag="新增",
                     message=f'{self.serializer_class.Meta.model._meta.verbose_name}: {ret.data.__str__()}被新增',
                     log_type=self.serializer_class.Meta.model._meta.model_name)
            return ret
        except DjangoValidationError as e:
            raise ValidationError(e.error_dict)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = deepcopy(request.data)
        del_dict = {}
        for key, value in request.data.items():
            if isinstance(getattr(instance, key), ImageFieldFile) and isinstance(value, str):
                print(value)
                print(self.request.META['HTTP_HOST'] + settings.MEDIA_URL)
                pure_value = value.replace("http://" + self.request.META['HTTP_HOST'] + settings.MEDIA_URL, "")
                print(pure_value)
                del_dict[key] = pure_value
                del data[key]
            elif isinstance(getattr(instance, key), FieldFile) and isinstance(value, str):
                print(value)
                print(self.request.META['HTTP_HOST'] + settings.MEDIA_URL)
                pure_value = value.replace("http://" + self.request.META['HTTP_HOST'] + settings.MEDIA_URL, "")
                print(pure_value)
                del_dict[key] = pure_value
                del data[key]
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        for key, value in del_dict.items():
            serializer.validated_data[key] = value
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        ret = BaseResponseData.success(data=serializer.data)
        log_save(user=request.user.username, request=self.request, flag="更新",
                 message=f'{self.serializer_class.Meta.model._meta.verbose_name}: {ret.data.__str__()}被更新',
                 log_type=self.serializer_class.Meta.model._meta.model_name)
        return ret

    def destroy(self, request, *args, **kwargs):
        # return Response({
        #     "演示模式"
        # },status=status.HTTP_403_FORBIDDEN)
        ids = kwargs["pk"].split(",")
        names = []
        for one in self.serializer_class.Meta.model.objects.filter(id__in=ids):
            names.append(one.__str__())
        self.serializer_class.Meta.model.objects.filter(pk__in=ids).delete()
        log_save(user=request.user.username, request=self.request, flag="删除",
                 message=f'{self.serializer_class.Meta.model._meta.verbose_name}: {"".join(names)}被删除',
                 log_type=self.serializer_class.Meta.model._meta.model_name)
        return BaseResponseData.success({})

    @action(methods=['get'], detail=False, url_path="verbose_name/?")
    def verbose_name(self, request, pk=None):
        field_list = self.serializer_class.Meta.model._meta.get_fields()
        ret = {}
        for one_field in field_list:
            key = one_field.name
            if "verbose_name" in dir(one_field):
                value = one_field.verbose_name
            else:
                value = key
            ret[key] = value
        return BaseResponseData.success(data=ret)

    @action(methods=['get'], detail=False, url_path="list_display/?")
    def list_display(self, request, pk=None):
        field_list = self.serializer_class.Meta.model._meta.get_fields()
        ret = {}
        count = MAX_LIST_DISPLAY_COUNT
        for one_field in field_list:
            if count < 0 or one_field.__class__.__name__ in ["OneToOneRel", "ManyToOneRel", "DateTimeField",
                                                             "AutoField"]:
                key = one_field.name
                if "verbose_name" in dir(one_field):
                    if key == "avatar" or "头像" in one_field.verbose_name:
                        pass
                    else:
                        ret[key] = {
                            "show": False
                        }
            else:
                print(one_field.name)
                count -= 1
        return BaseResponseData.success(data=ret)

    @action(methods=['get'], detail=False, url_path="display_order/?")
    def display_order(self, request, pk=None):
        from django.contrib import admin
        admin_order = []
        admin_include_flag = False
        for model, model_admin in admin.site._registry.items():
            if model == self.serializer_class.Meta.model:
                admin_include_flag = True
                if model_admin.fieldsets:
                    for one in model_admin.fieldsets:
                        admin_order += one[1]["fields"]
                else:
                    admin_include_flag = False
        if not admin_include_flag:
            field_list = self.serializer_class.Meta.model._meta.get_fields()
            admin_order = [one.name for one in field_list]

        field_list = self.serializer_class.Meta.model._meta.get_fields()
        table_order = [one.name for one in field_list]
        return BaseResponseData.success(data={
            'form_order': admin_order,
            'table_order': table_order,  # TODO list_display影响
        })


class DateRangeWidget(RangeWidget):
    suffixes = ['start', 'end']


class MyDateRangeField(DateRangeField):
    widget = DateRangeWidget


class DateFromToRangeFilter(RangeFilter):
    field_class = MyDateRangeField


class GenericAPIView(MtyCustomExecView):
    """
    Base class for all other generic views.
    """
    # You'll need to either set these attributes,
    # or override `get_queryset()`/`get_serializer_class()`.
    # If you are overriding a view method, it is important that you call
    # `get_queryset()` instead of accessing the `queryset` property directly,
    # as `queryset` will get evaluated only once, and those results are cached
    # for all subsequent requests.
    queryset = None
    serializer_class = None

    # If you want to use object lookups other than pk, set 'lookup_field'.
    # For more complex lookup requirements override `get_object()`.
    lookup_field = 'pk'
    lookup_url_kwarg = None

    # The filter backend classes to use for queryset filtering
    filter_backends = api_settings.DEFAULT_FILTER_BACKENDS

    # The style to use for queryset pagination.
    pagination_class = api_settings.DEFAULT_PAGINATION_CLASS

    def get_queryset(self):
        """
        Get the list of items for this view.
        This must be an iterable, and may be a queryset.
        Defaults to using `self.queryset`.

        This method should always be used rather than accessing `self.queryset`
        directly, as `self.queryset` gets evaluated only once, and those results
        are cached for all subsequent requests.

        You may want to override this if you need to provide different
        querysets depending on the incoming request.

        (Eg. return a list of items that is specific to the user)
        """
        assert self.queryset is not None, (
                "'%s' should either include a `queryset` attribute, "
                "or override the `get_queryset()` method."
                % self.__class__.__name__
        )

        queryset = self.queryset
        if isinstance(queryset, QuerySet):
            # Ensure queryset is re-evaluated on each request.
            queryset = queryset.all()
        return queryset

    def get_object(self):
        """
        Returns the object the view is displaying.

        You may want to override this if you need to provide non-standard
        queryset lookups.  Eg if objects are referenced using multiple
        keyword arguments in the url conf.
        """
        queryset = self.filter_queryset(self.get_queryset())

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        assert lookup_url_kwarg in self.kwargs, (
                'Expected view %s to be called with a URL keyword argument '
                'named "%s". Fix your URL conf, or set the `.lookup_field` '
                'attribute on the view correctly.' %
                (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)

        # May raise a permission denied
        self.check_object_permissions(self.request, obj)

        return obj

    def get_serializer(self, *args, **kwargs):
        """
        Return the serializer instance that should be used for validating and
        deserializing input, and for serializing output.
        """
        serializer_class = self.get_serializer_class()
        kwargs['context'] = self.get_serializer_context()
        return serializer_class(*args, **kwargs)

    def get_serializer_class(self):
        """
        Return the class to use for the serializer.
        Defaults to using `self.serializer_class`.

        You may want to override this if you need to provide different
        serializations depending on the incoming request.

        (Eg. admins get full serialization, others get basic serialization)
        """
        assert self.serializer_class is not None, (
                "'%s' should either include a `serializer_class` attribute, "
                "or override the `get_serializer_class()` method."
                % self.__class__.__name__
        )

        return self.serializer_class

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        return {
            'request': self.request,
            'format': self.format_kwarg,
            'view': self
        }

    def filter_queryset(self, queryset):
        """
        Given a queryset, filter it with whichever filter backend is in use.

        You are unlikely to want to override this method, although you may need
        to call it either from a list view, or from a custom `get_object`
        method if you want to apply the configured filtering backend to the
        default queryset.
        """
        for backend in list(self.filter_backends):
            queryset = backend().filter_queryset(self.request, queryset, self)
        return queryset

    @property
    def paginator(self):
        """
        The paginator instance associated with the view, or `None`.
        """
        if not hasattr(self, '_paginator'):
            if self.pagination_class is None:
                self._paginator = None
            else:
                self._paginator = self.pagination_class()
        return self._paginator

    def paginate_queryset(self, queryset):
        """
        Return a single page of results, or `None` if pagination is disabled.
        """
        if self.paginator is None:
            return None
        return self.paginator.paginate_queryset(queryset, self.request, view=self)

    def get_paginated_response(self, data):
        """
        Return a paginated style `Response` object for the given output data.
        """
        assert self.paginator is not None
        return self.paginator.get_paginated_response(data)
