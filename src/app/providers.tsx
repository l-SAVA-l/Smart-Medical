'use client'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import { AlertProvider } from '@/components/common/SMAlert/AlertProvider'
import { BookingModalProvider } from '@/components/SMBookingModal/BookingModalProvider'

export const Providers = ({ children }: React.PropsWithChildren) => {
  return (
    <SessionProvider>
      <AlertProvider>
        <BookingModalProvider>
          {children}
        </BookingModalProvider>
      </AlertProvider>
    </SessionProvider>
  )
}