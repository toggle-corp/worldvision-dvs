from project.models import Project
from report.models import PresenceAndParticipation


def extract(xml_data, generated_on):
    """
    ('@ProjectCode', '174174'),
    ('@ProjectName', 'Butwal CESP'),
    ('@SupportOfficeCode', 'AUSO'),
    ('@ActualRC', '1'),
    ('@RCPresent', '1'),
    ('@Total_RC___Temporarily_Away', '0'),
    ('@RCNotSightedOver90D', '0'),
    ('@WithNoPSForTheLast6Mos', '0'),
    ('@DropsWithinPeriod', '0'),
    ('@DropsLast12Mos', '0'),
    ('@DropsDueToDuplicate', '0')]),
    """
    collection = (
        xml_data['Report']['list1']['list1_Details_Group_Collection']['list1_Details_Group']
        ['table1']['Detail_Collection']['Detail']
    )
    for pj in collection:
        pj_number = int(pj['@ProjectCode'])
        pj_name = pj['@ProjectName']
        total_rc_temporarily_away = pj['@Total_RC___Temporarily_Away']
        total_no_of_rc_records_dropped_during_the_month = pj['@DropsLast12Mos']

        project, pj_created = Project.objects.get_or_create(number=pj_number)
        if pj_created:
            project.name = pj_name
            project.save()
        pap, _ = PresenceAndParticipation.objects.get_or_create(
            project=project,
            date=generated_on,
        )
        pap.total_rc_temporarily_away = total_rc_temporarily_away
        pap.total_no_of_rc_records_dropped_during_the_month =\
            total_no_of_rc_records_dropped_during_the_month
        pap.save()
