from django.contrib import admin


class ModelAdmin(admin.ModelAdmin):
    save_on_top = True
