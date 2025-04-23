"use client"

import { useState, ReactNode } from "react"
import { CreditCard, Landmark, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AccountType } from "@/types"

// Interfaz para las propiedades del selector de cuentas
export interface AccountSelectorProps {
  value: AccountType | string;
  onChange: (value: AccountType) => void;
  accounts: {
    value: string;
    label: string;
    balance: number;
    icon: ReactNode;
  }[];
}

// Función auxiliar para obtener el icono de la cuenta
export function getAccountIcon(type: AccountType): ReactNode {
  switch (type) {
    case "checking":
      return <Landmark className="h-4 w-4" />
    case "savings":
      return <Wallet className="h-4 w-4" />
    case "credit":
      return <CreditCard className="h-4 w-4" />
    case "cash":
      return <Wallet className="h-4 w-4" />
    default:
      return <Wallet className="h-4 w-4" />
  }
}

// Componente de selección de cuenta
export function AccountSelector({ value, onChange, accounts }: AccountSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? accounts.find((account) => account.value === value)?.label
            : "Seleccionar cuenta..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar cuenta..." />
          <CommandEmpty>No se encontraron cuentas.</CommandEmpty>
          <CommandGroup>
            {accounts.map((account) => (
              <CommandItem
                key={account.value}
                onSelect={(currentValue) => {
                  onChange(currentValue as AccountType)
                  setOpen(false)
                }}
                value={account.value}
              >
                <div className="flex items-center">
                  <span className="mr-2">{account.icon}</span>
                  <span>{account.label}</span>
                  <span className="ml-auto text-sm text-muted-foreground">
                    {new Intl.NumberFormat("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    }).format(account.balance)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
