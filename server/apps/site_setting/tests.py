from wv_dvs.tests import TestCase


class SummaryGroupTest(TestCase):
    def test_summary_groups(self):
        url = '/api/v1/site-settings/'
        response = self.client.get(url)
        self.assert_200(response)
