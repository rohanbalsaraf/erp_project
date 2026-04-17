from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Student, Faculty, Attendance
from .serializers import StudentSerializer, AttendanceSerializer, TimetableSerializer, NotificationSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "username": user.username,
            "email": user.email,
            "role": "admin" if user.is_staff else "user"
        }
        
        # Check for specific profiles
        try:
            student = Student.objects.get(user=user)
            data["role"] = "student"
            data["profile"] = {
                "student_id": student.student_id,
                "department": student.department
            }
        except Student.DoesNotExist:
            try:
                faculty = Faculty.objects.get(user=user)
                data["role"] = "faculty"
                data["profile"] = {
                    "employee_id": faculty.employee_id,
                    "department": faculty.department
                }
            except Faculty.DoesNotExist:
                pass
                
        return Response(data)

class StudentListView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

class AttendanceListView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Attendance.objects.all()
        try:
            student = Student.objects.get(user=user)
            return Attendance.objects.filter(student=student)
        except Student.DoesNotExist:
            return Attendance.objects.none()
