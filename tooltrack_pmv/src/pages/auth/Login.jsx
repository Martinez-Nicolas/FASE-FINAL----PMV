import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { getUsuariosByRol, verificarPin } from '../../lib/db'
import Spinner from '../../components/Spinner'

const ROLES = [
  { rol: 'operario',   icon: '🔧', label: 'Operario de Terreno',     sub: 'Solicitar y devolver herramientas' },
  { rol: 'supervisor', icon: '📋', label: 'Supervisor de Cuadrilla', sub: 'Aprobar y controlar solicitudes' },
  { rol: 'bodeguero',  icon: '📦', label: 'Bodeguero de Obra',        sub: 'Gestionar entregas y devoluciones' },
  { rol: 'mantencion', icon: '🔩', label: 'Enc. de Mantención',       sub: 'Evaluar herramientas con incidencias' },
]

export default function Login() {
  const { login } = useApp()
  const [step, setStep]         = useState('roles')
  const [usuarios, setUsuarios] = useState([])
  const [usuarioSel, setUsuarioSel] = useState(null)
  const [pin, setPin]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function selectRol(rol) {
    setLoading(true)
    setError(null)
    try {
      const data = await getUsuariosByRol(rol)
      setUsuarios(data)
      setStep('users')
    } catch (e) {
      setError('No se pudo conectar a la base de datos. Verifica las credenciales en .env')
    } finally {
      setLoading(false)
    }
  }

  function selectUsuario(u) {
    setUsuarioSel(u)
    setPin('')
    setError(null)
    setStep('pin')
  }

  async function handlePinSubmit() {
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos.'); return }
    setLoading(true)
    setError(null)
    try {
      const ok = await verificarPin(usuarioSel.id, pin)
      if (ok) {
        login(usuarioSel)
      } else {
        setError('PIN incorrecto. Inténtalo nuevamente.')
        setPin('')
      }
    } catch (e) {
      setError('Error al verificar el PIN.')
    } finally {
      setLoading(false)
    }
  }

  function handlePinKey(e) {
    if (e.key === 'Enter') handlePinSubmit()
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card w-80 p-8 shadow-md">
        <div className="flex items-center gap-2 font-mono text-base font-medium mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
          ToolTrack
        </div>
        <p className="text-xs text-stone-400 mb-7">Constructora Edifica-Tec</p>

        {error && <div className="alert bg-red-50 text-red-700 border-red-200 text-xs">{error}</div>}

        {step === 'roles' && (
          <>
            <p className="section-title">Selecciona tu rol</p>
            {ROLES.map(({ rol, icon, label, sub }) => (
              <button key={rol} onClick={() => selectRol(rol)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl mb-2 hover:bg-white hover:border-stone-300 transition-all text-left">
                <span className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-base flex-shrink-0">{icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-800">{label}</div>
                  <div className="text-xs text-stone-400">{sub}</div>
                </div>
                <span className="text-stone-300">›</span>
              </button>
            ))}
          </>
        )}

        {step === 'users' && (
          <>
            <button onClick={() => setStep('roles')}
              className="text-xs text-stone-400 hover:text-stone-700 mb-4 flex items-center gap-1">
              ← Volver
            </button>
            <p className="section-title">Selecciona tu usuario</p>
            {loading ? <Spinner text="Cargando usuarios..." /> : (
              usuarios.map(u => (
                <button key={u.id} onClick={() => selectUsuario(u)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl mb-2 hover:bg-white hover:border-stone-300 transition-all text-left">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 flex-shrink-0">
                    {u.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-stone-800">{u.nombre}</div>
                    {u.cuadrilla && <div className="text-xs text-stone-400">{u.cuadrilla}</div>}
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {step === 'pin' && (
          <>
            <button onClick={() => setStep('users')}
              className="text-xs text-stone-400 hover:text-stone-700 mb-4 flex items-center gap-1">
              ← Volver
            </button>

            <div className="flex flex-col items-center mb-5">
              <span className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-base font-semibold text-blue-700 mb-2">
                {usuarioSel?.nombre.split(' ').map(n => n[0]).slice(0,2).join('')}
              </span>
              <div className="text-sm font-medium text-stone-800">{usuarioSel?.nombre}</div>
              <div className="text-xs text-stone-400">Ingresa tu PIN de acceso</div>
            </div>

            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={handlePinKey}
              placeholder="••••"
              className="form-input text-center text-2xl tracking-[0.5em] mb-4"
            />

            <button
              className="btn-primary w-full"
              onClick={handlePinSubmit}
              disabled={loading || pin.length !== 4}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>

            <p className="text-[10px] text-stone-300 text-center mt-4">
              PMV — autenticación simplificada con PIN de 4 dígitos
            </p>
          </>
        )}
      </div>
    </div>
  )
}
