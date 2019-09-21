from .report_fields import LABELS, CAMEL_CASES


def _numeral(value, ignore=False):
    """
    Change to integer/float
    """
    try:
        try:
            return int(value)
        except ValueError:
            return float(value)
    except ValueError as e:
        if not ignore:
            raise e
    return value


def _percentage(value):
    """
    Change percentage text to integer/float
    """
    return _numeral(value.replace(' ', '').replace('%', ''))


def generate_hierarchy(obj, data):
    result = {}

    result['name'] = obj['name'] if 'name' in obj else LABELS[obj['key']]
    result['key'] = obj['key']

    children = obj.get('children')
    if children:
        result['children'] = []
        result['size'] = 0
        for child in children:
            child_result = generate_hierarchy(child, data)
            result['children'].append(child_result)
            result['size'] += child_result['size']
    elif obj.get('key'):
        result['size'] = _numeral(data[obj['key']])

    return result


def extract_rc_data(data):
    fields = (
        '@PlannedRC', '@TotalRC', '@Sponsored', '@Available', '@TotalHold', '@TotalDeath',
        '@TotalMale', '@TotalFemale', '@TotalLeft',
    )
    return {
        CAMEL_CASES[field]: _numeral(data[field])
        for field in fields
    }


def extract_health_nutrition(data):
    fields = (
       ('@HealthSatisfactory', 'good'),
       ('@HealthNotSatisfactory', 'bad'),
       ('@Below5Child', 'normal'),
       ('@NotParticipatingHealthNutriActivities', 'normal'),
       ('@NotVarifiedHealthGrowthCard', 'bad'),
       ('@NotFollowingGrowthCurve', 'bad'),
       ('@MUACSevereMalnutrition', 'bad'),
       ('@MUACModerateMalnutrition', 'bad'),
       ('@MUACPartiallyImmunized', 'normal'),
    )
    return [
        {
            'name': LABELS[_d[0]],
            'value': _numeral(data.get(_d[0])),
            'type': _d[1], 'key': _d[0],
        } for _d in fields
    ]


def extract_rc_pie_chart(data):
    fields = [
        {
            'key': '@PlannedRC',
        },
        {
            'key': '@TotalRC',
            'children': [
                {
                    'key': '@Sponsored',
                    'children': [
                        {
                            'key': '@SponsoredMale',
                        },
                        {
                            'key': '@SponsoredFemale',
                        },
                    ],
                },
                {
                    'key': '@Available',
                    'children': [
                        {
                            'key': '@AvailableMale',
                        },
                        {
                            'key': '@AvailableFemale',
                        },
                    ],
                },
            ],
        },
        {
            'key': '@TotalHold',
        },
    ]

    return generate_hierarchy({
        'name': 'RC Supply',
        'key': 'rc_supply',
        'children': fields,
    }, data)


def extract_education(data):
    fields = [
        {
            'key': '@PrimarySchoolAge',
            'children': [
                {
                    'key': '@PrimarySchoolAgeFormal',
                },
                {
                    'key': '@PrimarySchoolAgeNonFormal',
                },
                {
                    'key': '@PrimarySchoolAgeNoEducation',
                },
            ],
        },

        {
            'key': '@SecondarySchoolAge',
            'children': [
                {
                    'key': '@SecondarySchoolAgeFormal',
                },
                {
                    'key': '@SecondarySchoolAgeNonFormal',
                },
                {
                    'key': '@SecondarySchoolAgeVocational',
                },
                {
                    'key': '@SecondarySchoolAgeNoEducation',
                },
            ],
        },
    ]

    return generate_hierarchy({
        'name': 'Education',
        'key': 'education',
        'children': fields,
    }, data)


def extract_child_monitoring(data):
    fields = (
       '@NotSighted30Days',
       '@NotSighted60Days',
       '@NotSighted90Days',
       '@VisitCompleted',
       '@SponsorVisitCompleted',
    )
    return [
        {
            'name': LABELS[field],
            'value': _numeral(data.get(field)),
            'key': field,
        } for field in fields
    ]


def extract_correspondence(data):
    def normalize(_d, fields):
        return {
            CAMEL_CASES[field]: _numeral(_d[field], ignore=True)
            for field in fields
        }

    fields = (
        '@TypeName',
        '@Initial',
        '@Received',
        '@Closed',
        '@PendingCurrent',
        '@PendingOverDue',
        '@Textbox370',
    )
    return [normalize(datum, fields) for datum in data]


def extract_data(data):
    report = data['Report']
    tablix2 = report['Tablix2']
    correspondence_data = report['Tablix3']['Details_Collection']['Details']

    _report = {
        'reportDate': tablix2['@Textbox55'].split(':', 1)[1].strip(),
        'rcData': extract_rc_data(tablix2),
        'rcPieChart': extract_rc_pie_chart(tablix2),

        'healthNutrition': extract_health_nutrition(tablix2),
        'education': extract_education(tablix2),
        'childMonitoring': extract_child_monitoring(tablix2),
        'correspondences': extract_correspondence(correspondence_data),
    }

    return _report
