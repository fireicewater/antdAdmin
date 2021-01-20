import os

import aiofiles
import django
from django.conf import settings
from django.db.models import ForeignKey
from jinja2 import PackageLoader, Environment

from admin_cli.utils import get_model_import_path


async def gen_serializer(label, env):
    """
    生成单个模块文件
    :param label: django 模块名
    :return: void
    """
    # import dict key import_path value list(model_name)
    app_model_import_dict = {}
    # moderl dict key moderl_name value list((field_name,foreign_model_name,bool(是否为many to many)))
    models = {}
    for one in django.apps.apps.get_models():
        model_name = one._meta.model.__name__
        app_label = one._meta.app_label
        if label == app_label:
            import_path = get_model_import_path(one)
            app_model_import_dict.setdefault(import_path, set([])).add(model_name)
            models[model_name] = set([])
            for field in one.objects.model._meta.fields:
                name = field.name
                if isinstance(field, ForeignKey):
                    foreign_model = field.target_field.model
                    field_object_name = foreign_model._meta.object_name
                    models[model_name].add((name, field_object_name, False))
                    foreign_path = get_model_import_path(foreign_model)
                    # 外键 import
                    app_model_import_dict.setdefault(foreign_path, set([]).add(field_object_name))
            # 处理外键
            for field in one.objects.model._meta.many_to_many:
                name = field.name
                foreign_model = field.related_model
                real_model_name = foreign_model._meta.object_name
                models[model_name].add((name, real_model_name, True))
                foreign_path = get_model_import_path(real_model_name)
                app_model_import_dict.setdefault(foreign_path, set([]).add(real_model_name))
    # env = Environment(loader=PackageLoader('admin_cli', 'templates'))
    template = env.get_template('serializer.txt')
    str = template.render(app_model_import_dict=app_model_import_dict, models=models)
    path = f'{settings.BASE_DIR}/{label}/serializers.py'
    if os.path.exists(path):
        print(f"{label}模块已存在serializers跳过")
    else:
        async with aiofiles.open(path, 'w', encoding='utf-8') as fw:
            await fw.write(str)


async def gen_app_serializer(userApps, env):
    if len(userApps) == 0:
        print("serializers models 为空")
        return
    for model in userApps:
        await gen_serializer(model, env)
