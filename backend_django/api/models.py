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

class Result(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    semester = models.IntegerField()
    subject = models.CharField(max_length=100)
    marks = models.IntegerField()
    grade = models.CharField(max_length=5)
    date = models.DateField()

    def __str__(self):
        return f"{self.student.name} - Sem {self.semester} - {self.subject}"

class Assignment(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    deadline = models.DateTimeField()
    teacher = models.ForeignKey(Faculty, on_delete=models.CASCADE, related_name='assignments')
    department = models.CharField(max_length=100)
    
    def __str__(self):
        return self.title

class AssignmentSubmission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='submissions')
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Completed')
    submission_note = models.TextField(blank=True, null=True)
    file_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.student.name} - {self.assignment.title}"

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='projects')
    status = models.CharField(max_length=50, default='Proposed') # Proposed, In Progress, Completed
    track_details = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.student.name} - {self.title}"

class Leave(models.Model):
    USER_TYPES = (('Student', 'Student'), ('Teacher', 'Teacher'))
    STATUS_CHOICES = (('Pending', 'Pending'), ('Approved', 'Approved'), ('Rejected', 'Rejected'))
    
    applicant_type = models.CharField(max_length=20, choices=USER_TYPES)
    applicant_id = models.IntegerField() # FK to Student or Faculty (handling via login logic)
    reason = models.TextField()
    remarks = models.TextField(blank=True, null=True) # Admin/Teacher remarks
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')

class Fee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fees')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200)
    status = models.CharField(max_length=20, default='Unpaid') # Paid, Unpaid
    date_due = models.DateField()
    
    def __str__(self):
        return f"{self.student.name} - {self.amount}"

class Salary(models.Model):
    STATUS_CHOICES = (('Paid', 'Paid'), ('Pending', 'Pending'))
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='salaries')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField(auto_now_add=True)
    month = models.CharField(max_length=50) # e.g. "April 2026"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Paid')
    
    def __str__(self):
        return f"{self.user.username} - {self.month} - {self.amount}"

class Document(models.Model):
    title = models.CharField(max_length=200)
    file_url = models.URLField() # Storing as URL for now
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=100) # Form, ID Card, Transcript
    date_uploaded = models.DateTimeField(auto_now_add=True)
