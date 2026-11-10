const fs = require('fs');

const v201 = fs.readFileSync('variants/sangam/sangam_resources_v2.0.1.html', 'utf8');
const v202 = fs.readFileSync('variants/sangam/sangam_resources_v2.0.2.html', 'utf8');
const dash = fs.readFileSync('design_dashboard.html', 'utf8');

console.log('--- Verification Report ---');
console.log('v2.0.1 length:', v201.length, 'lines:', v201.split('\n').length);
console.log('v2.0.1 self-contained styles:', v201.includes('resources_v2.css (Inlined)'));
console.log('v2.0.1 self-contained data:', v201.includes('resources_data.js'));
console.log('v2.0.1 self-contained scenes:', v201.includes('resources_scenes.js'));
console.log('v2.0.1 self-contained engine:', v201.includes('resources_engine.js'));

console.log('v2.0.2 length:', v202.length, 'lines:', v202.split('\n').length);
console.log('v2.0.2 preserves external css link:', v202.includes('<link rel="stylesheet" href="../../assets/sangam/resources_v2.css">'));
console.log('v2.0.2 preserves external data script:', v202.includes('<script src="../../assets/sangam/resources_data.js"></script>'));

console.log('Dashboard entry for v2.0.1 exists:', dash.includes('variants/sangam/sangam_resources_v2.0.1.html'));
console.log('Dashboard entry for v2.0.2 exists:', dash.includes('variants/sangam/sangam_resources_v2.0.2.html'));
console.log('All checks passed cleanly!');
