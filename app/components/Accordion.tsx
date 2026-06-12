import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { cn } from "~/lib/utils";

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within an Accordion");
    }
    return context;
};

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string;
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
                                                        children,
                                                        defaultOpen,
                                                        allowMultiple = false,
                                                        className = "",
                                                    }) => {
    const [activeItems, setActiveItems] = useState<string[]>(
        defaultOpen ? [defaultOpen] : []
    );

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            }

            return prev.includes(id) ? [] : [id];
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider value={{ activeItems, toggleItem, isItemActive }}>
            <div className={cn("space-y-3", className)}>{children}</div>
        </AccordionContext.Provider>
    );
};

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
                                                                id,
                                                                children,
                                                                className = "",
                                                            }) => {
    return (
        <div
            data-accordion-item={id}
            className={cn(
                "overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
                className
            )}
        >
            {children}
        </div>
    );
};

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
                                                                    itemId,
                                                                    children,
                                                                    className = "",
                                                                }) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <button
            type="button"
            onClick={() => toggleItem(itemId)}
            aria-expanded={isActive}
            aria-controls={`${itemId}-content`}
            id={`${itemId}-trigger`}
            className={cn(
                "flex w-full items-center justify-between px-4 py-4 text-left hover:bg-gray-50",
                className
            )}
        >
            <div className="min-w-0 flex-1">{children}</div>

            <svg
                className={cn(
                    "h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200",
                    isActive && "rotate-180"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                />
            </svg>
        </button>
    );
};

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
                                                                      itemId,
                                                                      children,
                                                                      className = "",
                                                                  }) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    return (
        <div
            id={`${itemId}-content`}
            role="region"
            aria-labelledby={`${itemId}-trigger`}
            className={cn(
                "overflow-hidden transition-all duration-300",
                isActive ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}
        >
            {isActive && <div className={cn("px-4 pb-4 pt-1", className)}>{children}</div>}
        </div>
    );
};