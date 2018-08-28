from django.db import models

# Create your models here.


class Project(models.Model):
    name = models.CharField(max_length=255)
    selected_report = models.OneToOneField(
        'report.Report', related_name='+', on_delete=None,
        blank=True, null=True,
    )

    # Cordinates
    long = models.DecimalField(max_digits=9, decimal_places=6)
    lat = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return 'Project: %s' % self.name
