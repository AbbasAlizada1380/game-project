from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Athlete, Fee


# Admin customization for Athlete model
class AthleteAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "last_name",
        "father_name",
        "current_location",
        "created_at",
        "updated_at",
    )
    search_fields = ("name", "last_name", "father_name")
    list_filter = ("created_at", "updated_at")
    ordering = ("created_at",)


# Admin customization for Fee model
class FeeAdmin(admin.ModelAdmin):
    list_display = (
        "athlete",
        "fee",
        "taken",
        "remainder",
        "starting_date",
        "created_at",
        "updated_at",
    )
    list_filter = ("starting_date", "created_at", "updated_at")
    search_fields = ("athlete__name", "athlete__las_name")  # Search by athlete's name
    ordering = ("starting_date",)

    # Optional: Adding a fieldset for better organization
    fieldsets = (
        (None, {"fields": ("athlete", "fee", "taken", "remainder")}),
        (
            "Date Information",
            {
                "fields": ("starting_date",),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    # Optionally, you could set readonly_fields for 'created_at' and 'updated_at' if you want them to be non-editable
    readonly_fields = ("created_at", "updated_at")


# Register the models with the admin site
admin.site.register(Athlete, AthleteAdmin)
admin.site.register(Fee, FeeAdmin)
