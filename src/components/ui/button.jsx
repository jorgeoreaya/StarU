import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:-translate-y-0.5 hover:shadow-lg',
        gradient:
          'text-primary-foreground shadow hover:-translate-y-0.5 hover:shadow-lg bg-gradient-to-br from-[#f59e0b] to-[#d97706]',
        outline:
          'border border-border bg-transparent hover:border-primary hover:text-foreground',
        ghost: 'text-muted-foreground hover:text-foreground hover:bg-accent',
        glass:
          'bg-white/5 border border-white/10 backdrop-blur text-foreground hover:-translate-y-0.5',
        destructive:
          'bg-destructive text-destructive-foreground hover:-translate-y-0.5',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3.5 text-[0.85rem]',
        lg: 'h-12 px-7 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
