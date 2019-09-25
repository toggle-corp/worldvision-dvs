from wv_dvs.tests import TestCase

from summary_group.models import SummaryGroup


class SummaryGroupTest(TestCase):
    def setUp(self):
        super().setUp()
        # Importing outside will catch ReportTestCase twice
        from report.tests import ReportTestCase
        self.report = ReportTestCase.load_report()

    def test_summary_groups(self):
        url = '/api/v1/summary-groups/'
        response = self.client.get(url)
        self.assert_200(response)

    def test_summary_group(self):
        group = SummaryGroup.objects.create(
            name='Summary Group 1',
        )
        group.projects.add(self.report.project)

        url = f'/api/v1/summary-groups/{group.pk}/'
        response = self.client.get(url)
        self.assert_200(response)
