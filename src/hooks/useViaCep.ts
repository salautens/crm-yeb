import { useState, useEffect } from 'react'

interface ViaCepResult {
  logradouro: string
  bairro: string
  localidade: string
  uf: string
}

interface UseViaCepReturn {
  data: ViaCepResult | null
  loading: boolean
  error: string | null
}

export function useViaCep(cep: string): UseViaCepReturn {
  const [data, setData] = useState<ViaCepResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleanCep = cep.replace(/\D/g, '')

  useEffect(() => {
    if (cleanCep.length !== 8) {
      setData(null)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      .then((res) => res.json())
      .then((json) => {
        if (json.erro) {
          setError('CEP não encontrado')
          setData(null)
        } else {
          setData(json)
        }
      })
      .catch(() => setError('Erro ao buscar CEP'))
      .finally(() => setLoading(false))
  }, [cleanCep])

  return { data, loading, error }
}
