"use client"

import { useSession } from "@/hooks/use-session"
import ConsentPopup from "@/components/consent-popup"

export default function ClientConsentWrapper() {
    const { session } = useSession()

    if (!session) return null

    return <ConsentPopup session={session} />
}
