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
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name='projects',
        null=True,
    )
    municipalities = models.ManyToManyField(
        Municipality,
        blank=True,
    )
    selected_report = models.OneToOneField(
        'report.Report', related_name='+',
        on_delete=models.DO_NOTHING,
        blank=True, null=True,
    )

    # Cordinates
    long = models.DecimalField(max_digits=9, decimal_places=6)
    lat = models.DecimalField(max_digits=9, decimal_places=6)

    def get_rc_data(self):
        if self.selected_report:
            fields = [
                'planned', 'sponsored',
                'available', 'hold', 'death',
                'totalMale', 'totalFemale'
            ]
            rc_data = self.selected_report.data.get('rcData')
            return [
                {
                    'name': LABELS[field],
                    'value': rc_data[field],
                } for field in fields
            ]

    def __str__(self):
        return self.name
