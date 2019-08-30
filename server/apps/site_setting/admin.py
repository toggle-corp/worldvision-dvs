from django.contrib import admin

from .models import SiteSetting


@admin.register(SiteSetting)
class SiteSettingsAdmin(admin.ModelAdmin):

    def has_add_permission(self, request, obj=None):
        if self.get_queryset(request).count():
            return False
        return True
