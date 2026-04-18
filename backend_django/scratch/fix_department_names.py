import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/rohan/Developer/erp_project/backend_django')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'college_erp.settings')
django.setup()

from api.models import Faculty, Student, AdminProfile

# Mapping of short names or old names to standard names
MAPPING = {
    'Computer': 'Computer Science',
    'IT': 'Information Technology',
    'Mechanical': 'Mechanical Engineering',
    'Electrical': 'Electrical Engineering',
    'Civil': 'Civil Engineering'
}

print("RUNNING DEPARTMENT DATA REPAIR...")

# Update Students
students = Student.objects.all()
updated_students = 0
for s in students:
    if s.department in MAPPING:
        old_val = s.department
        s.department = MAPPING[s.department]
        s.save()
        print(f"Updated Student {s.name}: '{old_val}' -> '{s.department}'")
        updated_students += 1

# Update Faculty
faculties = Faculty.objects.all()
updated_faculty = 0
for f in faculties:
    if f.department in MAPPING:
        old_val = f.department
        f.department = MAPPING[f.department]
        f.save()
        print(f"Updated Faculty {f.name}: '{old_val}' -> '{f.department}'")
        updated_faculty += 1

# Update AdminProfile
admins = AdminProfile.objects.all()
updated_admins = 0
for a in admins:
    if a.department in MAPPING:
        old_val = a.department
        a.department = MAPPING[a.department]
        a.save()
        print(f"Updated Admin {a.user.username}: '{old_val}' -> '{a.department}'")
        updated_admins += 1

print(f"\nREPAIR COMPLETE.")
print(f"Students updated: {updated_students}")
print(f"Faculty updated: {updated_faculty}")
print(f"Admins updated: {updated_admins}")
