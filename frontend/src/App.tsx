import { useEffect } from 'react'
import { apiFetch } from './services/api'

function App() {
  useEffect(() => {
    apiFetch('/health').then(console.log)
  }, [])

  return (
    <h1
      className="
        p-8
        text-4xl
        font-bold
        text-blue-600
      "
    >
      Prazo
    </h1>
  )
}

export default App
