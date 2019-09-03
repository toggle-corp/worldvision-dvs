from datetime import datetime

from report.utils import DATE_PATTERN
from project.models import Project
from report.models import ProjectSOI


def extract(xml_data, _generated_on):
    report = xml_data['Report']
    project_collection = (
        report['Tablix1']['Details_Collection']['Details']
        ['table1']['table1_CountryId_Collection']['table1_CountryId']
        ['table1_ProjectId_Collection']['table1_ProjectId']
    )

    # Sample string 'Generated on 6/12/2019 10:22:06 AM'
    generated_on_str = report['Tablix1']['Details_Collection']['Details']['table1']['@Textbox172']
    matched = DATE_PATTERN.match(generated_on_str).group(1)
    generated_on = _generated_on or datetime.strptime(matched, '%d/%m/%Y').date()

    for pj in project_collection:
        number = pj['@ProjectId_1'].replace('Total:', '').strip()
        total_closed = int(pj['@TotalClosed_1'])
        closed_on_time = int(pj['@ClosedOnTime_1'])

        project, pj_created = Project.objects.get_or_create(number=number)
        if pj_created:
            project.name = pj['Detail_Collection']['Detail'][0]['@ProjectName']
            project.save()
        project_soi, _ = ProjectSOI.objects.get_or_create(project=project, date=generated_on)
        project_soi.total_closed = total_closed
        project_soi.closed_on = closed_on_time
        project_soi.save()
