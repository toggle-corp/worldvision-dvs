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

    def clean(self):
        if self.start_date and self.end_date and \
                self.start_date > self.end_date:
            raise ValidationError(
                'Start Date shouldn\'t be greater then End Date'
            )

    def __str__(self):
        return 'Site Settings'
