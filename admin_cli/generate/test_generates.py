import asyncio

from django.test import TestCase

from admin_cli.generate.generates import gen_serializer, gen_filter, gen_view, gen_antd_pages


class Test(TestCase):
    def test_gen_serializer(self):
        name = "Demo"
        loop = asyncio.get_event_loop()
        loop.run_until_complete(gen_serializer([name]))
        loop.close()
        self.assertTrue(True)

    def test_gen_filter(self):
        name = "Demo"
        loop = asyncio.get_event_loop()
        loop.run_until_complete(gen_filter([name]))
        loop.close()
        self.assertTrue(True)

    def test_gen_views(self):
        name = "Demo"
        loop = asyncio.get_event_loop()
        loop.run_until_complete(gen_view([name]))
        loop.close()
        self.assertTrue(True)

    def test_antd_pages(self):
        name = "Demo"
        loop = asyncio.get_event_loop()
        loop.run_until_complete(gen_antd_pages([name]))
        loop.close()
        self.assertTrue(True)
