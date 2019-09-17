from django.db import models
from report.report_fields import LABELS

# Create your models here.


class District(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return '{} ({})'.format(self.name, self.code)


class Municipality(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=255, unique=True)
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name='municipalities',
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return '{} ({})'.format(self.name, self.code)


class Project(models.Model):
    name = models.CharField(max_length=255)
    number = models.CharField(unique=True, null=True, blank=True, max_length=10)
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name='projects',
        null=True,
    )
    municipalities = models.ManyToManyField(
        Municipality,
        blank=True,
    )

    # Cordinates
    long = models.DecimalField(max_digits=9, decimal_places=6, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True)

    @property
    def selected_report(self):
        if self.reports.count():
            return self.reports.order_by('-id').first()

    def get_rc_data(self):
        report = self.selected_report
        if report and report.data:
            fields = [
                'planned', 'totalRc', 'sponsored',
                'available', 'hold', 'death',
                'totalMale', 'totalFemale'
            ]
            rc_data = report.data.get('rcData')
            return [
                {
                    'name': LABELS[field],
                    'value': rc_data[field],
                } for field in fields
            ]

    def __str__(self):
        return f'{self.name} - {self.number}'
