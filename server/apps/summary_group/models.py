from django.db import models

from project.models import Project


class SummaryGroup(models.Model):
    name = models.CharField(max_length=255, unique=True)
    projects = models.ManyToManyField(Project)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
