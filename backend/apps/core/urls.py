from django.urls import path

from .views import (
    AthleteListCreateView,
    AthleteRetrieveUpdateDestroyView,
    FeeListCreateView,
    FeeRetrieveUpdateDestroyView,
)

urlpatterns = [
    # Athlete endpoints
    path("athletes/", AthleteListCreateView.as_view(), name="athlete-list-create"),
    path(
        "athletes/<int:pk>/",
        AthleteRetrieveUpdateDestroyView.as_view(),
        name="athlete-detail",
    ),
    # Fee endpoints
    path("fees/", FeeListCreateView.as_view(), name="fee-list-create"),
    path("fees/<int:pk>/", FeeRetrieveUpdateDestroyView.as_view(), name="fee-detail"),
]
