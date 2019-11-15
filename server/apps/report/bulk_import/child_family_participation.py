import copy

from project.models import Project
from report.models import Gender, ChildFamilyParticipation as CFP
from report.utils import convert_to_int

TYPE_INITIAL = {
    Gender.MALE: {},
    Gender.FEMALE: {},
}

INITIAL_PARTICIPATION = {
    CFP.CHILD_PARTICIPATION: copy.deepcopy(TYPE_INITIAL),
    CFP.FAMILY_PARTICIPATION: copy.deepcopy(TYPE_INITIAL),
    CFP.CHILD_SUPPORT: copy.deepcopy(TYPE_INITIAL),
    CFP.FAMILY_SUPPORT: copy.deepcopy(TYPE_INITIAL),
}


def increment(dict_value, key, inc_value=1):
    if dict_value.get(key) is None:
        dict_value[key] = 0
    dict_value[key] += inc_value


def extract(xml_data, generated_on):
    """
    ('@Textbox2', '1'),
    ('@Project', '194278'),
    ('@CommunityName', 'AL0016 - 194278-Chandannath-10'),
    ('@SdChildId', 'NPL-194278-1384'),
    ('@ChildName', 'KAMI, Nani'),
    ('@Gender', 'F'),
    ('@AGE', '11 Y'),
    ('@ChildParticipation', '1'),
    ('@FamilyParticipation', '0'),
    ('@ChildSupport', '0'),
    ('@FamilySupport', '0')
    """
    collection = xml_data['Report']['Tablix1']['Details_Collection']['Details']
    import_data = {}
    for pj_data in collection:
        pj_number = convert_to_int(pj_data['@Project'])
        gender_raw = pj_data['@Gender']
        gender = Gender.FEMALE if gender_raw == 'F' else Gender.MALE

        child_participation = convert_to_int(pj_data['@ChildParticipation'])
        family_participation = convert_to_int(pj_data['@FamilyParticipation'])
        child_support = convert_to_int(pj_data['@ChildSupport'])
        family_support = convert_to_int(pj_data['@FamilySupport'])

        if import_data.get(pj_number) is None:
            import_data[pj_number] = copy.deepcopy(INITIAL_PARTICIPATION)

        for type_value, type_number in [
                (CFP.CHILD_PARTICIPATION, child_participation),
                (CFP.FAMILY_PARTICIPATION, family_participation),
                (CFP.CHILD_SUPPORT, child_support),
                (CFP.FAMILY_SUPPORT, family_support),
        ]:
            if type_number == 0:
                continue
            increment(import_data[pj_number][type_value][gender], type_number)

    for pj_number, participation_data in import_data.items():
        project, pj_created = Project.objects.get_or_create(number=pj_number)
        for participation_type, gender_data in participation_data.items():
            for gender_type, number_data in gender_data.items():
                for participation_number, count in number_data.items():
                    if count == 0 or participation_number == 0:
                        continue
                    cfp, _ = CFP.objects.get_or_create(
                        project=project,
                        date=generated_on,
                        type=participation_type,
                        gender=gender_type,
                        participation=participation_number,
                    )
                    cfp.count = count
                    cfp.save()
