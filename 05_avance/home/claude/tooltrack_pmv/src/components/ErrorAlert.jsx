import React from 'react'

export default function ErrorAlert({ msg }) {
  if (!msg) return null
  return (
    <div className="alert bg-red-50 text-red-700 border-red-200 mb-4">
      ⚠ {msg}
    </div>
  )
}
