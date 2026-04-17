from .views import UserProfileView, StudentListView, AttendanceListView, FacultyListView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('students/', StudentListView.as_view(), name='student-list'),
    path('attendance/', AttendanceListView.as_view(), name='attendance-list'),
    path('faculty/', FacultyListView.as_view(), name='faculty-list'),
]
