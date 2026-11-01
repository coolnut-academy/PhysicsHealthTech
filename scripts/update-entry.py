with open('backend/Entry.gs', 'r', encoding='utf-8') as f:
    entry = f.read()

with open('scripts/importer_func.txt', 'r', encoding='utf-8') as f:
    importer = f.read()

target = 'return { ok: true, message: "Sample data seeded successfully." };\n}'
replacement = target + '\n\n' + importer.strip()

if target in entry:
    new_entry = entry.replace(target, replacement, 1)
    new_entry = new_entry.replace('seedSampleData\n  };', 'seedSampleData,\n    importOfficialRoster2569\n  };')
    with open('backend/Entry.gs', 'w', encoding='utf-8') as f:
        f.write(new_entry)
    print('Successfully inserted importOfficialRoster2569 into backend/Entry.gs!')
else:
    print('Target not found in backend/Entry.gs!')

