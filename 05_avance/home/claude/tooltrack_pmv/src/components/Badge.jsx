import React from 'react'
import { BADGE_CLASS, BADGE_LABEL } from '../lib/utils'

export default function Badge({ estado }) {
  return (
    <span className={`badge border ${BADGE_CLASS[estado] || 'bg-stone-100 text-stone-600 border-stone-300'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {BADGE_LABEL[estado] || estado}
    </span>
  )
}
