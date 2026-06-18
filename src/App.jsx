import { useState, useEffect, useRef } from 'react'
import logoKaito from './assets/Logomark_Kaito.png'
import bannerKaito from './assets/potrait.png'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const COUNTRIES = [
  'Ecuador 🇪🇨',
  'Colombia 🇨🇴',
  'Guatemala 🇬🇹',
  'Honduras 🇭🇳',
  'Rep. Dominicana 🇩🇴',
  'El Salvador 🇸🇻',
  'Nicaragua 🇳🇮',
  'Perú 🇵🇪',
]

const RATES = {
  'Ecuador 🇪🇨':      17.47,
  'Colombia 🇨🇴':      17.43,
  'Guatemala 🇬🇹':     17.51,
  'Honduras 🇭🇳':      17.39,
  'Rep. Dominicana 🇩🇴': 17.52,
  'El Salvador 🇸🇻':   17.47,
  'Nicaragua 🇳🇮':     17.38,
  'Perú 🇵🇪':          17.44,
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
let _id = 100
const uid = () => ++_id

const toMXN = (usd, country) =>
  (usd * (RATES[country] ?? 17.47)).toFixed(2)

const parseUSD = (str) => {
  const n = parseFloat(String(str).replace(/[^0-9.]/g, ''))
  return isNaN(n) || n <= 0 ? null : n
}

// ─────────────────────────────────────────────
// Bold-text renderer  (**text** → <strong>)
// ─────────────────────────────────────────────
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          p.split('\n').map((line, j, arr) => (
            <span key={`${i}-${j}`}>
              {line}
              {j < arr.length - 1 && <br />}
            </span>
          ))
        )
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// Tick (double-check) icon
// ─────────────────────────────────────────────
function BlueTicks() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
      <path d="M1 5.5L4.5 9.5L10.5 1.5" stroke="#53BDEB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 5.5L9.5 9.5L15.5 1.5" stroke="#53BDEB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Bubble wrappers
// ─────────────────────────────────────────────
function UserBubble({ children, time }) {
  return (
    <div className="flex justify-end mb-1.5">
      <div
        className="max-w-[78%] px-3 py-2 text-sm text-white"
        style={{ backgroundColor: '#005C4B', borderRadius: '7.5px 0 7.5px 7.5px' }}
      >
        {children}
        <div className="flex items-center justify-end gap-1 mt-1">
          <span className="text-[10px]" style={{ color: '#8696A0' }}>{time}</span>
          <BlueTicks />
        </div>
      </div>
    </div>
  )
}

