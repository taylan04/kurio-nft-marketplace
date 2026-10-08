import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function SearchBar({ value, onChange, onSubmit }: SearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      className="relative flex-1"
    >
      <Search
        className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-[#c79c61]"
        size={18}
        strokeWidth={1.8}
      />

      <Input
        aria-label="Explorar coleções"
        className="
          h-11
          rounded-xl
          border-transparent
          bg-[#241410]
          pl-10
          pr-4
          text-[14px]
          font-bold
          text-[#c79c61]
          placeholder:text-[#c79c61]
          focus-visible:ring-[#d98a45]
        "
        placeholder="Explorar coleções"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  )
}