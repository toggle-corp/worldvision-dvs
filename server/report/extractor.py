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

    result['name'] = obj['name']
    if obj.get('size'):
        result['size'] = _numeral(data[obj['size']])

    children = obj.get('children')
    if children:
        result['children'] = []
        for child in children:
            result['children'].append(generate_hierarchy(child, data))

    return result


def extract_rc_data(data):
    return {
        'planned': _numeral(data['@PlannedRC']),
        'sponsered': _numeral(data['@Sponsored']),
        'available': _numeral(data['@Available']),
        'hold': _numeral(data['@TotalHold']),
        'death': _numeral(data['@TotalDeath']),
    }


def extract_health_nutrition(data):
    fields = (
       #   Title, Field, status
       ('Satisfactory', '@HealthSatisfactory', 'good'),
       ('Not Satisfactory', '@HealthNotSatisfactory', 'bad'),
       ('#RC Aged 0 – 59 Months', '@Below5Child', 'normal'),
       ('Not Participating in Health/Nutrition Activities', '@NotParticipatingHealthNutriActivities', 'normal'),  # noqa E501
       ('Health/Growth Card Not Verified', '@NotVarifiedHealthGrowthCard', 'bad'),
       ('Child Not Following Growth Curve', '@NotFollowingGrowthCurve', 'bad'),
       ('MUAC Severe Malnutrition', '@MUACSevereMalnutrition', 'bad'),
       ('MUAC Acute Malnutrition', '@MUACModerateMalnutrition', 'bad'),
       ('Partially Immunized and with No Vaccination in Last 12 Months', '@MUACPartiallyImmunized', 'normal'),  # noqa E501
    )
    return [
        {'name': _d[0], 'value': _numeral(data.get(_d[1])), 'type': _d[2], 'key': _d[1]}
        for _d in fields
    ]


def extract_rc_pie_chart(data):
    fields = [
        {
            'name': 'Planned RC',
            'size': '@PlannedRC',
        },
        {
            'name': 'Actual',
            # 'size': '@TotalRC',
            'children': [
                {
                    'name': 'Sponsored',
                    # 'size': '@Sponsored',
                    'children': [
                        {
                            'name': 'Male',
                            'size': '@SponsoredMale',
                        },
                        {
                            'name': 'Female',
                            'size': '@SponsoredFemale',
                        },
                    ],
                },
                {
                    'name': 'Available',
                    # 'size': '@Available',
                    'children': [
                        {
                            'name': 'Male',
                            'size': '@AvailableMale',
                        },
                        {
                            'name': 'Female',
                            'size': '@AvailableFemale',
                        },
                    ],
                },
            ],
        },
        {
            'name': 'Hold',
            'size': '@TotalHold',
        },
    ]

    return generate_hierarchy({
        'name': 'RC Supply',
        'children': fields,
    }, data)


def extract_education(data):
    fields = [
        {
            'name': '#RC of Primary School Age',
            # 'size': '@PrimarySchoolAge',
            'children': [
                {
                    'name': 'RC of Primary School Age Involved in Formal Education',
                    'size': '@PrimarySchoolAgeFormal',
                },
                {
                    'name': 'RC of Primary School Age Involved in Non-Formal Education',
                    'size': '@PrimarySchoolAgeNonFormal',
                },
                {
                    'name': 'RC of Primary School Age Not Involved in Education',
                    'size': '@PrimarySchoolAgeNoEducation',
                },
            ],
        },

        {
            'name': '#RC of Secondary School Age',
            # 'size': '@SecondarySchoolAge',
            'children': [
                {
                    'name': 'RC of Secondary School Age Involved in Formal Education',
                    'size': '@SecondarySchoolAgeFormal',
                },
                {
                    'name': 'RC of Secondary School Age Involved in Non-Formal Education',
                    'size': '@SecondarySchoolAgeNonFormal',
                },
                {
                    'name': 'RC of Secondary School Age Involved in Vocational Preparation',
                    'size': '@SecondarySchoolAgeVocational',
                },
                {
                    'name': 'RC of Secondary School Age Not Involved in Education or Vocational Preparation',  # noqa E501
                    'size': '@SecondarySchoolAgeNoEducation',
                },
            ],
        },
    ]

    return generate_hierarchy({
        'name': 'Education',
        'children': fields,
    }, data)


def extract_child_monitoring(data):
    fields = (
       ('Not Sighted More than 30 Days & Less than 60 Days', '@NotSighted30Days'),
       ('Not Sighted More than 60 Days & Less than 90 Days', '@NotSighted60Days'),
       ('Not Sighted More than 90 Days', '@NotSighted90Days'),
       ('Visits Completed in Report Period', '@VisitCompleted'),
       ('Sponsor Visits Completed in Report Period', '@SponsorVisitCompleted'),
    )
    return [{'name': _d[0], 'value': _numeral(data.get(_d[1])), 'key': _d[1]} for _d in fields]


def extract_correspondence(data):
    def normalize(_d, fields):
        return {
            field[0]: _numeral(_d[field[1]], ignore=True)
            for field in fields
        }

    fields = (
        ('typeName', '@TypeName'),
        ('initial', '@Initial'),
        ('received', '@Received'),
        ('closed', '@Closed'),
        ('pendingCurrent', '@PendingCurrent'),
        ('pendingOverDue', '@PendingOverDue'),
        ('pendingTotal', '@Textbox370'),
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
