from project.models import Project
from report.models import LanguagePeopleGroupDisability


def increment(obj, keys, value=1):
    _dict = obj
    for key in keys[:-1]:
        if _dict.get(key) is None:
            _dict[key] = {}
        _dict = _dict[key]
    _dict[keys[-1]] = _dict.get(keys[-1], 0) + value


def extract(csv_data, generated_on):
    import_data = {}

    # Collect Data
    for row in csv_data:
        pj_number = int(row['ProjectID'])
        language = row['Language']
        people_group = row['PeopleGroup']
        disability = row['Disability']

        increment(
            import_data,
            (pj_number, language, people_group, disability)
        )

    # Save Data to DB
    for pj_number, language_data in import_data.items():
        project, pj_created = Project.objects.get_or_create(number=pj_number)
        for language, people_group_data in language_data.items():
            for people_group, disability_data in people_group_data.items():
                for disability, count in disability_data.items():
                    if count == 0:
                        continue
                    lpgd, _ = LanguagePeopleGroupDisability.objects.get_or_create(
                        project=project,
                        date=generated_on,
                        language=language,
                        people_group=people_group,
                        disability=disability,
                    )
                    lpgd.count = count
                    lpgd.save()
