from django.core.management.base import BaseCommand
from report.models import Report


class Command(BaseCommand):
    help = 'Force extract report data for all reports or provided report'

    def handle(self, *args, **options):
        for report in Report.objects.all():
            report.data = Report.extract_from_file(report.file)
            report.save()
            self.stdout.write(
                self.style.SUCCESS(
                    'Successfully extract report "{}"'.format(report.name)
                )
            )
