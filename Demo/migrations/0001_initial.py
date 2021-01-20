# Generated by Django 3.1.4 on 2021-01-05 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DataConnect',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='数据连接标题')),
                ('host', models.URLField(verbose_name='数据库host')),
                ('port', models.IntegerField(verbose_name='数据库端口号')),
                ('user', models.CharField(max_length=50, verbose_name='数据库用户')),
                ('password', models.CharField(max_length=100, verbose_name='数据库密码')),
                ('database', models.CharField(max_length=100, verbose_name='数据库名')),
                ('databaseType', models.CharField(choices=[('mysql', 'mysql'), ('oracle', 'oracle'), ('pgsql', 'pgsql'), ('sqlserver', 'sqlserver')], max_length=50, verbose_name='数据库类型')),
            ],
            options={
                'verbose_name': '数据库连接',
                'verbose_name_plural': '数据库连接',
            },
        ),
    ]
