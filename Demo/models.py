from django.db import models

from xadmin_api.models import CustomUser


# Create your models here.

class DataConnect(models.Model):
    """
    数据库连接
    host='127.0.0.1',
        port=3306,
        user='root',
        password='123456',
        database='s8day127db',
    """
    # 数据库type TODO 暂时先这么多后续再说
    databaseTypeChoice = (
        ("mysql", "mysql"),
        ("oracle", "oracle"),
        ("pgsql", "pgsql"),
        ("sqlserver", "sqlserver")
    )
    title = models.CharField("数据连接标题", max_length=100, )
    host = models.URLField("数据库host")
    port = models.IntegerField("数据库端口号")
    user = models.CharField("数据库用户", max_length=50)
    password = models.CharField("数据库密码", max_length=100)
    database = models.CharField("数据库名", max_length=100)
    databaseType = models.CharField("数据库类型", max_length=50, choices=databaseTypeChoice)
    sysUser = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
    )

    class Meta:
        verbose_name = "数据库连接"
        verbose_name_plural = verbose_name
