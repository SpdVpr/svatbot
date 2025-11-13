'use client'

import React, { memo } from 'react'
import { Settings as SettingsIcon } from 'lucide-react'

function SettingsTab() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <SettingsIcon className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nastavení nejsou dostupná
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        Tato sekce je momentálně ve vývoji. Nastavení budou dostupná v budoucí aktualizaci.
      </p>
    </div>
  )
}

export default memo(SettingsTab)
