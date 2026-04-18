from rest_framework import permissions
from .models import Student, Faculty, AdminProfile

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

class FinanceAdminOnly(permissions.BasePermission):
    """
    Only Super Admins and Finance/Accountant Admins have access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_staff:
            return False
            
        try:
            profile = AdminProfile.objects.get(user=request.user)
            return profile.role in ['Super Admin', 'Finance']
        except AdminProfile.DoesNotExist:
            return True # Legacy fallback

class IsTeacherUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return Faculty.objects.filter(user=request.user).exists()

class IsStudentUser(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return Student.objects.filter(user=request.user).exists()

class IsAdminOrTeacher(permissions.BasePermission):
    """
    Allow both Admins and Teachers to manage records.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_staff:
            return True
            
        return Faculty.objects.filter(user=request.user).exists()

class AdminOnlyCreation(permissions.BasePermission):
    """
    Allow anyone authenticated to view, but only Admin to create (POST).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if not request.user.is_staff:
            return False
            
        try:
            from .models import AdminProfile
            profile = AdminProfile.objects.get(user=request.user)
            return profile.role in ['Super Admin', 'Registrar']
        except AdminProfile.DoesNotExist:
            # Fallback for superusers who might not have an AdminProfile record
            return request.user.is_superuser

class FacultyOrAdminCreation(permissions.BasePermission):
    """
    Allow anyone authenticated to view, but only Faculty or Admin to create (POST).
    DEPRECATED: We are moving to AdminOnlyCreation for students.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.is_staff:
            return True
            
        return Faculty.objects.filter(user=request.user).exists()

class CanUpdateStudentDivision(permissions.BasePermission):
    """
    Custom permission to allow teachers to update only students in their department.
    """
    def has_object_permission(self, request, view, obj):
        # Admins can do anything
        if request.user.is_staff:
            return True
            
        # Teachers can only update students in their own department
        try:
            faculty = Faculty.objects.get(user=request.user)
            return obj.department == faculty.department
        except Faculty.DoesNotExist:
            return False
