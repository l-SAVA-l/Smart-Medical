"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "../SMUtils/SMUtils";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

// Animation variants for overlay
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// Animation variants for different sides
const slideVariants = {
  left: {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  },
  right: {
    hidden: { x: "100%" },
    visible: { x: 0 },
  },
  top: {
    hidden: { y: "-100%" },
    visible: { y: 0 },
  },
  bottom: {
    hidden: { y: "100%" },
    visible: { y: 0 },
  },
};

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      {/* Animated Overlay */}
      <SheetPrimitive.Overlay asChild>
        <motion.div
          data-slot="sheet-overlay"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </SheetPrimitive.Overlay>

      {/* Animated Content */}
      <SheetPrimitive.Content asChild {...props}>
        <motion.div
          data-slot="sheet-content"
          className={cn(
            "bg-background fixed z-50 flex flex-col shadow-2xl",
            side === "right" && "inset-y-0 right-0 h-full w-3/4 border-none sm:max-w-sm",
            side === "left" && "inset-y-0 left-0 h-full w-3/4 border-none sm:max-w-sm",
            side === "top" && "inset-x-0 top-0 h-auto border-b",
            side === "bottom" && "inset-x-0 bottom-0 h-auto border-t",
            className,
          )}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={slideVariants[side]}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            mass: 0.8,
          }}
        >
          {children}
          <SheetPrimitive.Close className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-all duration-200 hover:scale-110 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none z-10">
            <XIcon className="size-4 text-gray-600" />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
