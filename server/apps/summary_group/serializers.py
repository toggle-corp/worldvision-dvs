from django.db.models import Prefetch, Sum, Q
from rest_framework import serializers

from report.report_fields import LABELS
from report.models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
    LanguagePeopleGroupDisability,
)
from .models import SummaryGroup


def _get_report_data(
    increment_obj_field,
    report,
    child_monitoring,
    health_nutrition,
    correspondences,
    education,
    education_fields,
    rc,
):

    if not report.data:
        return

    data = report.data
    date = report.date
    for datum in data['childMonitoring']:
        key = datum['key']
        if key in child_monitoring:
            increment_obj_field(child_monitoring, key, datum['value'], date)
    for datum in data['healthNutrition']:
        key = datum['key']
        if key in health_nutrition:
            increment_obj_field(health_nutrition, key, datum['value'], date)
    for datum in data['correspondences']:
        for key in correspondences.keys():
            increment_obj_field(correspondences, key, datum[key], date)
    for datum in data['education']['children']:
        for key in education_fields[:2]:
            if key == datum.get('key'):
                increment_obj_field(education, key, datum.get('size'), date)
        for c_datum in datum['children']:
            for key in education_fields[2:]:
                if key == c_datum.get('key'):
                    increment_obj_field(education, key, c_datum.get('size'), date)
    for key in rc.keys():
        increment_obj_field(rc, key, data['rcData'].get(key) or 0, date)


def _add_date_to_query(data, fields, year_key='date__year', month_key='date__month'):
    return [
        {
            **{
                field: datum[field]
                for field in fields
            },
            'date': '{:04d}-{:02d}'.format(
                datum[year_key],
                datum[month_key],
            )
        } for datum in data
    ]


