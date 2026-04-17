from django.contrib import admin
from .models import Student, Faculty, Attendance, Timetable, Notification

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'name', 'department', 'email')
    search_fields = ('student_id', 'name')

@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'name', 'department')
    search_fields = ('employee_id', 'name')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'course', 'status')
    list_filter = ('date', 'course', 'status')

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('day', 'time', 'course', 'room', 'department')
    list_filter = ('day', 'department')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'date')
    search_fields = ('title', 'message')
