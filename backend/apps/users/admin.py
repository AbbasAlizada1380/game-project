from django.contrib import admin

from .models import User, UserProfile


class ChatAdmin(admin.ModelAdmin):
    list_display = ["id", "sender", "receiver", "is_read", "date"]
    list_filter = ["sender", "receiver", "is_read"]
    list_display_links = ["sender", "receiver"]


admin.site.register(UserProfile)


class AdminUser(admin.ModelAdmin):
    list_display = ["id", "email", "is_active"]
    search_fields = ["email"]  # Allows searching users by email
    list_filter = ["is_active"]  # Allows filtering by is_active, remove if unnecessary


admin.site.register(User, AdminUser)
