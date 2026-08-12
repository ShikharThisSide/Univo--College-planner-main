function pdfText(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/[^\x20-\x7E]/g, '?')
}

function color(hex) {
  const clean = hex.replace('#', '')
  return [0, 2, 4].map((offset) => (parseInt(clean.slice(offset, offset + 2), 16) / 255).toFixed(3)).join(' ')
}

function text(commands, value, x, y, size = 10, fill = '#18323a', font = 'F1') {
  commands.push(`${color(fill)} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfText(value)}) Tj ET`)
}

function rect(commands, x, y, width, height, fill, radius = 0) {
  commands.push(`${color(fill)} rg ${x} ${y} ${width} ${height} re f`)
  if (radius) commands.push('')
}

function buildAttendancePage({ title, subtitle, rows, pageNumber, pageCount, total, present, absent }) {
  const commands = []
  rect(commands, 0, 0, 612, 792, '#f7faf9')
  rect(commands, 0, 692, 612, 100, '#123a43')
  rect(commands, 0, 692, 612, 7, '#c4f04d')
  text(commands, 'UNIVO', '42', '753', 12, '#c4f04d', 'F2')
  text(commands, title || 'Attendance report', '42', '720', 24, '#ffffff', 'F2')
  text(commands, subtitle, '42', '674', 10, '#46636a')
  text(commands, `PAGE ${pageNumber} OF ${pageCount}`, '503', '753', 8, '#d4e5e4', 'F2')

  rect(commands, 42, 610, 528, 46, '#e6f1ed')
  rect(commands, 42, 610, 176, 46, '#dff0c7')
  rect(commands, 226, 610, 168, 46, '#e3f4f1')
  rect(commands, 402, 610, 168, 46, '#fde7df')
  text(commands, 'TOTAL STUDENTS', '56', '638', 8, '#507078', 'F2')
  text(commands, String(total), '56', '619', 17, '#123a43', 'F2')
  text(commands, 'PRESENT', '240', '638', 8, '#507078', 'F2')
  text(commands, String(present), '240', '619', 17, '#0f827c', 'F2')
  text(commands, 'ABSENT', '416', '638', 8, '#507078', 'F2')
  text(commands, String(absent), '416', '619', 17, '#d45c44', 'F2')

  rect(commands, 42, 574, 528, 26, '#123a43')
  text(commands, 'NO.', '56', '583', 8, '#c4f04d', 'F2')
  text(commands, 'STUDENT NAME', '92', '583', 8, '#c4f04d', 'F2')
  text(commands, 'ENROLLMENT', '350', '583', 8, '#c4f04d', 'F2')
  text(commands, 'STATUS', '484', '583', 8, '#c4f04d', 'F2')

  rows.forEach((row, index) => {
    const y = 558 - index * 25
    if (index % 2 === 0) rect(commands, 42, y - 7, 528, 25, '#edf4f1')
    text(commands, String(row.index), '57', String(y), 9, '#71858a')
    text(commands, row.name.slice(0, 31), '92', String(y), 9, '#18323a', 'F2')
    text(commands, row.enrollment.slice(0, 18), '350', String(y), 9, '#526b72')
    const isPresent = row.status === 'present'
    rect(commands, isPresent ? 478 : 475, y - 7, isPresent ? 62 : 65, 17, isPresent ? '#d9f0d5' : '#f9ddd7')
    text(commands, isPresent ? 'PRESENT' : 'ABSENT', isPresent ? '486' : '483', String(y - 1), 7, isPresent ? '#397545' : '#ad4939', 'F2')
  })

  text(commands, 'Generated with Univo · Built for the way students actually live.', '42', '36', 8, '#71858a')
  text(commands, 'univo.app', '520', '36', 8, '#0f827c', 'F2')
  return commands.join('\n')
}

function buildGenericPage(title, subtitle, lines, pageNumber, pageCount) {
  const commands = []
  rect(commands, 0, 0, 612, 792, '#f7faf9')
  rect(commands, 0, 700, 612, 92, '#123a43')
  rect(commands, 0, 700, 612, 7, '#c4f04d')
  text(commands, 'UNIVO', '42', '755', 12, '#c4f04d', 'F2')
  text(commands, title, '42', '725', 22, '#ffffff', 'F2')
  text(commands, subtitle, '42', '680', 10, '#46636a')
  lines.slice(0, 43).forEach((line, index) => text(commands, line, '54', String(650 - index * 14), 10, '#18323a'))
  text(commands, `Page ${pageNumber} of ${pageCount}`, '490', '36', 8, '#71858a')
  return commands.join('\n')
}

function makePdf(objects) {
  let output = '%PDF-1.4\n%UNIVO\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(output.length); output += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xrefOffset = output.length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([output], { type: 'application/pdf' })
}

export function createPdfBlob({ title, subtitle = '', lines = [], attendance }) {
  const pagesData = attendance
    ? Array.from({ length: Math.max(1, Math.ceil(attendance.rows.length / 22)) }, (_, page) => ({
      type: 'attendance', rows: attendance.rows.slice(page * 22, page * 22 + 22), page,
    }))
    : [{ type: 'generic', lines }]
  const pageCount = pagesData.length
  const pages = pagesData.map((page) => page.type === 'attendance'
    ? buildAttendancePage({ title, subtitle, rows: page.rows, pageNumber: page.page + 1, pageCount, ...attendance })
    : buildGenericPage(title, subtitle, page.lines, 1, 1))
  const fontId = 3 + pages.length * 2
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`]
  pages.forEach((content, index) => {
    const pageId = 3 + index * 2
    objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontId + 1} 0 R >> >> /Contents ${pageId + 1} 0 R >>`
    objects[pageId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  })
  objects[fontId - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objects[fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'
  return makePdf(objects)
}

export function downloadPdf({ filename, title, subtitle, lines, attendance }) {
  const url = URL.createObjectURL(createPdfBlob({ title, subtitle, lines, attendance }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
