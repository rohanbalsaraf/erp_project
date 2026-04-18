from rest_framework import permissions
from .models import Student, Faculty

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)

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
            
        return bool(request.user.is_staff)

class FacultyOrAdminCreation(permissions.BasePermission):
    """
    Allow anyone authenticated to view, but only Faculty or Admin to create (POST).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.is_staff:
            return True
            
        return Faculty.objects.filter(user=request.user).exists()
