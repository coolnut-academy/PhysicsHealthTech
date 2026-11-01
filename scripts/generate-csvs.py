import csv, json

with open('scripts/roster_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Write Students CSV
with open('Students_2569.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['student_uid', 'code_5_digit', 'display_name', 'status', 'credential_version', 'created_at', 'updated_at', 'deleted_at'])
    for s in data['students']:
        writer.writerow([s['student_uid'], "'" + s['code_5_digit'], s['display_name'], s['status'], 1, '2026-05-01T00:00:00Z', '', ''])

# Write Enrollments CSV
with open('Enrollments_2569.csv', 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['enrollment_id', 'academic_year_id', 'student_uid', 'grade', 'room', 'roll_no', 'status', 'created_at'])
    for e in data['enrollments']:
        writer.writerow([e['enrollment_id'], e['academic_year_id'], e['student_uid'], e['grade'], e['room'], e['roll_no'], e['status'], '2026-05-01T00:00:00Z'])

print('Generated Students_2569.csv and Enrollments_2569.csv successfully!')

