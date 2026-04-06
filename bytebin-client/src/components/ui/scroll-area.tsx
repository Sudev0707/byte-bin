"use client"

import * as React from "react"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
<ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(
      "relative overflow-hidden",
      className
    )}
{...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar className="flex select-none touch-none p-0.5 w-3 bg-transparent transition-colors duration-200 ease-out hover:bg-accent h-[100%] flex-col">
      <ScrollAreaPrimitive.ScrollAreaThumb className="flex-1 bg-border rounded-full relative before:absolute before:top-1 before:left-1 before:right-1 before:bottom-1 before:rounded-[inherit] before:bg-current before:shadow-[0_0_1px_0_var(--current-color)] before:transition-all before:duration-300 before:ease-out before:content-[''] after:absolute after:inset-0 after:rounded-[inherit] after:bg-current after:shadow-[inset_0_0_1px_0_var(--current-color)] after:transition-all after:duration-300 after:ease-out after:content-['']" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

export { ScrollArea }

