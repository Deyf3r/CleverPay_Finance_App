"use client"

import { useState } from "react"
import NavBar from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { useSettings, languages, currencies, type UserSettings } from "@/context/settings-context"

export default function SettingsPage() {
  const { settings, updateSettings, translate } = useSettings()
  const [formSettings, setFormSettings] = useState<UserSettings>(settings)

  const handleSaveSettings = () => {
    updateSettings(formSettings)
    toast({
      title: translate("alert.success"),
      description: translate("settings.saved"),
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <NavBar />
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{translate("settings.title")}</h2>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{translate("settings.preferences")}</CardTitle>
            <CardDescription>{translate("settings.customize")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Idioma */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {translate("settings.language")}
              </label>
              <Select
                value={formSettings.language}
                onValueChange={(value) => setFormSettings({ ...formSettings, language: value as any })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={translate("settings.select_language")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(languages).map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tema */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {translate("settings.theme")}
              </label>
              <Select
                value={formSettings.theme}
                onValueChange={(value) => setFormSettings({ ...formSettings, theme: value as any })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={translate("settings.select_theme")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{translate("settings.light")}</SelectItem>
                  <SelectItem value="dark">{translate("settings.dark")}</SelectItem>
                  <SelectItem value="system">{translate("settings.system")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Moneda */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {translate("settings.currency")}
              </label>
              <Select
                value={formSettings.currency}
                onValueChange={(value) => setFormSettings({ ...formSettings, currency: value as any })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={translate("settings.select_currency")} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(currencies).map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={handleSaveSettings}>
              {translate("settings.save")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
