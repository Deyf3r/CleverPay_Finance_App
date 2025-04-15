import Link from "next/link"
import { cn } from "@/lib/utils"
import { LogoIcon } from "./logo-icon"

interface CleverPayLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showSlogan?: boolean
  centered?: boolean
  className?: string
  linkClassName?: string
}

export function CleverPayLogo({
  size = "md",
  showSlogan = true,
  centered = false,
  className,
  linkClassName,
}: CleverPayLogoProps) {
  const sizes = {
    sm: { icon: 24, text: "text-base" },
    md: { icon: 32, text: "text-lg" },
    lg: { icon: 40, text: "text-xl" },
    xl: { icon: 48, text: "text-2xl" },
  }

  return (
    <Link
      href="/"
      className={cn(`cleverpay-brand ${centered ? "flex-col items-center" : "items-center"}`, linkClassName)}
    >
      <div className={cn("logo-reveal", className)}>
        <LogoIcon size={sizes[size].icon} />
      </div>
      <div className={cn("cleverpay-text", centered ? "items-center mt-2" : "")}>
        <span className={cn("cleverpay-name", sizes[size].text)}>CleverPay</span>
        {showSlogan && <span className="cleverpay-slogan">Tu dinero, más inteligente que nunca</span>}
      </div>
    </Link>
  )
}
