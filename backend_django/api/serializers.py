from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.mail import send_mail
from .models import (
    Student, Faculty, AdminProfile, Attendance, Timetable, Notification, 
    Result, Assignment, AssignmentSubmission, Project, Leave, Fee, Salary, Document
)

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'user', 'role', 'student_id', 'enrollment_id', 'name', 'email', 'phone', 'department', 'division', 'category', 'address', 'guardian_name', 'dob']
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        student_id = validated_data.get('student_id')
        email = validated_data.get('email')
        
        # Check if email already exists in User model
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
            
        try:
            password = f"{student_id}123"
            user = User.objects.create_user(
                username=student_id,
                email=email,
                password=password
            )
            validated_data['user'] = user
            student = super().create(validated_data)
            
            # Send Welcome Email
            send_mail(
                subject='Welcome to College ERP - Your Credentials',
                message=(
                    f"Hi {student.name},\n\n"
                    f"Your student account has been created successfully.\n"
                    f"Login ID: {student_id}\n"
                    f"Password: {password}\n\n"
                    "Please login and change your password for security.\n\n"
                    "Regards,\nCollege ERP Admin"
                ),
                from_email=None, # Uses DEFAULT_FROM_EMAIL
                recipient_list=[email],
                fail_silently=True,
            )
            
            return student
        except Exception as e:
            # Provide the actual error message for better debugging
            raise serializers.ValidationError({"detail": f"Account creation failed: {str(e)}"})

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        employee_id = validated_data.get('employee_id')
        email = validated_data.get('email')
        
        # Check if email already exists in User model
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
            
        try:
            password = f"{employee_id}123"
            user = User.objects.create_user(
                username=employee_id,
                email=email,
                password=password
            )
            validated_data['user'] = user
            faculty = super().create(validated_data)
            
            # Send Welcome Email to Teacher
            send_mail(
                subject='Welcome to College ERP - Staff Credentials',
                message=(
                    f"Hi {faculty.name},\n\n"
                    f"Your faculty account has been created successfully.\n"
                    f"Employee ID: {employee_id}\n"
                    f"Password: {password}\n\n"
                    "Please login and change your password immediately.\n\n"
                    "Regards,\nCollege ERP Admin"
                ),
                from_email=None,
                recipient_list=[email],
                fail_silently=True,
            )
            
            return faculty
        except Exception as e:
            # Provide the actual error message for better debugging
            raise serializers.ValidationError({"detail": f"Account creation failed: {str(e)}"})

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class TimetableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timetable
        fields = '__all__'

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Result
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = '__all__'

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignmentSubmission
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.name')
    class Meta:
        model = Project
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leave
        fields = '__all__'

class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fee
        fields = '__all__'

class SalarySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Salary
        fields = ['id', 'user', 'user_name', 'full_name', 'amount', 'payment_date', 'month', 'status']

    def get_full_name(self, obj):
        try:
            return obj.user.faculty_profile.name
        except:
            return obj.user.get_full_name() or obj.user.username

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    admin_key = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)
    department = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'admin_key', 'role', 'department']

    def validate_admin_key(self, value):
        if value != settings.ADMIN_REGISTRATION_KEY:
            raise serializers.ValidationError("Invalid Admin Verification Key.")
        return value

    def create(self, validated_data):
        admin_key = validated_data.pop('admin_key')
        role = validated_data.pop('role', 'Super Admin')
        department = validated_data.pop('department', 'Administration')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_staff=True # Verified Admins get staff status
        )
        AdminProfile.objects.create(user=user, role=role, department=department)
        return user
