import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils'

export const RadioGroup = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Root>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>>(({ className, ...props }, ref) => <RadioGroupPrimitive.Root ref={ref} className={cn('grid gap-3', className)} {...props} />)
RadioGroup.displayName = 'RadioGroup'

// Rádio do Figma: anel laranja e miolo laranja quando marcado
export const RadioGroupItem = React.forwardRef<React.ElementRef<typeof RadioGroupPrimitive.Item>, React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item ref={ref} className={cn('flex aspect-square h-4 w-4 shrink-0 items-center justify-center rounded-full border border-accent text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent', className)} {...props}>
    <RadioGroupPrimitive.Indicator className="block h-[7px] w-[7px] rounded-full bg-accent" />
  </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = 'RadioGroupItem'
