from django.shortcuts import render

# Create your views here.
from rest_framework import generics

from .models import Athlete, Fee
from .serializers import AthleteSerializer, FeeSerializer


# Athlete List & Create View
class AthleteListCreateView(generics.ListCreateAPIView):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer


# Athlete Retrieve, Update, Delete View
class AthleteRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer


# Fee List & Create View
class FeeListCreateView(generics.ListCreateAPIView):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer


# Fee Retrieve, Update, Delete View
class FeeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
