const API_URL = import.meta.env.VITE_API_URL

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

  // O DELETE responde 204, sem corpo: não há JSON para ler
  if (response.status === 204) {
    return undefined as unknown as T
  }

  const dados = await response.json()

  if (!response.ok) {
    throw new Error(dados.erro || 'Erro desconhecido')
  }

  return dados
}
