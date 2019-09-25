import os
import datetime
import xmltodict
from parameterized import parameterized

from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

from wv_dvs.tests import TestCase
from project.models import Project
from report.forms import BULK_IMPORTER, ReportAdminForm
from report.models import (
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
)


MODEL_API_URLS = {
    ProjectSOI: '/api/v1/projects-soi/',
    RegisterChildByAgeAndGender: '/api/v1/register-childs-by-age-and-gender/',
    PresenceAndParticipation: '/api/v1/presence-and-participations/',
    ChildFamilyParticipation: '/api/v1/child-family-participations/',
}

TEST_DOC_FILES = {
    ProjectSOI: 'SOIsummaryReport.xml',
    RegisterChildByAgeAndGender: 'RegisteredChildrenListAgeGender.xml',
    PresenceAndParticipation: 'PresenceParticipationSummaryNO.xml',
    ChildFamilyParticipation: 'ChildFamilyParticipationSupportCountReport.xml',
}

date = str(datetime.datetime.now().date())


class ReportTestCase(TestCase):
    @staticmethod
    def load_report():
        project = Project.objects.create(
            name='Project 1',
            number='N-1',
        )

        with open(
            os.path.join(settings.TEST_DIR, 'HorizonADPManagementReport.xml'), 'rb',
        ) as fp:
            form = ReportAdminForm({
                'name': 'Report 1',
                'project': project.pk,
                'date': date,
            }, {'file': SimpleUploadedFile(fp.name, fp.read())})
            assert form.is_valid() is True
            return form.save()

    def test_report_api(self):
        url = '/api/v1/project-reports/'
        response = self.client.get(url)
        report_count = len(response.data)
        self.assert_200(response)

        ReportTestCase.load_report()

        url = '/api/v1/project-reports/'
        response = self.client.get(url)
        assert len(response.data) == report_count + 1
        self.assert_200(response)

    @parameterized.expand([
        (model,) for model in BULK_IMPORTER.keys()
    ], name_func=lambda func, _, param: f'{func.__name__}__{param.args[0].__name__}')
    def test_bulk_import(self, model):
        response = self.client.get(MODEL_API_URLS[model])
        self.assert_200(response)

        file = TEST_DOC_FILES.get(model)
        with open(
            os.path.join(settings.TEST_DIR, file), 'rb',
        ) as fp:
            xml_data = xmltodict.parse(fp.read())
            BULK_IMPORTER.get(model).extract(xml_data, date)

        response = self.client.get(MODEL_API_URLS[model])
        self.assert_200(response)
