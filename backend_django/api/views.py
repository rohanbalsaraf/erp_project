from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string
from django.db.models import Count, Q, Sum
from .models import (
    Student, Faculty, AdminProfile, Attendance, Notification, Timetable, Result,
    Assignment, AssignmentSubmission, Project, Leave, Fee, Salary, Document
)
from .serializers import (
    StudentSerializer, AttendanceSerializer, TimetableSerializer, 
    NotificationSerializer, FacultySerializer, ResultSerializer,
    AssignmentSerializer, AssignmentSubmissionSerializer, ProjectSerializer, 
    LeaveSerializer, FeeSerializer, SalarySerializer, DocumentSerializer, UserRegistrationSerializer
)
from .permissions import IsAdminUser, IsTeacherUser, IsStudentUser, AdminOnlyCreation, IsAdminOrTeacher, FacultyOrAdminCreation, CanUpdateStudentDivision
from .storage import upload_to_supabase


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": "admin" if user.is_staff else "user",
            "sub_role": "Base User"
        }
        
        try:
            student = Student.objects.get(user=user)
            data["role"] = "student"
            data["sub_role"] = student.role
            data["profile"] = {
                "id": student.id,
                "student_id": student.student_id,
                "department": student.department
            }
        except Student.DoesNotExist:
            try:
                faculty = Faculty.objects.get(user=user)
                data["role"] = "teacher"
                data["sub_role"] = faculty.role
                data["profile"] = {
                    "id": faculty.id,
                    "employee_id": faculty.employee_id,
                    "department": faculty.department
                }
            except Faculty.DoesNotExist:
                if user.is_staff:
                    try:
                        admin_prof = AdminProfile.objects.get(user=user)
                        data["sub_role"] = admin_prof.role
                        data["profile"] = {
                            "department": admin_prof.department,
                            "role": admin_prof.role
                        }
                    except AdminProfile.DoesNotExist:
                        data["sub_role"] = "Super Admin"
                        data["profile"] = { "department": None, "role": "Super Admin" }
                
        return Response(data)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        stats = {}

        if user.is_staff: # Admin
            stats = {
                "role": "admin",
                "total_students": Student.objects.count(),
                "total_faculty": Faculty.objects.count(),
                "pending_leaves": Leave.objects.filter(applicant_type='Teacher', status='Pending').count(),
                "total_documents": Document.objects.count(),
                "total_salary_paid": Salary.objects.filter(status='Paid').aggregate(Sum('amount'))['amount__sum'] or 0
            }
        else:
            try:
                faculty = Faculty.objects.get(user=user)
                stats = {
                    "role": "teacher",
                    "my_students": Student.objects.filter(department=faculty.department).count(),
                    "assignments_posted": Assignment.objects.filter(teacher=faculty).count(),
                    "projects_tracked": Project.objects.filter(student__department=faculty.department).count(),
                    "attendance_avg": "88%" # Simplified for now
                }
            except Faculty.DoesNotExist:
                try:
                    student = Student.objects.get(user=user)
                    total_attendance = Attendance.objects.filter(student=student).count()
                    present_count = Attendance.objects.filter(student=student, status='Present').count()
                    attendance_pct = (present_count / total_attendance * 100) if total_attendance > 0 else 0
                    
                    stats = {
                        "role": "student",
                        "attendance": f"{int(attendance_pct)}%",
                        "pending_assignments": Assignment.objects.filter(department=student.department).count(),
                        "my_projects": Project.objects.filter(student=student).count(),
                        "pending_fees": Fee.objects.filter(student=student, status='Unpaid').count()
                    }
                except Student.DoesNotExist:
                    stats = {"role": "unknown"}

        return Response(stats)

# --- ADMIN VIEW: Add Teacher ---
class FacultyListView(generics.ListCreateAPIView):
    queryset = Faculty.objects.all()
    serializer_class = FacultySerializer
    permission_classes = [IsAdminUser]

# --- ADMIN ONLY: Admit Student & TEACHER: View Students ---
class StudentListView(generics.ListCreateAPIView):
    serializer_class = StudentSerializer
    # Only Admin can CREATE, but anyone can view based on get_queryset
    permission_classes = [AdminOnlyCreation] 

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Student.objects.none()
            
        if user.is_staff:
            return Student.objects.all()
        try:
            faculty = Faculty.objects.get(user=user)
            return Student.objects.filter(department=faculty.department)
        except Faculty.DoesNotExist:
            return Student.objects.none()

class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated, CanUpdateStudentDivision]

# --- REGISTRATION VIEW (Public) ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

# --- ATTENDANCE (Teacher manages, Student views) ---
class AttendanceListView(generics.ListCreateAPIView):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [FacultyOrAdminCreation]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Attendance.objects.all()
        try:
            student = Student.objects.get(user=user)
            return Attendance.objects.filter(student=student)
        except Student.DoesNotExist:
            return Attendance.objects.all()

