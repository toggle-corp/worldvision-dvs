from django.core.exceptions import ValidationError
from django.db import models


class SingletonModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SingletonModel, self).save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class SiteSetting(SingletonModel):
    start_date = models.DateField()
    end_date = models.DateField()
    child_family_start_date = models.DateField("Child family support/participation start date", null=True)
    child_family_end_date = models.DateField("Child family support/participation end date", null=True)

    def clean(self):
        if self.start_date and self.end_date and \
                self.start_date > self.end_date:
            raise ValidationError(
                'Start Date shouldn\'t be greater then End Date'
            )
        if self.child_family_start_date and self.child_family_end_date and \
                self.child_family_start_date > self.child_family_end_date:
            raise ValidationError(
                'Start Date shouldn\'t be greater then End Date'
            )

    def __str__(self):
        return 'Site Settings'
