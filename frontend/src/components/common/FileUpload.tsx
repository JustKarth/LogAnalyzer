import React, { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number // in bytes
  multiple?: boolean
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setError(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  const validateAndSelectFile = (file: File) => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`)
      return
    }

    // Check file type if accept is specified
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const fileType = file.type || `.${file.name.split('.').pop()}`
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.endsWith(type)
        }
        return fileType.includes(type.replace('*', ''))
      })

      if (!isAccepted) {
        setError(`File type not accepted. Accepted types: ${accept}`)
        return
      }
    }

    onFileSelect(file)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={`w-full ${className}`}>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          aria-label="Select log file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-sm text-gray-600 mb-2">
            {isDragging ? 'Drop the file here' : 'Drag and drop a file here, or click to select'}
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FileUpload
