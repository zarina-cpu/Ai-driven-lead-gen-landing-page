import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils.js";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 text-sm font-bold capitalize tracking-normal shadow-[0_7px_10px_-5px_rgba(0,0,0,0.25)] transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "border-2 border-accent bg-accent text-white hover:bg-transparent hover:text-accent",
        line: "border-2 border-white bg-transparent text-white hover:border-accent hover:bg-accent hover:text-white",
        outline: "border-2 border-line bg-transparent text-ink shadow-none hover:border-accent hover:text-accent dark:text-white",
        ghost: "shadow-none text-ink hover:text-accent dark:text-white",
        dark: "border-2 border-accent-2 bg-accent-2 text-white hover:bg-accent hover:border-accent",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  },
);

export function Button({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}
