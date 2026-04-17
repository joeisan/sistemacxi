'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Menu, 
  LayoutDashboard, 
  Users, 
  Package, 
  Bell, 
  Settings, 
  LogOut, 
  Home, 
  MapPin, 
  User, 
  Building,
  CreditCard
} from 'lucide-react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { FontSizeSelector } from './font-size-selector'

// Mapping of icon names to Lucide components
const IconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Users,
  Package,
  Bell,
  Settings,
  LogOut,
  Home,
  MapPin,
  User,
  Building,
  CreditCard
}

interface NavItem {
  href: string
  label: string
  iconName: string // Changed from React.ElementType to string
}

interface MobileNavProps {
  title: string
  items: NavItem[]
  footerItems?: NavItem[]
  logo?: string | null
  extraContent?: React.ReactNode
}

export function MobileNav({ title, items, footerItems, logo, extraContent }: MobileNavProps) {
  const [open, setOpen] = React.useState(false)

  const renderIcon = (name: string) => {
    const Icon = IconMap[name]
    return Icon ? <Icon className="h-5 w-5" /> : null
  }

  return (
    <div className="flex items-center gap-4 md:hidden w-full h-14 border-b bg-background px-4 shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        } />
        <SheetContent side="left" className="w-72 p-0 flex flex-col">
          <SheetHeader className="p-6 border-b text-left">
            <SheetTitle className="flex items-center gap-2">
              {logo && <img src={logo} alt="Logo de la empresa" className="h-8 w-auto object-contain" />}
              <span className="truncate">{title}</span>
            </SheetTitle>
          </SheetHeader>
          
          <nav className="flex-1 space-y-1 p-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary hover:bg-muted font-medium"
              >
                {renderIcon(item.iconName)}
                {item.label}
              </Link>
            ))}
          </nav>

          {extraContent && (
            <div className="mt-auto border-t bg-muted/20">
              {extraContent}
            </div>
          )}

          {footerItems && (
            <div className="border-t p-4 space-y-1">
              {footerItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary font-medium"
                >
                  {renderIcon(item.iconName)}
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-4 px-3">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Tamaño</span>
                    <FontSizeSelector />
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Tema</span>
                    <ThemeToggle />
                 </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 font-bold truncate">
        {title}
      </div>

      <ThemeToggle />
    </div>
  )
}
