from datetime import datetime

from django.db import models
from django.utils.translation import gettext_lazy as _


class Athlete(models.Model):
    name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    father_name = models.CharField(max_length=255)
    current_location = models.CharField(max_length=255)
    permanent_location = models.CharField(max_length=255)
    nic = models.FileField(null=True, blank=True)  # Allow null and blank
    picture = models.ImageField(upload_to="images/", null=True, blank=True)
    document = models.ImageField(upload_to="images", null=True, blank=True)
    date_of_birth = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Athlete")
        verbose_name_plural = _("Athletes")

    def __str__(self):
        return self.name


class Fee(models.Model):
    athlete = models.ForeignKey(Athlete, on_delete=models.CASCADE, related_name="athlete")
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    taken = models.DecimalField(max_digits=10, decimal_places=2)
    remainder = models.DecimalField(max_digits=10, decimal_places=2)
    starting_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Fee")
        verbose_name_plural = _("Fees")

    def __str__(self):
        return f"Fee for {self.athlete.name}"

    def save(self, *args, **kwargs):

        super().save(*args, **kwargs)
