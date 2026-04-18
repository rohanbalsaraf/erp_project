from django.urls import path
from .views import (
    UserProfileView, StudentListView, FacultyListView, RegisterView,
    AttendanceListView, AssignmentListView, AssignmentSubmissionListView, 
    ProjectListView, ProjectDetailView, LeaveListView, LeaveDetailView,
    FeeListView, SalaryListView, NotificationListView, NotificationDetailView, TimetableListView, 
    ResultListView, DashboardStatsView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('faculty/', FacultyListView.as_view(), name='faculty-list'),
    path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('assignments/', AssignmentListView.as_view(), name='assignment-list'),
    path('submissions/', AssignmentSubmissionListView.as_view(), name='submission-list'),
    path('projects/', ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('leaves/', LeaveListView.as_view(), name='leave-list'),
    path('leaves/<int:pk>/', LeaveDetailView.as_view(), name='leave-detail'),
    path('fees/', FeeListView.as_view(), name='fee-list'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetailView.as_view(), name='notification-detail'),
    path('timetable/', TimetableListView.as_view(), name='timetable-list'),
    path('results/', ResultListView.as_view(), name='result-list'),
    path('salaries/', SalaryListView.as_view(), name='salary-list'),
]
