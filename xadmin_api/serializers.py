from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from xadmin_api.models import TyAdminSysLog, TyAdminEmailVerifyRecord

user = get_user_model()


class TyAdminSysLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TyAdminSysLog
        fields = "__all__"


class TyAdminEmailVerifyRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TyAdminEmailVerifyRecord
        fields = "__all__"


class SysUserChangePasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField()
    re_password = serializers.CharField()

    class Meta:
        model = user
        fields = ('old_password', 'new_password', 're_password')

    def validate_old_password(self, value):
        if not self.instance.check_password(value):
            raise serializers.ValidationError('旧密码错误，请确认后重试')
        return value

    def validate(self, data):
        if data['new_password'] != data['re_password']:
            raise serializers.ValidationError('两次密码不匹配')
        return data

    def save(self, **kwargs):
        self.instance.set_password(self.validated_data['new_password'])
        self.instance.save()
        return self.instance


class ContentTypeListSerializer(serializers.ModelSerializer):
    key = serializers.CharField(source="pk")
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = ContentType
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class ContentTypeCreateUpdateSerializer(serializers.ModelSerializer):
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = ContentType
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class PermissionListSerializer(serializers.ModelSerializer):
    class ContentTypeSerializer(serializers.ModelSerializer):
        ty_options_display_txt = serializers.SerializerMethodField()

        class Meta:
            model = ContentType
            fields = "__all__"

        @staticmethod
        def get_ty_options_display_txt(obj):
            return str(obj)

    content_type = ContentTypeSerializer()
    key = serializers.CharField(source="pk")
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class PermissionCreateUpdateSerializer(serializers.ModelSerializer):
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = Permission
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class GroupListSerializer(serializers.ModelSerializer):
    class PermissionSerializer(serializers.ModelSerializer):
        ty_options_display_txt = serializers.SerializerMethodField()

        class Meta:
            model = Permission
            fields = "__all__"

        @staticmethod
        def get_ty_options_display_txt(obj):
            return str(obj)

    permissions = PermissionSerializer(many=True)
    key = serializers.CharField(source="pk")
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class GroupCreateUpdateSerializer(serializers.ModelSerializer):
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class UserListSerializer(serializers.ModelSerializer):
    class GroupSerializer(serializers.ModelSerializer):
        ty_options_display_txt = serializers.SerializerMethodField()

        class Meta:
            model = Group
            fields = "__all__"

        @staticmethod
        def get_ty_options_display_txt(obj):
            return str(obj)

    groups = GroupSerializer(many=True)

    class PermissionSerializer(serializers.ModelSerializer):
        ty_options_display_txt = serializers.SerializerMethodField()

        class Meta:
            model = Permission
            fields = "__all__"

        @staticmethod
        def get_ty_options_display_txt(obj):
            return str(obj)

    user_permissions = PermissionSerializer(many=True)
    key = serializers.CharField(source="pk")
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = user
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)


class UserCreateUpdateSerializer(serializers.ModelSerializer):
    ty_options_display_txt = serializers.SerializerMethodField()

    class Meta:
        model = user
        fields = "__all__"

    @staticmethod
    def get_ty_options_display_txt(obj):
        return str(obj)
