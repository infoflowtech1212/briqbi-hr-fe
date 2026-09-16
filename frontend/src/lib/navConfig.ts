import type { ModuleAccent } from '@shared/forms'
import {
  BoxIcon,
  BriefcaseIcon,
  CapIcon,
  ChatIcon,
  CheckIcon,
  FolderIcon,
  GridIcon,
  LinkIcon,
  PeopleIcon,
  ShieldCheckIcon,
  UserIcon,
} from '../components/icons'
import type { ComponentType, SVGProps } from 'react'

export interface NavItem {
  path: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export interface NavGroup {
  label: string
  accent: ModuleAccent | null
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    accent: null,
    items: [{ path: '/', label: 'Dashboard', icon: GridIcon }],
  },
  {
    label: 'People',
    accent: 'blue',
    items: [
      { path: '/team-members', label: 'Team Members', icon: PeopleIcon },
      { path: '/joining-tasks', label: 'Joining Tasks', icon: CheckIcon },
    ],
  },
  {
    label: 'Hiring',
    accent: 'green',
    items: [
      { path: '/job-openings', label: 'Job Openings', icon: BriefcaseIcon },
      { path: '/candidates', label: 'Candidates', icon: UserIcon },
      { path: '/interviews', label: 'Interviews', icon: ChatIcon },
      { path: '/offers', label: 'Offers', icon: ShieldCheckIcon },
    ],
  },
  {
    label: 'Checks',
    accent: 'purple',
    items: [
      { path: '/background-checks', label: 'Background Checks', icon: ShieldCheckIcon },
      { path: '/documents', label: 'Documents', icon: FolderIcon },
    ],
  },
  {
    label: 'Development',
    accent: 'orange',
    items: [{ path: '/training', label: 'Training', icon: CapIcon }],
  },
  {
    label: 'Kit',
    accent: 'teal',
    items: [{ path: '/assets', label: 'Assets', icon: BoxIcon }],
  },
  {
    label: 'Forms',
    accent: null,
    items: [{ path: '/forms', label: 'Mint a link', icon: LinkIcon }],
  },
]
