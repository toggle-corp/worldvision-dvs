from project.models import Project


def get_or_create_project(project_number, name=None):
    project, pj_created = Project.objects.get_or_create(number=project_number)
    if name:
        project.name = name
        project.save()
    return project
