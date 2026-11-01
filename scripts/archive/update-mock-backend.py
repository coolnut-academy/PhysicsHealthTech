import json

with open('scripts/roster_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

students_js = json.dumps(data['students'], ensure_ascii=False, indent=4)
enrollments_js = json.dumps(data['enrollments'], ensure_ascii=False, indent=4)

with open('js/mock-backend.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace syllabi and years
target_years = """    years: [
      { academic_year_id: "yr_2570", year_be: 2570, state: "open" },
      { academic_year_id: "yr_2569", year_be: 2569, state: "archived" }
    ],"""

replacement_years = """    years: [
      { academic_year_id: "yr_2569", year_be: 2569, state: "open" },
      { academic_year_id: "yr_2570", year_be: 2570, state: "open" }
    ],"""

content = content.replace(target_years, replacement_years)

target_syllabi = """syllabi: [M4_SYLLABUS, M5_SYLLABUS],"""
replacement_syllabi = """syllabi: [
      M4_SYLLABUS,
      M5_SYLLABUS,
      { ...M4_SYLLABUS, syllabus_version_id: "syl_m4_2569_v1", academic_year_id: "yr_2569" },
      { ...M5_SYLLABUS, syllabus_version_id: "syl_m5_2569_v1", academic_year_id: "yr_2569" }
    ],"""

content = content.replace(target_syllabi, replacement_syllabi)

# Add OFFICIAL_ROSTER constants
official_code = f"""
  const OFFICIAL_STUDENTS_2569 = {students_js};

  const OFFICIAL_ENROLLMENTS_2569 = {enrollments_js};
"""

content = content.replace("  const STUDENTS = [", official_code + "\n  const STUDENTS = [")
content = content.replace("students: [...STUDENTS],", "students: [...STUDENTS, ...OFFICIAL_STUDENTS_2569],")
content = content.replace("enrollments: [...ENROLLMENTS],", "enrollments: [...ENROLLMENTS, ...OFFICIAL_ENROLLMENTS_2569],")

with open('js/mock-backend.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated js/mock-backend.js with 57 official students successfully!")

