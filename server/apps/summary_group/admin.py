from django.contrib import admin

from wv_dvs.admin import ModelAdmin
from .models import SummaryGroup


@admin.register(SummaryGroup)
class SummaryGroupAdmin(ModelAdmin):
    list_display = ('name', 'get_project_count')
    search_fields = ('name',)
    filter_horizontal = ('projects',)

    def get_project_count(self, instance):
        return instance.projects.count()

    get_project_count.short_description = 'Project Count'
