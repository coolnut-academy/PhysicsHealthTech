with open('backend/Entry.gs', 'r', encoding='utf-8') as f:
    text = f.read()

target = 'if (action === "teacher.publishYear") {\n      const res = AcademicYearService.publishYear(session, payload, repo);\n      return { ...res, request_id: requestId };\n    }'
replacement = target + '\n\n    if (action === "teacher.importRoster") {\n      const res = AcademicYearService.importRoster(session, payload, repo);\n      return { ...res, request_id: requestId };\n    }'

if target in text:
    text = text.replace(target, replacement, 1)
    with open('backend/Entry.gs', 'w', encoding='utf-8') as f:
        f.write(text)
    print('Added teacher.importRoster to Entry.gs successfully')
else:
    # Try normalized CRLF
    text_norm = text.replace('\r\n', '\n')
    if target in text_norm:
        text_norm = text_norm.replace(target, replacement, 1)
        with open('backend/Entry.gs', 'w', encoding='utf-8') as f:
            f.write(text_norm)
        print('Added teacher.importRoster (normalized) successfully')
    else:
        print('Target not found')

