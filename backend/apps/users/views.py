import datetime
import random

from apps.users.models import UserProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.db import transaction
from django.db.models import Max, OuterRef, Q, Subquery
from django.dispatch import receiver
from django.http import Http404, HttpResponse
from django.shortcuts import render
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Role, User, UserProfile
from .serializers import (
    CreateUserSerializer,
    MyTokenObtainPairSerializer,
    ProfilePicUpdateSerializer,
    ProfileSerializer,
    RoleSerializer,
    UpdateUserSerializer,
    UserSerializer,
)
from .utils import send_email_notification

# Get the custom User model
User = get_user_model()


class RoleViewSet(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]


class RoleViewSetRetrieveDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [
        AllowAny
    ]  # Change this if you want to require authentication globally

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def create_user(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    "message": "User created successfully",
                    "user": UserSerializer(user).data,
                },
                status=201,
            )
        return Response(serializer.errors, status=400)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Retrieve the user profile for the logged-in user
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = ProfilePicUpdateSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

    def put(self, request):
        try:
            # Get the user profile related to the authenticated user
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {"detail": "User profile not found."}, status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            # Save the updated profile to the database
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateUserView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CreateUserSerializer

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                with transaction.atomic():
                    # Create the user
                    user = serializer.save()
                    user.is_active = (
                        False  # User is inactive until they verify the email
                    )
                    user.save()

                    # # Generate the token and uid
                    # uid = urlsafe_base64_encode(force_bytes(user.pk))
                    # token = default_token_generator.make_token(user)

                    # # Prepare the activation link
                    # activation_link = (
                    #     f"http://localhost:8000/users/activate/{uid}/{token}/"
                    # )

                    # email_subject = "Activate Your Account"
                    # email_template = (
                    #     "account/email/activation_email.html"  # Path to the template
                    # )

                    # # Now correctly pass the request object to send_email_notification
                    # send_email_notification(request, user, email_subject, email_template, activation_link)

                    return Response(
                        {
                            "message": "User created successfully. Please check your email to verify your account.",
                            
                        },
                        status=status.HTTP_201_CREATED,
                    )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def activate_account(request, uidb64, token):
    try:
        # Decode the UID
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)

        # Validate the token
        if default_token_generator.check_token(user, token):
            # Token is valid, activate the user
            user.is_active = True
            user.save()

            return render(
                request,
                "account/email/activation_success.html",
                {
                    "user": user,
                    "current_year": datetime.datetime.now().year,
                },
            )
        else:
            return HttpResponse("Invalid activation link", status=400)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Invalid activation link", status=400)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return HttpResponse("Invalid activation link", status=400)


class RoleChoicesView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [AllowAny]
    

class DeleteUserView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if user.is_staff:  # Admin can delete any user
            return User.objects.get(pk=self.kwargs["pk"])
        else:  # Regular users can only delete their own account
            return user

    def delete(self, request, *args, **kwargs):
        user = self.get_object()

        if (
            user == request.user or request.user.is_staff
        ):  # Check if the user is deleting themselves or is an admin
            user.delete()
            return Response(
                {"message": "User deleted successfully."},
                status=status.HTTP_204_NO_CONTENT,
            )
        else:
            return Response(
                {"error": "You are not authorized to delete this user."},
                status=status.HTTP_403_FORBIDDEN,
            )


class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UpdateUserSerializer
    permission_classes = [AllowAny]  # Customize based on your use case

    def get_object(self):
        user = self.request.user
        try:
            # Admin can update any user, but normal users can only update themselves
            if user.is_staff:
                return User.objects.get(pk=self.kwargs["pk"])
            elif user.id == self.kwargs["pk"]:
                return user
            else:
                raise PermissionDenied(
                    "You do not have permission to update this user."
                )
        except User.DoesNotExist:
            raise NotFound("User not found")

    def get(self, request, *args, **kwargs):
        """
        Retrieve user data (for the update form).
        """
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        """
        Update user data with PATCH method (only partial update).
        """
        return self.update(request, *args, **kwargs)

    def put(self, request, *args, **kwargs):
        """
        Update user data with PUT method (full update).
        """
        return self.update(request, *args, **kwargs)

    def perform_update(self, serializer):
        # Pass the request object to the serializer so we can access the user
        serializer.save(user=self.request.user)


class ProfilePicUpdateView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    queryset = UserProfile.objects.all()
    serializer_class = ProfilePicUpdateSerializer
    lookup_field = "user__email"

    def get_object(self):
        user_email = self.kwargs.get("user_email")
        try:
            return UserProfile.objects.get(user__email=user_email)
        except UserProfile.DoesNotExist:
            raise Http404("UserProfile not found")

    def get(self, request, *args, **kwargs):
        # Get the user profile based on the email provided
        profile = self.get_object()
        # Serialize and return the profile data
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        # List all user profiles
        queryset = UserProfile.objects.all()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def put(self, request, *args, **kwargs):
        # Update the user profile
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the updated profile
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        """
        Create a new user profile with the provided data (e.g., profile picture).
        """
        # Create a new profile with the data provided in the request
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Save the new profile (this will create a new UserProfile)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Return validation errors if the data is invalid
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_random_opt_code(length=8):
    otp = "".join([str(random.randint(0, 9)) for _ in range(length)])
    return otp


class PasswordRegisterEmailVerifyApiView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        email = self.kwargs["email"]
        user = User.objects.filter(email=email).first()
        if user:
            uuidb64 = user.pk
            refresh = RefreshToken.for_user(user)
            refresh_token = str(refresh.access_token)
            user.refresh_token = refresh_token
            user.otp = generate_random_opt_code()
            user.save()

            link = f"http://localhost:5173/create-new-password?otp={user.otp}&uuidb64={uuidb64}&refresh_token={refresh_token}"
            print("link =====>", link)
            # # Define email subject and template
            # email_subject = "Reset Email Verification"
            # email_template = "account/email/reset_password_email.html"

            # # Send the reset password email
            # send_email_notification_task.delay(
            #     user.id, email_subject, email_template, link
            # )

        return user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if user:
            return Response({"message": "Reset password email sent"})
        return Response({"message": "User not found"}, status=404)

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        if user:
            return Response({"message": "Reset password email sent"})
        return Response({"message": "User not found"}, status=404)


class PasswordChangeApiView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        otp = request.data.get("otp")
        uuidb64 = request.data.get("uuidb64")  # This is your encoded UUID
        password = request.data.get("password")

        if not otp or not uuidb64 or not password:
            return Response(
                {"message": "Missing required fields."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Ensure the base64 string is decoded properly
            user_id = urlsafe_base64_decode(uuidb64).decode("utf-8")

            # Fetch the user with decoded ID and OTP
            user = User.objects.get(id=user_id, otp=otp)

            # Reset the password
            user.set_password(password)
            user.otp = ""  # Clear OTP after password reset
            user.save()

            return Response(
                {"message": "Password changed successfully."},
                status=status.HTTP_201_CREATED,
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User does not exist or invalid OTP."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            return Response(
                {"message": f"Error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ProfileDetail(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProfileSerializer
    queryset = UserProfile.objects.all()
