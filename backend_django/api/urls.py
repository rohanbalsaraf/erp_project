from django.urls import path
from .views import (
    UserProfileView, 
    StudentListView, 
    AttendanceListView, 
    FacultyListView,
    NotificationListView,
    TimetableListView
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('faculty/', FacultyListView.as_view(), name='faculty-list'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('timetable/', TimetableListView.as_view(), name='timetable-list'),
    path('results/', ResultListView.as_view(), name='result-list'),
]
