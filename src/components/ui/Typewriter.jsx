import { useEffect, useState } from 'react'

export default function Typewriter({ text, speed = 100, cursor = '|', loop = false, deleteSpeed = 50, delay = 1500, className = '' }) {
  const textArray = Array.isArray(text) ? text : [text]
  const [displayText, setDisplayText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [characterIndex, setCharacterIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const currentText = textArray[textIndex] || ''

  useEffect(() => {
    if (!currentText) return undefined
    const complete = characterIndex >= currentText.length
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (!complete) {
          setDisplayText((value) => value + currentText[characterIndex])
          setCharacterIndex((value) => value + 1)
        } else if (loop) {
          setDeleting(true)
        }
      } else if (displayText.length) {
        setDisplayText((value) => value.slice(0, -1))
      } else {
        setDeleting(false)
        setCharacterIndex(0)
        setTextIndex((value) => (value + 1) % textArray.length)
      }
    }, complete && !deleting ? delay : deleting ? deleteSpeed : speed)
    return () => clearTimeout(timeout)
  }, [characterIndex, currentText, deleting, deleteSpeed, delay, displayText, loop, speed, textArray.length])

  return <span className={className}>{displayText}<span className="typewriterCursor" aria-hidden="true">{cursor}</span></span>
}
