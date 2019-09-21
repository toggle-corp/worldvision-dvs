from django.db.models import Prefetch, Sum
from rest_framework import serializers

from report.report_fields import LABELS
from report.models import (
    Report,
    ProjectSOI,
    RegisterChildByAgeAndGender,
    PresenceAndParticipation,
    ChildFamilyParticipation,
)
from .models import SummaryGroup


def get_projects_summary(qs):
    def map_normalize(fields, data):
        return {
            key: {'value': data[key], 'label': LABELS[key]}
            for key in fields
        }

    def normalize(fields, data):
        return [
            {'key': key, 'value': data[key], 'label': LABELS[key]}
            for key in fields
        ]

    def initial_dict(fields):
        return {field: 0 for field in fields}

    child_monitoring_fields = [
        '@NotSighted30Days', '@NotSighted60Days', '@NotSighted90Days',
        '@VisitCompleted'
    ]
    health_nutrition_fields = ['@HealthSatisfactory', '@HealthNotSatisfactory']
    correspondences_fields = ['pendingCurrent', 'pendingOverDue']
    education_fields = [
        '@PrimarySchoolAge', '@SecondarySchoolAge',
        '@PrimarySchoolAgeNonFormal', '@PrimarySchoolAgeNoEducation',
        '@SecondarySchoolAgeNonFormal', '@SecondarySchoolAgeVocational', '@SecondarySchoolAgeNoEducation',
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
        Prefetch('reports', queryset=Report.objects.order_by('-id')),
        Prefetch('projectsoi_set', queryset=ProjectSOI.objects.order_by('-date')),
        Prefetch('presenceandparticipation_set', queryset=PresenceAndParticipation.objects.order_by('-date')),
    )

    for project in projects:
        report = project.reports.first()
        psoi = project.projectsoi_set.first()
        ppresenceandparticipation = project.presenceandparticipation_set.first()

        if report and report.data:
            data = report.data
            for datum in data['childMonitoring']:
                key = datum['key']
                if key in child_monitoring:
                    child_monitoring[key] += datum['value']
            for datum in data['healthNutrition']:
                key = datum['key']
                if key in health_nutrition:
                    health_nutrition[key] += datum['value']
            for datum in data['correspondences']:
                for key in correspondences.keys():
                    correspondences[key] += datum[key]
            for datum in data['education']['children']:
                for key in education_fields[:2]:
                    if key == datum.get('key'):
                        education[key] += datum.get('size')
                for c_datum in datum['children']:
                    for key in education_fields[2:]:
                        if key == c_datum.get('key'):
                            education[key] += c_datum.get('size')
            for key in rc.keys():
                rc[key] += data['rcData'].get(key) or 0

        for instance, data in (
            (psoi, soi),
            (ppresenceandparticipation, presenceandparticipation)
        ):
            if instance is None:
                continue
            for key in data:
                data[key] += getattr(instance, key)

    registerchildbyageandgenderdates = RegisterChildByAgeAndGender.objects.filter(
        project__in=projects
    ).order_by('-date').values_list('date', flat=True)[:1]
    childfamilyparticipationdates = ChildFamilyParticipation.objects.filter(
        project__in=projects
    ).order_by('-date').values_list('date', flat=True)[:1]

    if registerchildbyageandgenderdates:
        date = registerchildbyageandgenderdates[0]
        fields = ('age_range', 'gender',)
        registerchildbyageandgender = list(
            RegisterChildByAgeAndGender.objects.filter(date=date)
            .order_by(*fields).values(*fields).annotate(count_sum=Sum('count')).values(*fields, 'count_sum')
        )

    if childfamilyparticipationdates:
        date = childfamilyparticipationdates[0]
        fields = ('type', 'participation', 'gender')
        childfamilyparticipation = list(
            ChildFamilyParticipation.objects.filter(date=date)
            .order_by(*fields).values(*fields).annotate(count_sum=Sum('count')).values(*fields, 'count_sum')
        )

    reportDates = projects.filter(
        reports__data__reportDate__isnull=False,
    ).order_by('reports__data__reportDate').values_list('reports__data__reportDate', flat=True)[:1]
    reportDate = reportDates[0] if reportDates else None

    return {
        'report_date': reportDate,
        'child_monitoring': normalize(child_monitoring_fields, child_monitoring),
        'health_nutrition': normalize(health_nutrition_fields, health_nutrition),
        'correspondences': normalize(correspondences_fields, correspondences),
        'education': map_normalize(education_fields, education),
        'rc': normalize(rc_fields, rc),
        'soi': normalize(soi_fields, soi),
        'presence_and_participation': normalize(presenceandparticipation_fields, presenceandparticipation),
        'register_child_by_age_and_gender': registerchildbyageandgender,
        'child_family_participation': childfamilyparticipation,
    }


class SummaryGroupSerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()

    class Meta:
        model = SummaryGroup
        fields = '__all__'

    def get_summary(self, obj):
        return get_projects_summary(obj.projects.all())
