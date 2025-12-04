"use client"

import { useState } from "react"
import Link from "next/link"
import type { Session } from "@/types/auth"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import BubbleMenu from "@/components/bubble-menu"

interface NavbarProps {
  session?: Session | null
  onLogout: () => void
  onLoginClick?: () => void
}

export default function Navbar({ session, onLogout, onLoginClick }: NavbarProps) {
  const menuItems = [
    {
      label: 'About Us',
      href: '/about',
      ariaLabel: 'About Us',
      rotation: -5,
      hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
    },
    {
      label: 'OCR',
      href: '/',
      ariaLabel: 'OCR Tool',
      rotation: 5,
      hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
    },
    {
      label: 'Tools/Resources',
      href: '/tools',
      ariaLabel: 'Tools and Resources',
      rotation: -5,
      hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
    },
    {
      label: 'Blog',
      href: '/blog',
      ariaLabel: 'Blog',
      rotation: 0,
      hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' }
    }
  ]

  const logoContent = (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-lg font-bold text-red-500">Infy Galaxy</span>
    </Link>
  )

  const userSection = session ? (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        {session.picture ? (
          <img
            src={session.picture}
            alt="Profile"
            className="w-16 h-16 rounded-full border-2 border-red-500"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full border-2 border-red-500 bg-red-100 flex items-center justify-center">
            <span className="text-2xl text-red-600">{session.name?.[0] || session.email[0].toUpperCase()}</span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-lg font-semibold text-gray-900">{session.name || 'User'}</p>
          <p className="text-sm text-gray-500">{session.email}</p>
        </div>
      </div>
      <InteractiveHoverButton
        onClick={onLogout}
        text="Logout"
        className="w-full"
      />
    </div>
  ) : (
    <div className="bg-white rounded-2xl p-6 shadow-lg space-y-3">
      <InteractiveHoverButton
        onClick={onLoginClick}
        text="Login"
        className="w-full"
      />
      <InteractiveHoverButton
        onClick={onLoginClick}
        text="Sign up"
        className="w-full"
      />
    </div>
  )

  return (
    <>
      {/* Menu temporarily hidden */}
      {/* <BubbleMenu
        logo={logoContent}
        items={menuItems}
        menuBg="#ffffff"
        menuContentColor="#111111"
        useFixedPosition={true}
        userSection={userSection}
      /> */}

      {/* User Profile Section - Outside Menu */}
      <div className="fixed top-8 right-24 z-[1002] pointer-events-auto">
        {session ? (
          <div className="flex items-center gap-3 bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)] px-4 py-2">
            {session.picture ? (
              <img
                src={session.picture}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-red-500"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-100 items-center justify-center" style={{ display: session.picture ? 'none' : 'flex' }}>
              <span className="text-sm text-red-600 font-semibold">{session.name?.[0] || session.email[0].toUpperCase()}</span>
            </div>
            <span className="text-sm text-gray-700 font-medium hidden md:inline">{session.name || session.email}</span>
            <InteractiveHoverButton
              onClick={onLogout}
              text="Logout"
              className="ml-2 px-4 py-1.5 text-sm h-8"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <InteractiveHoverButton
              onClick={onLoginClick}
              text="Login"
              className="text-sm px-4 py-2 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] hidden md:block"
            />
            <div className="bg-white rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <InteractiveHoverButton
                onClick={onLoginClick}
                text="Sign up"
                className="h-10 px-6"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
