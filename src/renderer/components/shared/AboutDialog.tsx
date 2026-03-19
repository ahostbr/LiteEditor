import React, { useEffect, useState } from 'react'
import { LiteAboutDialog } from 'lite-ui'

interface AboutDialogProps {
  onClose: () => void
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  const [info, setInfo] = useState<{
    appName: string
    appDescription: string
    version: string
    commitHash?: string
    buildDate?: string
    electronVersion?: string
    nodeVersion?: string
    platform?: string
    links?: Array<{ label: string; url: string }>
  } | null>(null)
  const [iconSrc, setIconSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    window.api.about.getInfo().then(setInfo)
    window.api.about.getIcon().then((src: string | null) => {
      if (src) setIconSrc(src)
    })
  }, [])

  if (!info) return null

  return (
    <LiteAboutDialog
      open={true}
      onClose={onClose}
      appName={info.appName}
      appDescription={info.appDescription}
      version={info.version}
      commitHash={info.commitHash}
      buildDate={info.buildDate}
      electronVersion={info.electronVersion}
      nodeVersion={info.nodeVersion}
      platform={info.platform}
      links={info.links}
      imageSrc={iconSrc}
      onOpenExternal={(url) => window.api.shell.openExternal(url)}
    />
  )
}
