from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Student, Faculty, Attendance, Timetable, Notification, Result

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        student_id = validated_data.get('student_id')
        user = User.objects.create_user(
            username=student_id,
            email=validated_data.get('email'),
            password=f"{student_id}123"
        )
        validated_data['user'] = user
        return super().create(validated_data)

class FacultySerializer(serializers.ModelSerializer):
    class Meta:
        model = Faculty
        fields = '__all__'
        extra_kwargs = {'user': {'read_only': True}}

    def create(self, validated_data):
        employee_id = validated_data.get('employee_id')
        user = User.objects.create_user(
            username=employee_id,
            email=validated_data.get('email'),
            password=f"{employee_id}123"
        )
        validated_data['user'] = user
        return super().create(validated_data)

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
