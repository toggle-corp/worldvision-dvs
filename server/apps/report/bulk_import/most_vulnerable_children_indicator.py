from collections import defaultdict
from dateutil.parser import parse as date_parse

from report.models import MostVulnerableChildrenIndicator
from report.utils import convert_to_int

from .common import get_or_create_project


def extract(csv_data, _):
    import_data = defaultdict(lambda: defaultdict(dict))

    # Collect Data
    for row in csv_data:
        pj_translation = row['Project']
        pj_number = convert_to_int(pj_translation.split('-')[0])
        p_date = date_parse(row['Textbox271'].split(':')[1].strip()).date()
        import_data[pj_number][p_date] = {
            'mvc_count': row['MVC_Count'],
            'rc_not_vc_count': row['RC_not_VC'],
            'rc_count': row['RC_Count'],
        }

    # Save Data to DB
    for pj_number, data in import_data.items():
        project = get_or_create_project(pj_number)
        for p_date, counts in data.items():
            obj, _ = MostVulnerableChildrenIndicator.objects.get_or_create(
                project=project,
                date=p_date,
            )
            for field, count in counts.items():
                setattr(obj, field, convert_to_int(count, 0))
            obj.save()
