"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface NavItem {
    name: string
    url: string
    icon: LucideIcon
}

interface NavBarProps {
    items: NavItem[]
    className?: string
}

export function NavBar({ items, className }: NavBarProps) {
    const [activeTab, setActiveTab] = useState(items[0].name)

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#'
            const currentItem = items.find(item => item.url === hash)
            if (currentItem) setActiveTab(currentItem.name)
        }

        window.addEventListener("hashchange", handleHashChange)
        handleHashChange()
        return () => window.removeEventListener("hashchange", handleHashChange)
    }, [items])

    return (
        <div
            className={cn(
                "fixed bottom-6 sm:top-6 left-1/2 -translate-x-1/2 z-[100]",
                className,
            )}
        >
            <div className="flex items-center gap-1 bg-background/60 border border-border/50 backdrop-blur-xl py-1.5 px-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <a
                            key={item.name}
                            href={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-sm font-semibold px-5 py-2 rounded-full transition-all duration-300",
                                "text-foreground/50 hover:text-foreground",
                                isActive && "text-primary",
                            )}
                        >
                            <span className="hidden md:inline uppercase tracking-widest text-[9px] font-extrabold">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={16} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full bg-primary/10 rounded-full -z-10"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                                        <div className="absolute w-12 h-6 bg-primary/30 rounded-full blur-md -top-2 -left-2" />
                                        <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-sm -top-1" />
                                    </div>
                                </motion.div>
                            )}
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
