from .report_fields import LABELS, CAMEL_CASES


def _numeral(value, ignore=False):
    """
    Change to integer/float
    """
    if value is None:
        return 0
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
        ('@NotFollowingGrowthCurve', 'bad'),
        # ('@MUACSevereMalnutrition', 'bad'),
        # ('@MUACModerateMalnutrition', 'bad'),
        # ('@MUACPartiallyImmunized', 'normal'),

        # TODO: Remove this from data also
        ('@NotParticipatingHealthNutriActivities', 'normal'),
        ('@NotVarifiedHealthGrowthCard', 'bad'),
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
    correspondence_data = report['Tablix3']['Details_Collection']['Details']

    # NOTE: Used this mapping to collect data from new xml extract structure
    collected_data = {
        key: report[key1][key2] for key, key1, key2 in [
            ('@Available', 'Tablix4', '@Textbox366'),
            ('@AvailableFemale', 'Tablix4', '@Textbox378'),
            ('@AvailableMale', 'Tablix4', '@Textbox235'),
            ('@Below5Child', 'Tablix2', '@Below5Child'),
            ('@HealthNotSatisfactory', 'Tablix2', '@HealthNotSatisfactory'),
            ('@HealthSatisfactory', 'Tablix2', '@HealthSatisfactory'),
            ('@NotFollowingGrowthCurve', 'Tablix2', '@NotFollowingGrowthCurve'),
            ('@NotParticipatingHealthNutriActivities', 'Tablix2', '@NotParticipatingHealthNutriActivities'),
            ('@NotSighted30Days', 'Tablix2', '@NotSighted30Days'),
            ('@NotSighted60Days', 'Tablix2', '@NotSighted60Days'),
            ('@NotSighted90Days', 'Tablix2', '@NotSighted90Days'),
            ('@NotVarifiedHealthGrowthCard', 'Tablix2', '@NotVarifiedHealthGrowthCard'),
            ('@PlannedRC', 'Tablix1', '@Textbox24'),
            ('@PrimarySchoolAge', 'Tablix2', '@PrimarySchoolAge'),
            ('@PrimarySchoolAgeFormal', 'Tablix2', '@PrimarySchoolAgeFormal'),
            ('@PrimarySchoolAgeNoEducation', 'Tablix2', '@PrimarySchoolAgeNoEducation'),
            ('@PrimarySchoolAgeNonFormal', 'Tablix2', '@PrimarySchoolAgeNonFormal'),
            ('@SecondarySchoolAge', 'Tablix2', '@SecondarySchoolAge'),
            ('@SecondarySchoolAgeFormal', 'Tablix2', '@SecondarySchoolAgeFormal'),
            ('@SecondarySchoolAgeNoEducation', 'Tablix2', '@SecondarySchoolAgeNoEducation'),
            ('@SecondarySchoolAgeNonFormal', 'Tablix2', '@SecondarySchoolAgeNonFormal'),
            ('@SecondarySchoolAgeVocational', 'Tablix2', '@SecondarySchoolAgeVocational'),
            ('@SponsorVisitCompleted', 'Tablix2', '@SponsorVisitCompleted'),
            ('@Sponsored', 'Tablix4', '@Textbox233'),
            ('@SponsoredFemale', 'Tablix4', '@Textbox231'),
            ('@SponsoredMale', 'Tablix4', '@Textbox228'),
            ('@TotalDeath', 'Tablix4', '@Textbox237'),
            ('@TotalFemale', 'Tablix4', '@Textbox225'),
            ('@TotalHold', 'Tablix4', '@Textbox353'),
            ('@TotalLeft', 'Tablix4', '@Textbox236'),
            ('@TotalMale', 'Tablix4', '@Textbox212'),
            ('@TotalRC', 'Tablix1', '@Textbox25'),
            ('@VisitCompleted', 'Tablix2', '@VisitCompleted'),
        ]
    }

    _report = {
        'reportDate': report['Tablix1']['@Textbox93'].split(':', 1)[1].strip(),
        'rcData': extract_rc_data(collected_data),
        'rcPieChart': extract_rc_pie_chart(collected_data),

        'healthNutrition': extract_health_nutrition(collected_data),
        'education': extract_education(collected_data),
        'childMonitoring': extract_child_monitoring(collected_data),
        'correspondences': extract_correspondence(correspondence_data),
    }

    return _report
