import { useState } from 'react'

interface PasswordFieldProps {
  id?: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

/**
 * Password input with a show/hide toggle — matches mobile's AppTextInput
 * behavior (👁️ / 🙈), which web previously lacked entirely.
 */
export default function PasswordField({ id, label, value, onChange, placeholder, required = true }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div style={{ marginBottom: 16 }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '10px 44px 10px 14px',
            background: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(30,45,80,0.15)',
            borderRadius: 10, fontSize: 15, color: '#15203a',
            outline: 'none', transition: 'border-color 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => (e.target.style.borderColor = '#34c9ba')}
          onBlur={e => (e.target.style.borderColor = 'rgba(30,45,80,0.15)')}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          aria-label="Toggle password visibility"
          style={{
            position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 17, padding: 8, lineHeight: 1,
          }}
        >
          {visible ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  )
}
