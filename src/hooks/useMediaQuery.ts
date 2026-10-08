import { useEffect, useState } from 'react'

/** Retorna se a media query bate agora e acompanha mudanças (ex.: girar o tablet). */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Mesmo breakpoint do Tailwind `md` (768px) */
export const useIsDesktop = () => useMediaQuery('(min-width: 768px)')
