const rows = require('./sheet_rows.json');

const yt = [];
const pdfs = [];
const webs = [];
const drives = [];
const empty = [];

rows.forEach(r => {
  const url = r.editedLink || r.rawLink || r.remarks || '';
  if (/youtu\.?be/i.test(url)) {
    yt.push({ num: r.num, title: r.title, url, area: r.area, cat: r.category });
  } else if (/\.pdf/i.test(url)) {
    pdfs.push({ num: r.num, title: r.title, url, area: r.area, cat: r.category });
  } else if (/drive\.google/i.test(url)) {
    drives.push({ num: r.num, title: r.title, url, area: r.area, cat: r.category, remarks: r.remarks });
  } else if (url && url !== '-') {
    webs.push({ num: r.num, title: r.title, url, area: r.area, cat: r.category });
  } else {
    empty.push({ num: r.num, title: r.title, area: r.area, cat: r.category });
  }
});

console.log('YouTube count:', yt.length);
console.log('PDF count:', pdfs.length);
console.log('Web URL count:', webs.length);
console.log('Drive count:', drives.length);
console.log('No link count:', empty.length);
