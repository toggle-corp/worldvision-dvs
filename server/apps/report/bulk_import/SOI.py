from datetime import datetime

from report.utils import DATE_PATTERN
from report.models import ProjectSOI
from report.utils import convert_to_int

from .common import get_or_create_project


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
    generated_on = _generated_on or datetime.strptime(matched, '%m/%d/%Y').date()

    for pj in project_collection:
        number = pj['@ProjectId_1'].replace('Total:', '').strip()
        total_closed = convert_to_int(pj['@TotalClosed_1'])
        closed_on_time = convert_to_int(pj['@ClosedOnTime_1'])

        project_details = pj['Detail_Collection']['Detail']
        project = get_or_create_project(
            number,
            name=(
                # project_details can be both array and dict
                project_details[0] if isinstance(project_details, list) else
                project_details
            )['@ProjectName']
        )
        project_soi, _ = ProjectSOI.objects.get_or_create(project=project, date=generated_on)
        project_soi.total_closed = total_closed
        project_soi.closed_on = closed_on_time
        project_soi.save()
