import functools
import os

import aiofiles
import django
from django.conf import settings
from django.db.models import CharField, DateField, BooleanField, IntegerField, FloatField, TextField
from django.db.models import DateTimeField, ForeignKey, ImageField, FileField
from jinja2 import PackageLoader, Environment

from admin_cli.utils import get_model_import_path


def gen_wrapper(func):
    @functools.wraps(func)
    async def wrapper(*args, **kw):
        userApps = args[0]
        env = Environment(loader=PackageLoader('admin_cli', 'templates'))
        if len(userApps) == 0:
            print("serializers models 为空")
            return
        for model in userApps:
            await func(model, env)

    return wrapper


@gen_wrapper
async def gen_serializer(label, env):
    """
    生成单个模块文件
    :param label: django 模块名
    :return: void
    """
    # import dict key import_path value list(model_name)
    app_model_import_dict = {}
    # model dict key model_name value list((field_name,foreign_model_name,bool(是否为many to many)))
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
    template = env.get_template('serializer.txt')
    str = template.render(app_model_import_dict=app_model_import_dict, models=models)
    path = f'{settings.BASE_DIR}/{label}/serializers.py'
    if os.path.exists(path):
        print(f"{label}模块已存在serializers跳过")
    else:
        async with aiofiles.open(path, 'w', encoding='utf-8') as fw:
            await fw.write(str)


@gen_wrapper
async def gen_filter(label, env):
    # import dict key import_path value list(model_name)
    app_model_import_dict = {}
    # model dict key model_name value list((field_name,type))
    models = {}
    # exclude dict key model_name value list((field_name))
    exclude = {}
    for model in django.apps.apps.get_models():
        model_name = model._meta.model.__name__
        app_label = model._meta.app_label
        if label == app_label:
            import_path = get_model_import_path(model)
            app_model_import_dict.setdefault(import_path, []).append(model_name)
            models[model_name] = set([])
            for field in model.objects.model._meta.fields:
                name = field.name
                if isinstance(field, ImageField):
                    exclude.setdefault(model_name, set([])).add(name)
                elif isinstance(field, FileField):
                    exclude.setdefault(model_name, set([])).add(name)
                elif isinstance(field, ForeignKey):
                    models[model_name].add((name, "foreign"))
                elif isinstance(field, DateTimeField):
                    models[model_name].add((name, "date"))
                elif field.__class__.__name__ == "TimeZoneField":
                    exclude.setdefault(model_name, set([])).add(name)
    template = env.get_template('filter.txt')
    str = template.render(app_model_import_dict=app_model_import_dict, models=models, excludes=exclude)
    path = f'{settings.BASE_DIR}/{label}/filters.py'
    if os.path.exists(path):
        print("已存在filters.py跳过")
    else:
        async with aiofiles.open(path, 'w', encoding='utf-8') as fw:
            await fw.write(str)


@gen_wrapper
async def gen_view(label, env):
    # import dict key import_path value list(model_name)
    app_model_import_dict = {}
    # model dict key model_name value list((field_name,foreign_model_name,bool(是否为many to many)))
    models = []
    # model dict key model_name value list(searchfields name)
    model_search_dict = {}
    for one in django.apps.apps.get_models():
        model_name = one._meta.model.__name__
        app_label = one._meta.app_label
        if label == app_label:
            import_path = get_model_import_path(one)
            app_model_import_dict.setdefault(import_path, []).append(model_name)
            models.append(model_name)
            search_list = []
            for field in one.objects.model._meta.fields:
                name = field.name
                if isinstance(field, CharField):
                    search_list.append('"' + name + '"')
            model_search_dict[model_name] = search_list
    serializers_list = [one + "Serializer" for one in models]
    filters_list = [one + "Filter" for one in models]
    template = env.get_template('views.txt')
    str = template.render(app_model_import_dict=app_model_import_dict, models=models, serializers_list=serializers_list,
                          filters_list=filters_list, model_search_dict=model_search_dict)
    path = f'{settings.BASE_DIR}/{label}/views.py'
    if os.path.exists(path):
        print("已存在filters.py跳过")
    async with aiofiles.open(path, 'w', encoding='utf-8') as fw:
        await fw.write(str)


@gen_wrapper
async def gen_antd_pages(label, env):
    # model dict key model_name value list((field_name,type))
    models = {}
    for one in django.apps.apps.get_models():
        model_name = one._meta.model.__name__
        app_label = one._meta.app_label
        fields = []
        model_meta = one.objects.model._meta
        if label == app_label:
            for field in one.objects.model._meta.fields:
                tempField = {"name": field.name}
                # 判断类型
                if isinstance(field, CharField):
                    tempField['type'] = "CharField"
                elif isinstance(field, DateTimeField):
                    tempField['type'] = "DateTimeField"
                elif isinstance(field, DateField):
                    tempField['type'] = "DateField"
                elif isinstance(field, BooleanField):
                    tempField['type'] = "BooleanField"
                elif isinstance(field, IntegerField):
                    tempField['type'] = "IntegerField"
                elif isinstance(field, FloatField):
                    tempField['type'] = "FloatField"
                elif isinstance(field, ImageField):
                    tempField['type'] = "ImageField"
                elif isinstance(field, FileField):
                    tempField['type'] = "FileField"
                elif isinstance(field, TextField):
                    tempField['type'] = "FileField"
                elif isinstance(field, ForeignKey):
                    associated_model = field.related_model._meta.object_name
                    tempField['type'] = "ForeignKey"
                    tempField['foreign'] = associated_model
                    tempField["label"] = field.related_model._meta.app_label
                # 判断required
                tempField['required'] = not field.blank
                fields.append(tempField)
            # 处理多对多
            for field in model_meta.many_to_many:
                tempField = {"name": field.name}
                associated_model = field.related_model._meta.object_name
                tempField['type'] = "manyKey"
                tempField['foreign'] = associated_model
                tempField["label"] = field.related_model._meta.app_label
                fields.append(tempField)
            models[model_name] = fields
    for model, fields in models.items():
        path = f'{settings.BASE_DIR}/xadmin/src/pages/{label}/{model}/'
        if not os.path.exists(path):
            os.makedirs(path)
        # service
        service_path = path + 'service.ts'
        if not os.path.exists(service_path):
            template = env.get_template('antd-service.text')
            str = template.render(model=model, label=label, fields=fields)
            async with aiofiles.open(service_path, 'w', encoding='utf-8') as fw:
                await fw.write(str)
        # antd
        antd_path = path + 'index.tsx'
        if not os.path.exists(antd_path):
            template = env.get_template('antd.txt')
            str = template.render(model=model, label=label, fields=fields)
            async with aiofiles.open(antd_path, 'w', encoding='utf-8') as fw:
                await fw.write(str)
