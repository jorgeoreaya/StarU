import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

// Selector de archivo con previsualización. Devuelve el File vía onSelect.
export default function MediaUploader({
  accept = 'image/*',
  label = 'Subir archivo',
  hint,
  type = 'image', // 'image' | 'video'
  initialUrl = null,
  onSelect,
}) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(initialUrl)

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    onSelect?.(file)
  }

  return (
    <div className="media-uploader">
      <Button type="button" variant="glass" size="sm" onClick={() => inputRef.current?.click()}>
        {preview ? 'Cambiar' : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      {hint && <span className="form-hint">{hint}</span>}
      {preview &&
        (type === 'video' ? (
          <video src={preview} controls className="media-preview media-preview-video" />
        ) : (
          <img src={preview} alt="preview" className="media-preview media-preview-img" />
        ))}
    </div>
  )
}
