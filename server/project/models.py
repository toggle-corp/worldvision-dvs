from django.db import models

# Create your models here.


class District(models.Model):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=255, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return '{} ({})'.format(self.name, self.code)


class Project(models.Model):
    name = models.CharField(max_length=255)
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name='projects',
        blank=True, null=True,
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
            return self.selected_report.data.get('rcData')

    def __str__(self):
        return self.name