def get_projects_summary(qs, group_by_date=False):
    def map_normalize(fields, data):
        if group_by_date:
            return {
                key: {'value': data[key][date], 'label': LABELS[key], 'date': date}
                for key in fields
                for date in data[key]
            }
        return {
            key: {'value': data[key], 'label': LABELS[key]}
            for key in fields
        }

    def normalize(fields, data):
        if group_by_date:
            return [
                {'key': key, 'value': data[key][date], 'label': LABELS[key], 'date': date}
                for key in fields
                for date in data[key]
            ]
        return [
            {'key': key, 'value': data[key], 'label': LABELS[key]}
            for key in fields
        ]

    def increment_obj_field(obj, key, increment, date):
        year_month = date and date.strftime('%Y-%m')
        if group_by_date:
            if obj[key].get(year_month) is None:
                obj[key][year_month] = 0
            obj[key][year_month] += increment
        else:
            obj[key] += increment

    def initial_dict(fields):
        if group_by_date:
            return {field: {} for field in fields}
        return {field: 0 for field in fields}

    child_monitoring_fields = [
        '@NotSighted30Days', '@NotSighted60Days', '@NotSighted90Days',
        '@VisitCompleted'
    ]
    health_nutrition_fields = ['@HealthSatisfactory', '@HealthNotSatisfactory']
    correspondences_fields = ['pendingCurrent', 'pendingOverDue']
    education_fields = [
        '@PrimarySchoolAge', '@SecondarySchoolAge',
        '@PrimarySchoolAgeFormal', '@PrimarySchoolAgeNonFormal', '@PrimarySchoolAgeNoEducation',

        '@SecondarySchoolAgeFormal', '@SecondarySchoolAgeNonFormal', '@SecondarySchoolAgeVocational',
        '@SecondarySchoolAgeNoEducation',
    ]
    rc_fields = [
        'planned', 'totalRc', 'sponsored', 'available', 'hold',
        'death', 'totalMale', 'totalFemale', 'totalLeft',
    ]
    soi_fields = ['total_closed', 'closed_on']
    presenceandparticipation_fields = ['total_rc_temporarily_away', 'total_no_of_rc_records_dropped_during_the_month']

    child_monitoring = initial_dict(child_monitoring_fields)
    health_nutrition = initial_dict(health_nutrition_fields)
    correspondences = initial_dict(correspondences_fields)
    education = initial_dict(education_fields)
    rc = initial_dict(rc_fields)
    soi = initial_dict(soi_fields)
    presenceandparticipation = initial_dict(presenceandparticipation_fields)

    projects = qs.prefetch_related(
        Prefetch('reports', queryset=Report.objects.order_by('-date')),
        Prefetch('projectsoi_set', queryset=ProjectSOI.objects.order_by('-date')),
        Prefetch('presenceandparticipation_set', queryset=PresenceAndParticipation.objects.order_by('-date')),
    )

    for project in projects:
        index = None if group_by_date else 1
        reports = project.reports.all()[:index]
        psois = project.projectsoi_set.all()[:index]
        ppresenceandparticipations = project.presenceandparticipation_set.all()[:index]

        for report in reports:
            _get_report_data(
                increment_obj_field,
                report,
                child_monitoring,
                health_nutrition,
                correspondences,
                education,
                education_fields,
                rc,
            )

        for instances, data in (
            (psois, soi),
            (ppresenceandparticipations, presenceandparticipation)
        ):
            for instance in instances:
                date = instance.date
                for key in data:
                    increment_obj_field(data, key, getattr(instance, key), date)

    registerchildbyageandgender_annotate = {
        '<=6': Sum('count', filter=Q(age__lte=6)),
        '7-12': Sum('count', filter=Q(age__gt=6, age__lte=12)),
        '13-18': Sum('count', filter=Q(age__gt=12, age__lte=18)),
        '18+': Sum('count', filter=Q(age__gt=18)),
    }
    registerchildbyageandgender = []
    childfamilyparticipation = []
    if group_by_date:
        fields = ('date__year', 'date__month', 'gender')
        query = RegisterChildByAgeAndGender.objects.filter(
            project__in=projects,
        ).order_by(*fields).values(*fields).annotate(
            **registerchildbyageandgender_annotate,
        ).values(*fields, *registerchildbyageandgender_annotate.keys())
        registerchildbyageandgender = _add_date_to_query(
            query, ['gender', *registerchildbyageandgender_annotate.keys()]
        )

        fields = ('type', 'participation', 'gender', 'date__year', 'date__month',)
        query = ChildFamilyParticipation.objects.filter(
            project__in=projects,
        ).order_by(*fields).values(*fields).annotate(
            count_sum=Sum('count')
        ).values(*fields, 'count_sum')
        childfamilyparticipation = _add_date_to_query(query, fields[:3])
    else:
        registerchildbyageandgenderdates = RegisterChildByAgeAndGender.objects.filter(
            project__in=projects,
        ).order_by('-date').values_list('date', flat=True)[:1]
        childfamilyparticipationdates = ChildFamilyParticipation.objects.filter(
            project__in=projects,
        ).order_by('-date').values_list('date', flat=True)[:1]

        if registerchildbyageandgenderdates:
            date = registerchildbyageandgenderdates[0]
            fields = ('gender',)
            registerchildbyageandgender = list(
                RegisterChildByAgeAndGender.objects.filter(project__in=projects, date=date)
                .order_by(*fields).values(*fields).annotate(
                    **registerchildbyageandgender_annotate,
                ).values(*fields, *registerchildbyageandgender_annotate.keys())
            )

        if childfamilyparticipationdates:
            childfamilyparticipation_date = childfamilyparticipationdates[0]
            fields = ('type', 'participation', 'gender')
            childfamilyparticipation = list(
                ChildFamilyParticipation.objects.filter(project__in=projects, date=childfamilyparticipation_date)
                .order_by(*fields).values(*fields).annotate(count_sum=Sum('count')).values(*fields, 'count_sum')
            )

    reportDates = projects.filter(
        reports__date__isnull=False,
    ).order_by('reports__date').values_list('reports__date', flat=True)[:1]
    reportDate = reportDates[0] if reportDates else None

    disability_qs = LanguagePeopleGroupDisability.objects.filter(project__in=projects)
    language_people_group_disability = {
        'language': disability_qs.values('date', 'language').annotate(
            count=Sum('count', distinct=True),
        ).order_by('date', '-count', 'language').values('date', 'language', 'count'),
        # NOTE: Using list for djangorestframework-camel-case
        'people_group': list(
            disability_qs.values('date', 'people_group').annotate(
                count=Sum('count', distinct=True),
            ).order_by('date', '-count', 'people_group').values('date', 'people_group', 'count')
        ),
        'disability': disability_qs.values('date', 'disability').annotate(
            count=Sum('count', distinct=True),
        ).order_by('date', '-count', 'disability').values('date', 'disability', 'count'),
    }

    return {
        'report_date': reportDate,
        'child_monitoring': normalize(child_monitoring_fields, child_monitoring),
        'health_nutrition': normalize(health_nutrition_fields, health_nutrition),
        'correspondences': normalize(correspondences_fields, correspondences),
        'education': normalize(education_fields, education),
        'rc': normalize(rc_fields, rc),
        'soi': normalize(soi_fields, soi),
        'presence_and_participation': normalize(presenceandparticipation_fields, presenceandparticipation),
        'register_child_by_age_and_gender': registerchildbyageandgender,
        'child_family_participation_date': (
            'childfamilyparticipation_date' in locals() and childfamilyparticipation_date
        ),
        'child_family_participation': childfamilyparticipation,
        'language_people_group_disability': language_people_group_disability,
    }


class SimpleSummaryGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = SummaryGroup
        fields = '__all__'


class SummaryGroupSerializer(SimpleSummaryGroupSerializer):
    summary = serializers.SerializerMethodField()

    def get_summary(self, obj):
        return get_projects_summary(obj.projects.all())


class SummaryGroupTrendSerializer(SummaryGroupSerializer):
    def get_summary(self, obj):
        return get_projects_summary(obj.projects.all(), group_by_date=True)
