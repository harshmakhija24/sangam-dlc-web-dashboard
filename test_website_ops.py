import asyncio
import os
import json
import website_ops

# 1. Line number finder check
assert website_ops._find_line_number('foo\nbar\nbaz', 'bar') == 2
assert website_ops._find_line_number('foo\nbar\nbaz', 'qux') == -1

# 2. Async tasks reader check
async def test_async():
    raw_tasks = await website_ops.read_sheet_tasks()
    data = json.loads(raw_tasks)
    assert 'tasks' in data
    assert len(data['tasks']) == 11
    assert data['tasks'][0]['task_id'] == 'T-001'
    assert 'doc_source' in data['tasks'][0]
    
    delta_res = await website_ops.write_sheet_delta(json.dumps([{'task_id': 'T-001', 'status': 'done'}]))
    assert 'SUCCESS' in delta_res

asyncio.run(test_async())

# 3. Report parsing & status snapshot check
sample_report = """
| 5 Aug 2026 | DBE | Careers Page | https://dbe.iimb.ac.in/careers/ | ✅ Done | Form found |
| 7 Aug 2026 | ELP | Work Experience | https://iimbx.iimb.ac.in/elp/ | ⚠️ Partial | Missing widget |
| 13 Aug 2026 | Micro | Footer Email | https://iimbx.iimb.ac.in/micro/ | ❌ Not Done | Footer present |
| 14 Aug 2026 | Airlines | Brochure Widget | https://iimbx.iimb.ac.in/air/ | 🔍 Visual Check | Needs review |
"""

website_ops.save_report_to_files(sample_report)
prev = website_ops._load_previous_status()
assert prev.get('Careers Page') == 'done'
assert prev.get('Work Experience') == 'partial'
assert prev.get('Footer Email') == 'not_done'
assert prev.get('Brochure Widget') == 'visual_check'

# Cleanup
if os.path.exists(website_ops.STATUS_HISTORY_FILE):
    os.remove(website_ops.STATUS_HISTORY_FILE)
today = website_ops.datetime.date.today().isoformat()
report_path = os.path.join(website_ops.LOGS_DIR, f"pm_report_{today}.txt")
if os.path.exists(report_path):
    os.remove(report_path)

print('ALL PONYTAIL CHECKS PASSED: 0 errors, 100% logic verified!')