# --- ASSIGNMENTS & SUBMISSIONS ---
class AssignmentListView(generics.ListCreateAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [FacultyOrAdminCreation]

class AssignmentSubmissionListView(generics.ListCreateAPIView):
    queryset = AssignmentSubmission.objects.all()
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            url = upload_to_supabase(file_obj, bucket_name="erp_documents")
            if url:
                data['file_link'] = url

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return AssignmentSubmission.objects.all()
        try:
            faculty = Faculty.objects.get(user=user)
            return AssignmentSubmission.objects.filter(assignment__teacher=faculty)
        except Faculty.DoesNotExist:
            try:
                student = Student.objects.get(user=user)
                return AssignmentSubmission.objects.filter(student=student)
            except Student.DoesNotExist:
                return AssignmentSubmission.objects.none()

# --- PROJECTS (Teacher manages, Student views/updates own) ---
class ProjectListView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            student = Student.objects.get(user=user)
            return Project.objects.filter(student=student)
        except Student.DoesNotExist:
            return Project.objects.all()

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- LEAVE MANAGEMENT ---
class LeaveListView(generics.ListCreateAPIView):
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Admins focus exclusively on staff (Teachers)
            return Leave.objects.filter(applicant_type='Teacher')
            
        try:
            faculty = Faculty.objects.get(user=user)
            # Teachers see all Students + their own record
            return Leave.objects.filter(
                Q(applicant_type='Student') | 
                Q(applicant_type='Teacher', applicant_id=faculty.id)
            )
        except Faculty.DoesNotExist:
            try:
                student = Student.objects.get(user=user)
                # Students remain siloed to their own requests
                return Leave.objects.filter(applicant_type='Student', applicant_id=student.id)
            except Student.DoesNotExist:
                return Leave.objects.none()

class LeaveDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

class FeeListView(generics.ListCreateAPIView):
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            student = Student.objects.get(user=user)
            return Fee.objects.filter(student=student)
        except Student.DoesNotExist:
            return Fee.objects.all()

class SalaryListView(generics.ListCreateAPIView):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer
    permission_classes = [AdminOnlyCreation]

    def get_queryset(self):
        user = self.request.user
        if not user.is_staff:
            return Salary.objects.filter(user=user)
        return Salary.objects.all()

# --- NOTIFICATIONS & TIMETABLE ---
class NotificationListView(generics.ListCreateAPIView):
    queryset = Notification.objects.all().order_by('-date')
    serializer_class = NotificationSerializer
    permission_classes = [FacultyOrAdminCreation]

class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAdminUser]

class TimetableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [FacultyOrAdminCreation]

# --- DOCUMENT VAULT ---
class DocumentListView(generics.ListCreateAPIView):
    queryset = Document.objects.all().order_by('-date_uploaded')
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # We explicitly lock creation to admins/staff at the logic level
        if not request.user.is_staff:
            return Response({"detail": "Only administrators can upload root documents."}, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['uploaded_by'] = request.user.id
        
        if 'file' in request.FILES:
            file_obj = request.FILES['file']
            url = upload_to_supabase(file_obj, bucket_name="erp_documents")
            if url:
                data['file_url'] = url
            else:
                return Response({"detail": "Cloud upload failed."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({"detail": "No physical file provided."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class TimetableListView(generics.ListCreateAPIView):
    queryset = Timetable.objects.all()
    serializer_class = TimetableSerializer
    permission_classes = [FacultyOrAdminCreation]

class ResultListView(generics.ListAPIView):
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [permissions.IsAuthenticated]

# --- RECOVERY VIEW: Forgot Password/ID ---
class RecoverCredentialsView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Look up in Student, Faculty, and AdminProfile
        users = []
        
        # Check Students
        students = Student.objects.filter(email=email)
        for s in students:
            users.append(s.user)
            
        # Check Faculty
        faculties = Faculty.objects.filter(email=email)
        for f in faculties:
            users.append(f.user)
            
        # AdminProfile doesn't have an email field, it uses User.email
        # but the way we've set it up, they might be manually created.
        admins = User.objects.filter(email=email, is_staff=True)
        for u in admins:
            if u not in users:
                users.append(u)

        if not users:
            return Response({"detail": "No account found with this email."}, status=status.HTTP_404_NOT_FOUND)

        # For this demo, we pick the first user found (or list them all)
        # and reset their password to a new random string.
        user = users[0]
        new_password = get_random_string(length=8)
        user.set_password(new_password)
        user.save()

        return Response({
            "detail": "Credentials recovered successfully.",
            "username": user.username,
            "new_password": new_password,
            "message": "NOTE: Your password has been reset. Please login and change it immediately."
        }, status=status.HTTP_200_OK)