function BotBubble({ children, time, button }) {
  return (
    <div className="flex justify-start mb-1.5">
      <div
        className="overflow-hidden"
        style={{
          maxWidth: '82%',
          backgroundColor: '#202C33',
          borderRadius: '0 7.5px 7.5px 7.5px',
        }}
      >
        <div className="px-3 py-2 text-sm text-white">
          {children}
          <div className="text-[10px] text-right mt-1" style={{ color: '#8696A0' }}>{time}</div>
        </div>
        {button && (
          <div className="border-t" style={{ borderColor: '#2A3942' }}>
            <button
              onClick={button.onClick}
              className="w-full py-2.5 text-sm font-medium transition-opacity active:opacity-60"
              style={{ color: '#00A884' }}
            >
              {button.label}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Message renderers
// ─────────────────────────────────────────────
function BannerMsg({ time }) {
  return (
    <div className="flex justify-start mb-1.5">
      <div
        className="overflow-hidden"
        style={{ maxWidth: '82%', backgroundColor: '#202C33', borderRadius: '0 7.5px 7.5px 7.5px' }}
      >
        <img
          src={bannerKaito}
          alt="Kaito Konnect"
          className="w-full object-cover"
          style={{ maxHeight: '180px', display: 'block' }}
        />
        <div className="text-[10px] text-right px-2 py-1" style={{ color: '#8696A0' }}>{time}</div>
      </div>
    </div>
  )
}

function SummaryMsg({ msg, isActive, onConfirm, onChange }) {
  return (
    <div className="flex justify-start mb-1.5">
      <div style={{ maxWidth: '86%', width: '100%' }}>
        <div
          className="overflow-hidden"
          style={{ backgroundColor: '#202C33', borderRadius: '0 7.5px 7.5px 7.5px' }}
        >
          <div className="px-3 py-3 text-sm space-y-3" style={{ color: '#E9EDEF' }}>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8696A0' }}>📄 RESUMEN</div>
              <div>Monto a enviar: <strong>{msg.amount} USD</strong></div>
              <div>Equivalente a: <strong>${msg.mxnAmount} pesos mexicanos</strong></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8696A0' }}>🏦 DESTINO</div>
              <div>A: <strong>{msg.recipient}</strong></div>
              <div>En: <strong>Mexico 🇲🇽</strong></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8696A0' }}>🌎 TARIFAS</div>
              <div>Comisión: <strong>$0 dólares</strong></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8696A0' }}>💰 TOTAL A PAGAR</div>
              <div className="font-bold">${msg.amount} + $0 = ${msg.amount}</div>
            </div>
            <div className="text-[10px] text-right" style={{ color: '#8696A0' }}>{msg.time}</div>
          </div>
          {isActive && (
            <div className="border-t" style={{ borderColor: '#2A3942' }}>
              <button
                onClick={onConfirm}
                className="w-full py-3 text-sm font-medium border-b transition-opacity active:opacity-60"
                style={{ color: '#00A884', borderColor: '#2A3942' }}
              >
                Sí, correcto 👍
              </button>
              <button
                onClick={onChange}
                className="w-full py-3 text-sm font-medium transition-opacity active:opacity-60"
                style={{ color: '#00A884' }}
              >
                Cambiar algo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentInfoMsg({ time }) {
  return (
    <div className="flex justify-start mb-1.5">
      <div style={{ maxWidth: '86%', width: '100%' }}>
        <div
          className="px-3 py-3 text-sm space-y-2"
          style={{ backgroundColor: '#202C33', color: '#E9EDEF', borderRadius: '0 7.5px 7.5px 7.5px' }}
        >
          <div>Con estos datos podrás realizarnos el pago:</div>
          <div className="space-y-1.5 pt-1">
            <div>Referencia/ Concepto: <strong>BRG-7XK29Q4L</strong></div>
            <div className="text-xs font-semibold">
              ⚠️ Es fundamental incluir la Referencia para identificar tu pago
            </div>
            <div>Número de ruta: <strong>101206101</strong></div>
            <div>Nombre: <strong>Bridge FBO John Rivera</strong></div>
            <div>Cuenta número: <strong>215268120000</strong></div>
            <div>Nombre del banco: <strong>Lead Bank</strong></div>
          </div>
          <div className="text-[10px] text-right pt-1" style={{ color: '#8696A0' }}>{time}</div>
        </div>
      </div>
    </div>
  )
}

function StatusMsg({ status, recipient, time }) {
  const MAP = {
    pendiente: {
      label: 'Pendiente',
      extra: '',
      body: 'No olvides de realizar el pago de tu remesa en las próximas 24 horas.',
    },
    en_proceso: {
      label: 'En proceso',
      extra: ' ⌛',
      body: '¡Pago recibido con éxito! ✅\nNuestro equipo está gestionando el envío para que llegue a su destino lo antes posible.\n\nTe notificaremos en cuanto el movimiento se haya completado.',
    },
    completado: {
      label: 'Completado',
      extra: ' 🎉',
      body: `Tu pago fue verificado y el dinero ya está disponible en la cuenta de ${recipient}.`,
    },
  }
  const cfg = MAP[status]
  if (!cfg) return null
  return (
    <div className="flex justify-start mb-1.5">
      <div style={{ maxWidth: '86%', width: '100%' }}>
        <div
          className="px-3 py-3 text-sm"
          style={{ backgroundColor: '#202C33', color: '#E9EDEF', borderRadius: '0 7.5px 7.5px 7.5px' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8696A0' }}>📄 ESTATUS</div>
          <div className="font-bold mb-1">{cfg.label}{cfg.extra}</div>
          <div className="text-xs whitespace-pre-line" style={{ color: '#D1D7DB' }}>{cfg.body}</div>
          <div className="text-[10px] text-right mt-2" style={{ color: '#8696A0' }}>{time}</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Country selector — full-screen, WhatsApp style
// ─────────────────────────────────────────────
function CountrySheet({ currentCountry, onSelect, onClose }) {
  const [pending, setPending] = useState(currentCountry)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0D1117' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 border-b shrink-0"
        style={{ backgroundColor: '#111B21', borderColor: '#2A3942' }}
      >
        <div className="w-9 shrink-0" />
        <span className="flex-1 text-center font-semibold text-white text-base">Opciones</span>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold shrink-0"
          style={{ backgroundColor: '#2A3942', color: '#8696A0' }}
        >
          ✕
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {COUNTRIES.map((c) => (
          <button
            key={c}
            onClick={() => setPending(c)}
            className="w-full flex items-center justify-between px-6 border-b text-left transition-colors active:bg-[#1A2530]"
            style={{ borderColor: '#1E2D35', paddingTop: '18px', paddingBottom: '18px' }}
          >
            <span className="text-[15px]" style={{ color: '#E9EDEF' }}>{c}</span>
            {pending === c && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 ml-3">
                <path d="M3.5 10.5L7.5 14.5L16.5 5.5" stroke="#25D366" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Enviar */}
      <div className="shrink-0 px-4 pt-4 pb-8" style={{ backgroundColor: '#0D1117' }}>
        <button
          onClick={() => onSelect(pending)}
          className="w-full py-4 rounded-2xl font-semibold text-base text-white transition-opacity active:opacity-80"
          style={{ backgroundColor: '#25D366' }}
        >
          Enviar
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Centered modal (usado para "Cambiar algo")
// ─────────────────────────────────────────────
function Sheet({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#111B21', maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#2A3942' }}>
          <span className="font-semibold text-white">{title}</span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: '#2A3942', color: '#8696A0' }}
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 64px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SheetItem({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 text-sm text-white border-b transition-colors hover:bg-[#2A3942]"
      style={{ borderColor: '#2A3942' }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const [messages, setMessages]             = useState([])
  const [step, setStep]                     = useState('init')
  const [country, setCountry]               = useState('Ecuador 🇪🇨')
  const [amount, setAmount]                 = useState(null)
  const [recipient, setRecipient]           = useState(null)
  const [inputMode, setInputMode]           = useState('greeting')
  const [userInput, setUserInput]           = useState('')
  const [showCountries, setShowCountries]   = useState(false)
  const [showChangeMenu, setShowChangeMenu] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── helpers ─────────────────────────────────
  const push = (msgs) => setMessages((p) => [...p, ...msgs])

  const deactivateSummaries = (prev) =>
    prev.map((m) => (m.type === 'summary' ? { ...m, active: false } : m))

  const now = () => {
    const d = new Date()
    const h = d.getHours() % 12 || 12
    const m = String(d.getMinutes()).padStart(2, '0')
    return `${h}:${m} ${d.getHours() < 12 ? 'am' : 'pm'}`
  }

  // ── Greeting trigger ────────────────────────
  const handleGreeting = (text) => {
    push([{ id: uid(), type: 'user', text, time: now() }])
    setInputMode(null)
    setTimeout(() => {
      push([
        { id: uid(), type: 'banner', time: now() },
        { id: uid(), type: 'bot', text: 'Hola, comencemos con tu envío 😃', time: now() },
        {
          id: uid(), type: 'bot',
          text: 'Para poder comenzar necesitamos saber desde que país enviarás tu dinero 🌍',
          time: now(),
          ctaLabel: '≡  Opciones',
          ctaAction: 'open_countries',
        },
      ])
    }, 500)
  }

  // ── Country selected ─────────────────────────
  const handleCountrySelect = (c) => {
    setCountry(c)
    setShowCountries(false)
    const rate = RATES[c]
    push([
      { id: uid(), type: 'user', text: c, time: now() },
      {
        id: uid(), type: 'bot',
        text: `¿Cuánto quieres enviar? 🇲🇽\nEl tipo de cambio es **$${rate} pesos** por dólar.\n\nEscribe el monto que prefieras ✍️`,
        placeholder: 'Ejemplo: $100 dólares o $1,747 pesos',
        time: now(),
      },
    ])
    setStep('country_selected')
    setInputMode('amount')
  }

  // ── Amount submitted ─────────────────────────
  const handleAmountSubmit = (raw) => {
    const usd = parseUSD(raw)
    if (!usd) return
    setAmount(usd)
    const mxn = toMXN(usd, country)
    push([
      { id: uid(), type: 'user', text: `$${usd} dólares`, time: now() },
      { id: uid(), type: 'bot', text: `Tu beneficiario recibirá **$${mxn} pesos mexicanos**`, time: now() },
      {
        id: uid(), type: 'bot',
        text: '¿A quién le quieres enviar dinero? 🙋\nEscribe el usuario de la persona como aparece en su aplicación.',
        placeholder: 'Ejemplo: Juan Pérez López',
        time: now(),
      },
    ])
    setStep('amount_entered')
    setInputMode('recipient')
  }

  // ── Recipient submitted ──────────────────────
  const handleRecipientSubmit = (name) => {
    if (!name.trim()) return
    const trimmed = name.trim()
    setRecipient(trimmed)
    const mxn = toMXN(amount, country)
    setMessages((prev) => [
      ...deactivateSummaries(prev),
      { id: uid(), type: 'user', text: trimmed, time: now() },
      { id: uid(), type: 'bot', text: '¡Excelente! Ya estamos listos para enviar dinero', time: now() },
      {
        id: uid(), type: 'summary',
        amount, mxnAmount: mxn, recipient: trimmed,
        active: true, time: now(),
      },
    ])
    setStep('summary')
    setInputMode(null)
  }

  // ── Confirm + auto-triggers ───────────────────
  const handleConfirm = () => {
    const r = recipient // captura estable para los closures de setTimeout
    setMessages((prev) => [
      ...deactivateSummaries(prev),
      { id: uid(), type: 'user', text: 'Sí, correcto 👍', time: now() },
      {
        id: uid(), type: 'bot',
        text: `Para continuar estamos esperando un mensaje de confirmación de **"${r}"**, para proceder a generarte la solicitud de envio.\nEsto puede tardar de **5 a 15 minutos**.`,
        time: now(),
      },
    ])
    setStep('waiting_acceptance')

    // ① Micaela acepta automáticamente en 3 s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(), type: 'bot',
          text: `¡Todo listo! **${r}** acaba de confirmar la solicitud, te enviamos la información para poder completar tu transacción`,
          time: now(),
        },
        { id: uid(), type: 'payment_info', time: now() },
        {
          id: uid(), type: 'bot',
          text: 'Una vez que hayas realizado el pago te estaré avisando sobre el estado de tu remesa',
          time: now(),
        },
      ])
      setStep('payment_info')

      // ② Status inicial: Pendiente (0.8 s después)
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: uid(), type: 'status', status: 'pendiente', time: now() }])

        // ③ En proceso: 4 s después
        setTimeout(() => {
          setMessages((prev) => [...prev, { id: uid(), type: 'status', status: 'en_proceso', time: now() }])

          // ④ Completado: 3 s después
          setTimeout(() => {
            setMessages((prev) => [...prev, { id: uid(), type: 'status', status: 'completado', time: now() }])
          }, 3000)
        }, 4000)
      }, 800)
    }, 3000)
  }

  // ── Cambiar algo ─────────────────────────────
  const handleChange = (option) => {
    setShowChangeMenu(false)
    if (option === 'amount') {
      setMessages((prev) => [
        ...deactivateSummaries(prev),
        { id: uid(), type: 'user', text: '💵 Cambiar el monto', time: now() },
        {
          id: uid(), type: 'bot',
          text: `¿Cuánto quieres enviar? 🇲🇽\nEl tipo de cambio es **$${RATES[country]} pesos** por dólar.\n\nEscribe el monto que prefieras ✍️`,
          placeholder: 'Ejemplo: $100 dólares',
          time: now(),
        },
      ])
      setStep('country_selected')
      setInputMode('amount')
    } else if (option === 'recipient') {
      setMessages((prev) => [
        ...deactivateSummaries(prev),
        { id: uid(), type: 'user', text: '👤 Cambiar el destinatario', time: now() },
        {
          id: uid(), type: 'bot',
          text: '¿A quién le quieres enviar dinero? 🙋\nEscribe el usuario de la persona como aparece en su aplicación.',
          placeholder: 'Ejemplo: Juan Pérez López',
          time: now(),
        },
      ])
      setStep('amount_entered')
      setInputMode('recipient')
    } else if (option === 'country') {
      setMessages((prev) => [
        ...deactivateSummaries(prev),
        { id: uid(), type: 'user', text: '🌍 Cambiar el país de origen', time: now() },
      ])
      setShowCountries(true)
      setStep('init')
    }
  }

  // ── Send ─────────────────────────────────────
  const handleSend = () => {
    if (!userInput.trim()) return
    if (inputMode === 'greeting')  { handleGreeting(userInput);         setUserInput(''); return }
    if (!inputMode) return
    if (inputMode === 'amount')      handleAmountSubmit(userInput)
    if (inputMode === 'recipient')   handleRecipientSubmit(userInput)
    setUserInput('')
  }

  // ── Render one message ───────────────────────
  const renderMsg = (msg) => {
    switch (msg.type) {
      case 'user':
        return <UserBubble key={msg.id} time={msg.time}>{msg.text}</UserBubble>

      case 'banner':
        return <BannerMsg key={msg.id} time={msg.time} />

      case 'bot':
        return (
          <BotBubble
            key={msg.id}
            time={msg.time}
            button={
              msg.ctaLabel
                ? { label: msg.ctaLabel, onClick: () => setShowCountries(true) }
                : undefined
            }
          >
            <RichText text={msg.text} />
            {msg.placeholder && (
              <div
                className="mt-2 pl-3 border-l-[3px] text-xs"
                style={{ borderColor: '#00A884', color: '#8696A0' }}
              >
                {msg.placeholder}
              </div>
            )}
          </BotBubble>
        )

      case 'summary':
        return (
          <SummaryMsg
            key={msg.id}
            msg={msg}
            isActive={msg.active && step === 'summary'}
            onConfirm={handleConfirm}
            onChange={() => setShowChangeMenu(true)}
          />
        )

      case 'payment_info':
        return <PaymentInfoMsg key={msg.id} time={msg.time} />

      case 'status':
        return <StatusMsg key={msg.id} status={msg.status} recipient={recipient} time={msg.time} />

      default:
        return null
    }
  }

  const placeholder =
    inputMode === 'greeting'  ? 'Escribe "Hola" para comenzar...' :
    inputMode === 'amount'    ? 'Ej: $100 dólares' :
    inputMode === 'recipient' ? 'Nombre del destinatario...' :
    'Escribe un mensaje'

  // ─────────────────────────────────────────────────────
  return (
    <div className="flex justify-center" style={{ backgroundColor: '#111B21', minHeight: '100vh' }}>

      {/* ══════════════════════════════
          APP — fullscreen en móvil, centrado en desktop
          ══════════════════════════════ */}
      <div
        className="w-full h-screen flex flex-col md:max-w-md md:shadow-2xl"
        style={{ backgroundColor: '#0B141A' }}
      >

        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-3 py-2 shrink-0"
          style={{ backgroundColor: '#202C33' }}
        >
          <button className="p-1 shrink-0" style={{ color: '#8696A0' }}>
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>

          <div className="shrink-0 relative">
            <img
              src={logoKaito}
              alt="Kaito"
              className="w-10 h-10 rounded-full object-cover"
              style={{ border: '1.5px solid #2A3942' }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-[15px] leading-tight">Kaito Konnect</div>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#8696A0' }}>Kaito Konnect</span>
              <span
                className="shrink-0 flex items-center justify-center w-[15px] h-[15px] rounded-full"
                style={{ backgroundColor: '#0A7CFF' }}
              >
                <svg width="8" height="8" fill="white" viewBox="0 0 16 16">
                  <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0" style={{ color: '#8696A0' }}>
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
            </svg>
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            </svg>
          </div>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-3 py-3"
          style={{ backgroundColor: '#0B141A' }}
        >
          {messages.map(renderMsg)}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div
          className="shrink-0 px-2 py-2 flex items-center gap-2"
          style={{ backgroundColor: '#0B141A' }}
        >
          <button
            className="w-10 h-10 flex items-center justify-center shrink-0"
            style={{ color: '#8696A0' }}
          >
            <svg width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
          </button>

          <div
            className="flex-1 flex items-center rounded-full px-4 py-2.5"
            style={{ backgroundColor: '#202C33' }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={placeholder}
              disabled={!inputMode}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#E9EDEF', caretColor: '#00A884' }}
            />
            <button className="ml-2 shrink-0" style={{ color: '#8696A0' }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z"/>
              </svg>
            </button>
          </div>

          {userInput ? (
            <button
              onClick={handleSend}
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95"
              style={{ backgroundColor: '#00A884' }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 16 16">
                <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855l-.452.18a.5.5 0 0 0-.082.887l.41.26 4.995 3.178 3.178 4.995.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
              </svg>
            </button>
          ) : (
            <button
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: '#00A884' }}
            >
              <svg width="20" height="20" fill="white" viewBox="0 0 16 16">
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 0 1 4 0v5zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════
          MODALS
          ══════════════════════════════ */}
      {showCountries && (
        <CountrySheet
          currentCountry={country}
          onSelect={handleCountrySelect}
          onClose={() => setShowCountries(false)}
        />
      )}

      {showChangeMenu && (
        <Sheet title="¿Qué deseas cambiar?" onClose={() => setShowChangeMenu(false)}>
          <SheetItem onClick={() => handleChange('amount')}>💵 El monto</SheetItem>
          <SheetItem onClick={() => handleChange('recipient')}>👤 El destinatario</SheetItem>
          <SheetItem onClick={() => handleChange('country')}>🌍 El país de origen</SheetItem>
        </Sheet>
      )}
    </div>
  )
}
