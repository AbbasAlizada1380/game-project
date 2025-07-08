from rest_framework import generics, permissions, serializers, status

from .models import Athlete, Fee


class AthleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Athlete
        fields = [
            "id",
            "name",
            "last_name",
            "father_name",
            "current_location",
            "permanent_location",
            "nic",
            "picture",
            "document",
            "date_of_birth",
            "created_at",
            "updated_at",
        ]


class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = [
            "id",
            "athlete",
            "fee",
            "taken",
            "remainder",
            "starting_date",
            "created_at",
            "updated_at",
        ]
