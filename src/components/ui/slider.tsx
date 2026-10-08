import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

// Trilho fino laranja e polegares com "anel" da cor do painel, como no Figma (Faixa de preço).
const thumbClass =
  'block h-[18px] w-[18px] rounded-full border-[3px] border-panel bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-light'

export const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(({ className, ...props }, ref) => {
  const values = props.value ?? props.defaultValue ?? []
  return (
    <SliderPrimitive.Root ref={ref} className={cn('relative flex h-[18px] w-full touch-none select-none items-center', className)} {...props}>
      <SliderPrimitive.Track className="relative h-[3px] w-full grow rounded-full bg-accent">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      {values.map((_, index) => (
        <SliderPrimitive.Thumb key={index} aria-label={index === 0 ? 'Preço mínimo' : 'Preço máximo'} className={thumbClass} />
      ))}
    </SliderPrimitive.Root>
  )
})
Slider.displayName = 'Slider'
