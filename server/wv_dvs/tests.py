import logging
from rest_framework import (
    test,
    status,
)


class TestCase(test.APITestCase):
    def setUp(self):
        pass

    def assert_200(self, response):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @property
    def logger(self):
        if getattr(self, '_logger', None) is None:
            name = f'{self.__class__.__module__}.{self.__class__.__name__}'
            self._logger = logging.getLogger(name)
        return self._logger

    def looger_info(self, message):
        self.logger.info(message)
