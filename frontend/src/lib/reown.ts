import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon } from '@reown/appkit/networks'
import { QueryClient } from '@tanstack/react-query'

// Get a Project ID at https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID ?? 'YOUR_REOWN_PROJECT_ID'

export const queryClient = new QueryClient()

const metadata = {
  name: 'ØRACLE',
  description: 'On-chain intelligence, distilled.',
  url: window.location.origin,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const networks = [mainnet, arbitrum, polygon] as unknown as [typeof mainnet, ...typeof mainnet[]]

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
})

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  features: {
    analytics: false,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#6366F1',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#6366F1',
    '--w3m-border-radius-master': '4px',
  },
})
