from django.contrib import admin

from .models import SummaryGroup


@admin.register(SummaryGroup)
class SummaryGroupAdmin(admin.ModelAdmin):
    search_fields = ('name', 'code')
