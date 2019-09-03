from datetime import datetime

from project.models import Project
from report.utils import DATE_PATTERN
from report.models import Gender, RegisterChildByAgeAndGender


def extract(xml_data, _generated_on):
    report = xml_data['Report']
    projects_age_data = (
        report['Tablix1']['ZoneName_Collection']['ZoneName']
        ['ProjectTranslation_Collection']['ProjectTranslation']
    )
    # Sample string 'As of Date : 8/29/2019 10:52:49 AM'
    generated_on_str = report['Tablix1']['@Textbox18']
    matched = DATE_PATTERN.match(generated_on_str).group(1)
    generated_on = _generated_on or datetime.strptime(matched, '%m/%d/%Y').date()

    import_data = {}
    projects_name = {}
    for pj_age_data in projects_age_data:
        age_data = pj_age_data['Age_Collection']['Age']
        # Sample string 'Project : 174175- Lamjung CESP'
        pj_translation = pj_age_data['@ProjectTranslation']
        project_number = str(int(pj_translation.split('-')[0].split(':')[1]))
        projects_name[project_number] = pj_age_data['@ProjectTranslation'].split('-')[1]

        import_data[project_number] = {}
        for age_datum in age_data:
            # Sample string 'Age in Years : 1 Years'
            age = int(age_datum['@Age'].split(':')[1].replace('Years', ''))
            children_data = age_datum['Details_Collection']['Details']
            age_range = RegisterChildByAgeAndGender.get_range_for_age(age)
            import_data[project_number][age_range] = {
                Gender.MALE: 0,
                Gender.FEMALE: 0,
            }
            for child in children_data:
                if not isinstance(child, dict):
                    continue
                # Sample string 'F - Female'
                gender_str = child['@Gender'].strip()[0]
                gender = Gender.MALE if gender_str == 'M' else Gender.FEMALE
                import_data[project_number][age_range][gender] += 1

    for project_number, pj_data in import_data.items():
        project, pj_created = Project.objects.get_or_create(number=project_number)
        if pj_created:
            project.name = projects_name[project_number]
            project.save()
        for age_range, ar_data in pj_data.items():
            for gender, count in ar_data.items():
                RegisterChildByAgeAndGender.objects.get_or_create(
                    date=generated_on,
                    project=project,
                    age_range=age_range,
                    gender=gender,
                    count=count,
                )
