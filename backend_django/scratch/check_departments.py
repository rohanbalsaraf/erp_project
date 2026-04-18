import os
import django
import sys

# Setup Django environment
sys.path.append('/Users/rohan/Developer/erp_project/backend_django')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'college_erp.settings')
django.setup()

from api.models import Faculty, Student

print("FACULTY DEPARTMENTS:")
faculties = Faculty.objects.all()
for f in faculties:
    print(f"- {f.name}: '{f.department}'")

print("\nSTUDENT DEPARTMENTS:")
students = Student.objects.all()
for s in students:
    print(f"- {s.name}: '{s.department}'")
