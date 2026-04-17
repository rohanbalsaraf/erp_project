from django.db import models
from django.contrib.auth.models import User

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    department = models.CharField(max_length=100)
    division = models.CharField(max_length=10)
    category = models.CharField(max_length=50)
    address = models.TextField(blank=True, null=True)
    guardian_name = models.CharField(max_length=200, blank=True, null=True)
    dob = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.name} ({self.student_id})"

class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    employee_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
    def __str__(self):
        return self.name

class Attendance(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    course = models.CharField(max_length=100)
    status = models.CharField(max_length=20) # Present/Absent
    time = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-date']

class Timetable(models.Model):
    day = models.CharField(max_length=20)
    time = models.CharField(max_length=50)
    course = models.CharField(max_length=100)
    room = models.CharField(max_length=50)
    department = models.CharField(max_length=100)

class Notification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    date = models.DateField(auto_now_add=True)
    
    def __str__(self):
        return self.title
