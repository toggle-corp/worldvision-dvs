from dateutil.parser import parse as date_parse

from report.models import SupportPariticipationDetail
from report.utils import convert_to_int

from .common import get_or_create_project


def increment(obj, keys, value=1):
    _dict = obj
    for key in keys[:-1]:
        if _dict.get(key) is None:
            _dict[key] = {}
        _dict = _dict[key]
    _dict[keys[-1]] = _dict.get(keys[-1], 0) + value


def extract(csv_data, _):
    import_data = {}

    # Collect Data
    for row in csv_data:
        pj_translation = row['Textbox255']
        pj_number = convert_to_int(pj_translation.split('-')[0].split(':')[1])
        p_type = row['ParticipationType']
        comment = row['ParticipationComments']
        p_date = date_parse(row['ParticipationDate']).date()

        increment(
            import_data,
            (pj_number, p_type, comment, p_date)
        )

    # Save Data to DB
    for pj_number, language_data in import_data.items():
        project = get_or_create_project(pj_number)
        for p_type, comment, p_date, count in [
            (p_type, comment, p_date, count)
            for p_type, p_type_data in language_data.items()
            for comment, comment_data in p_type_data.items()
            for p_date, count in comment_data.items()
        ]:
            if count == 0:
                continue
            sppd, _ = SupportPariticipationDetail.objects.get_or_create(
                project=project,
                date=p_date,
                type=p_type,
                comment=comment,
            )
            sppd.count = count
            sppd.save()
