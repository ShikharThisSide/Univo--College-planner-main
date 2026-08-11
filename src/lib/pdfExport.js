function toPdfSafeText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, '?')
}

function wrapLine(value, maxLength = 88) {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ['']

  const lines = []
  let line = ''
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxLength && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })
  if (line) lines.push(line)
  return lines
}

function buildPageStream(title, subtitle, pageLines, pageNumber, pageCount) {
  const header = [title, subtitle, `Page ${pageNumber} of ${pageCount}`].filter(Boolean)
  const commands = ['BT', '/F1 18 Tf', '54 744 Td', `(${toPdfSafeText(header[0])}) Tj`, '/F1 10 Tf', '0 -24 Td']

  header.slice(1).forEach((line) => {
    commands.push(`(${toPdfSafeText(line)}) Tj`, '0 -16 Td')
  })

  commands.push('0 -12 Td', '/F1 10 Tf', '14 TL')
  pageLines.forEach((line) => {
    commands.push(`(${toPdfSafeText(line)}) Tj`, 'T*')
  })
  commands.push('ET')
  return commands.join('\n')
}

export function createPdfBlob({ title, subtitle = '', lines = [] }) {
  const wrappedLines = lines.flatMap((line) => wrapLine(line))
  const linesPerPage = 42
  const pages = []
  for (let start = 0; start < wrappedLines.length || start === 0; start += linesPerPage) {
    pages.push(wrappedLines.slice(start, start + linesPerPage))
  }

  const fontObjectId = 3 + pages.length * 2
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
  ]

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2
    const content = buildPageStream(title, subtitle, pageLines, index + 1, pages.length)
    objects[pageObjectId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${pageObjectId + 1} 0 R >>`
    objects[pageObjectId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  })
  objects[fontObjectId - 1] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'

  let output = '%PDF-1.4\n%UNIVO\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(output.length)
    output += `${index + 1} 0 obj\n${object}\nendobj\n`
  })

  const xrefOffset = output.length
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => {
    output += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  output += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return new Blob([output], { type: 'application/pdf' })
}

export function downloadPdf({ filename, title, subtitle, lines }) {
  const url = URL.createObjectURL(createPdfBlob({ title, subtitle, lines }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
