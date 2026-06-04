import { useState } from 'react'
import './Chatbot.css'

const SYSTEM_PROMPT = `Eres un asistente virtual del Casino de Duoc UC. 
Tienes acceso a la siguiente información real del sistema:

HORARIOS:
- Atención de lunes a viernes de 12:00 a 14:00 hrs
- No hay atención los fines de semana ni festivos

CÓMO HACER UNA RESERVA:
- El usuario debe iniciar sesión con su cuenta institucional
- Ir a la sección "Reservas" en el menú de navegación
- Seleccionar el plato disponible, la fecha y la hora de retiro
- Confirmar la reserva con el botón "Confirmar reserva"
- Las reservas solo se pueden hacer para días hábiles futuros

CÓMO CANCELAR UNA RESERVA:
- Ir a la sección "Reservas"
- En "Mis reservas" aparecen todas las reservas activas
- Las reservas en estado "pendiente" tienen un botón para cancelar
- Las reservas canceladas no se pueden reactivar

ESTADOS DE UNA RESERVA:
- Pendiente: la reserva fue creada y está esperando ser preparada
- Lista: el plato está listo para retirar en el casino
- Cancelada: la reserva fue cancelada por el usuario

REGISTRO Y LOGIN:
- El usuario se registra con su correo institucional (@duocuc.cl) y una contraseña
- Si olvida su contraseña puede recuperarla desde el login haciendo clic en "¿Olvidaste tu contraseña?"
- Se enviará un correo de recuperación al correo registrado

MENÚ:
- El menú es actualizado diariamente por el administrador del casino
- Solo aparecen los platos marcados como disponibles
- Cada plato tiene nombre, descripción, precio y puede tener etiquetas como vegano, sin gluten, picante

CONTACTO:
- Para problemas técnicos o consultas administrativas, dirigirse directamente al casino

REGLAS:
- Solo responde preguntas relacionadas con el casino y la aplicación
- Si te preguntan algo que no sabes o que no está en esta información, dilo honestamente y sugiere ir al casino directamente
- Responde siempre en español, de forma breve, clara y amable
- No inventes información que no esté aquí`

const Chatbot = () => {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([
    { rol: 'assistant', texto: '¡Hola! Soy el asistente del Casino Duoc UC. ¿En qué puedo ayudarte?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const enviarMensaje = async () => {
    if (!input.trim() || loading) return

    const nuevosMensajes = [...mensajes, { rol: 'user', texto: input }]
    setMensajes(nuevosMensajes)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...nuevosMensajes.map(m => ({
              role: m.rol,
              content: m.texto
            }))
          ],
          max_tokens: 300,
        })
      })

      const data = await response.json()
      const respuesta = data.choices?.[0]?.message?.content ?? 'No pude procesar tu consulta.'
      setMensajes([...nuevosMensajes, { rol: 'assistant', texto: respuesta }])
    } catch {
      setMensajes([...nuevosMensajes, { rol: 'assistant', texto: 'Hubo un error al conectar. Intenta de nuevo.' }])
    }

    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') enviarMensaje()
  }

  return (
    <div className="chatbot-wrapper">
      {abierto && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <span>Asistente Casino</span>
            <button className="chatbot-close" onClick={() => setAbierto(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {mensajes.map((m, i) => (
              <div key={i} className={`chatbot-msg ${m.rol === 'user' ? 'user' : 'bot'}`}>
                {m.texto}
              </div>
            ))}
            {loading && <div className="chatbot-msg bot">Escribiendo...</div>}
          </div>

          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              type="text"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="chatbot-send" onClick={enviarMensaje} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}

      <button className="chatbot-fab" onClick={() => setAbierto(!abierto)}>
        {abierto ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default Chatbot