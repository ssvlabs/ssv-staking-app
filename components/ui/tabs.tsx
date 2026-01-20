"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode
} from "react";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | undefined>(
  undefined
);

type TabsProps = {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
};

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  className,
  children
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value ?? internalValue;

  const setValue = useCallback(
    (nextValue: string) => {
      setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div className={cn(className)} {...props} />
  );
}

type TabsTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({
  className,
  value,
  onClick,
  ...props
}: TabsTriggerProps) {
  const context = useContext(TabsContext);
  const isActive = context ? context.value === value : false;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    context?.setValue(value);
  };

  return (
    <button
      {...props}
      className={cn(className)}
      data-state={isActive ? "active" : "inactive"}
      onClick={handleClick}
      type="button"
    />
  );
}

type TabsContentProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({ className, value, ...props }: TabsContentProps) {
  const context = useContext(TabsContext);
  if (!context) {
    return <div className={className} {...props} />;
  }

  if (context.value !== value) {
    return null;
  }

  return <div className={className} {...props} />;
}
