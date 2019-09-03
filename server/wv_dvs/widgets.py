from django.contrib.admin.widgets import RelatedFieldWidgetWrapper as RFWW


class RelatedFieldWidgetWrapper(RFWW):

    def __init__(self, widget, modal_name=None, modal_id=None):
        super().__init__(
            widget=widget.widget,
            rel=widget.rel,
            admin_site=widget.admin_site,
            can_add_related=widget.can_add_related,
            can_change_related=widget.can_change_related,
            can_view_related=widget.can_view_related,
            can_delete_related=widget.can_delete_related,
        )
        self.modal_id = modal_id
        self.modal_name = modal_name

    def get_context(self, *args, **kwargs):
        context = super().get_context(*args, **kwargs)
        if self.modal_name and self.modal_id:
            context['url_params'] += '&%s=%s' % (
                self.modal_name, str(self.modal_id)
            )
        return context
