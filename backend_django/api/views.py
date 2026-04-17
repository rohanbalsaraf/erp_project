from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Student, Faculty

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
