import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        threeD:
          'bg-indigo-600 dark:bg-indigo-700 text-white border-b-[4px] border-indigo-800 dark:border-indigo-950 hover:bg-indigo-500 dark:hover:bg-indigo-600 active:border-b-0 active:translate-y-[4px] active:my-[2px] shadow-md transition-all font-semibold rounded-xl',
        secondary3d:
          'bg-emerald-600 dark:bg-emerald-700 text-white border-b-[4px] border-emerald-800 dark:border-emerald-950 hover:bg-emerald-500 dark:hover:bg-emerald-600 active:border-b-0 active:translate-y-[4px] active:my-[2px] shadow-md transition-all font-semibold rounded-xl',
        destructive3d:
          'bg-red-650 dark:bg-red-750 text-white border-b-[4px] border-red-850 dark:border-red-950 hover:bg-red-600 dark:hover:bg-red-700 active:border-b-0 active:translate-y-[4px] active:my-[2px] shadow-md transition-all font-semibold rounded-xl',
        outline3d:
          'border-2 border-indigo-600 dark:border-indigo-400 bg-background text-indigo-600 dark:text-indigo-400 border-b-[6px] border-indigo-800 dark:border-indigo-950 active:border-b-2 active:translate-y-[4px] active:my-[2px] transition-all font-semibold rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/20',
        orange3d:
          'bg-amber-500 dark:bg-amber-600 text-white border-b-[4px] border-amber-700 dark:border-amber-800 hover:bg-amber-400 dark:hover:bg-amber-500 active:border-b-0 active:translate-y-[4px] active:my-[2px] shadow-md transition-all font-semibold rounded-xl',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
