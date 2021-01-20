import asyncio
from django.test import TestCase
from admin_cli.generate.gen_serializer import gen_serializer
from admin_cli.utils import init_django_env
from jinja2 import PackageLoader, Environment

env = Environment(loader=PackageLoader('admin_cli', 'templates'))


class Test(TestCase):
    def test_gen_serializer(self):
        name = "Demo"
        loop = asyncio.get_event_loop()
        loop.run_until_complete(gen_serializer(name, env))
        loop.close()
        self.assertTrue(True)
