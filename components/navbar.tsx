"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Session } from "@/types/auth"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { Menu, X } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

interface NavbarProps {
  session?: Session | null
  onLogout?: () => void
  onLoginClick?: () => void
}


export default function Navbar({ session, onLogout, onLoginClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null)

  const navLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'OCR', href: '/' },
    { label: 'Blog', href: '/blog' },
  ]

  const toolCategories = [
    {
      name: "PDF Tools",
      items: [
        { label: 'Image to PDF', href: '/tools/image-to-pdf' },
        { label: 'Text to PDF', href: '/tools/text-to-pdf' },
        { label: 'Excel to PDF', href: '/tools/excel-to-pdf' },
        { label: 'Word to PDF', href: '/tools/word-to-pdf' },
        { label: 'PPT to PDF', href: '/tools/ppt-to-pdf' },
      ]
    },
    {
      name: "Document Tools",
      items: [
        { label: 'Text to Word', href: '/tools/text-to-word' },
        { label: 'Text to Excel', href: '/tools/text-to-excel' },
        { label: 'Text to PPT', href: '/tools/text-to-ppt' },
        { label: 'Text to Image', href: '/tools/text-to-image' },
      ]
    }
  ]

  const toggleMobileCategory = (categoryName: string) => {
    setMobileExpandedCategory(current => current === categoryName ? null : categoryName)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-gray-100 shadow-sm h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold text-red-500 hover:text-red-600 transition-colors z-10">
          Infy Galaxy
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {navLinks.filter(l => l.label !== 'Blog').map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-gray-700 hover:text-red-500 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-lg font-medium text-gray-700 hover:text-red-500 transition-colors outline-none data-[state=open]:text-red-500 group">
              Tools <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="w-[400px] bg-white border border-gray-100 shadow-xl rounded-xl p-6 animate-in fade-in zoom-in-95 duration-200 z-[110]"
            >
              <div className="grid grid-cols-2 gap-8">
                {toolCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="text-sm font-bold text-red-500 uppercase tracking-wider mb-2">
                      {category.name}
                    </div>
                    <div className="space-y-1">
                      {category.items.map((tool) => (
                        <DropdownMenuItem key={tool.href} asChild className="focus:bg-red-50 focus:text-red-600 rounded-lg cursor-pointer p-0">
                          <Link href={tool.href} className="block w-full text-base font-medium text-gray-600 hover:text-red-600 px-2 py-1.5 transition-colors">
                            {tool.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/blog"
            className="text-lg font-medium text-gray-700 hover:text-red-500 transition-colors"
          >
            Blog
          </Link>
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
      {
        mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[80vh]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-gray-700 hover:text-red-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="py-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tools</p>
              <div className="space-y-1">
                {toolCategories.map((category) => {
                  const isExpanded = mobileExpandedCategory === category.name;
                  return (
                    <div key={category.name} className="border-b border-gray-50 last:border-0">
                      <button
                        onClick={() => toggleMobileCategory(category.name)}
                        className="w-full flex items-center justify-between py-3 px-2 text-left"
                      >
                        <span className="text-sm font-bold text-red-500 uppercase tracking-wider">{category.name}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="pb-3 pl-4 space-y-1 bg-gray-50/50 rounded-b-lg animate-in slide-in-from-top-1 duration-150">
                          {category.items.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              className="block text-base font-medium text-gray-600 hover:text-red-500 py-2 pl-2 border-l-2 border-transparent hover:border-red-500 transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

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
        )
      }
    </nav >
  )
}
