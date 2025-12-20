"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Session } from "@/types/auth"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Menu, X } from "lucide-react"

interface NavbarProps {
  session?: Session | null
  onLogout?: () => void
  onLoginClick?: () => void
}

export default function Navbar({ session, onLogout, onLoginClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'OCR', href: '/' },
    { label: 'Blog', href: '/blog' },

  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold text-red-500 hover:text-red-600 transition-colors z-10">
          Infy Galaxy
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-red-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth Section (Desktop) */}
        <div className="hidden md:flex items-center gap-4 z-10">
          {session ? (
            <div className="flex items-center gap-3">
              {session.picture ? (
                <img
                  src={session.picture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-red-500 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=ef4444&color=fff&size=32`;
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                  {(session.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700">
                {session.name?.split(' ')[0] || 'User'}
              </span>
              <InteractiveHoverButton
                onClick={() => onLogout?.()}
                text="Logout"
                className="px-4 py-1.5 text-sm h-8"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <InteractiveHoverButton
                onClick={() => { onLoginClick?.(); }}
                text="Login"
                className="px-5 py-2 text-sm h-9"
              />
              <InteractiveHoverButton
                onClick={onLoginClick}
                text="Sign in"
                className="px-5 py-2 text-sm h-9"
              />
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base font-medium text-gray-700 hover:text-red-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {session ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  {session.picture ? (
                    <img
                      src={session.picture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.name || 'User')}&background=ef4444&color=fff&size=32`;
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">
                      {(session.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">{session.name || 'User'}</span>
                </div>
                <InteractiveHoverButton
                  onClick={() => { onLogout?.(); setMobileMenuOpen(false); }}
                  text="Logout"
                  className="w-full text-center"
                />
              </>
            ) : (
              <>
                <InteractiveHoverButton
                  onClick={() => { onLoginClick?.(); setMobileMenuOpen(false); }}
                  text="Login"
                  className="w-full text-center"
                />
                <InteractiveHoverButton
                  onClick={() => { onLoginClick?.(); setMobileMenuOpen(false); }}
                  text="Sign in"
                  className="w-full text-center"
                />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
