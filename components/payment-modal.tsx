"use client"
import { SubscriptionPlansModal } from "./subscription-plans-modal"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: string
    name: string
    price: number
    period: string
  }
}

export function PaymentModal({ isOpen, onClose, plan }: PaymentModalProps) {
  // This component is now deprecated in favor of SubscriptionPlansModal
  // We'll just render the new component for backward compatibility

  const subscriptionPlan = {
    id: plan.id,
    name: plan.name,
    price: plan.price,
    period: plan.period,
    features: [],
  }

  return <SubscriptionPlansModal isOpen={isOpen} onClose={onClose} currentPlan={plan.id} />
}

