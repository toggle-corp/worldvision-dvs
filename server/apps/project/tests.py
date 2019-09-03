from django.test import TestCase

import logging
logger = logging.getLogger(__name__)


class ProjectTest(TestCase):

    def test_fake(self):
        logger.info('This is a fake test')
