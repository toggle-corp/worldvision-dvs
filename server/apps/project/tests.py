from wv_dvs.tests import TestCase


class ProjectTest(TestCase):
    def setUp(self):
        super().setUp()
        # Importing outside will catch ReportTestCase twice
        from report.tests import ReportTestCase
        self.report = ReportTestCase.load_report()

    def test_api(self):
        url = '/api/v1/projects/'
        response = self.client.get(url)
        self.assert_200(response)

    def test_project_report_api(self):
        url = f'/api/v1/projects-report/{self.report.project_id}/'
        response = self.client.get(url)
        self.assert_200(response)

    def test_projects_summary(self):
        url = '/api/v1/projects-summary/'
        response = self.client.get(url)
        self.assert_200(response)

    def test_projects_summary_trend(self):
        url = '/api/v1/projects-summary-trend/'
        response = self.client.get(url)
        self.assert_200(response)
