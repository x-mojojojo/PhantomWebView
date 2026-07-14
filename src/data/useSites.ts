// useSites.ts — subscribes a component to SiteRepository changes (Flow<List<SiteEntry>> analogue).

import { useEffect, useState } from 'react';
import { SiteEntry, SiteRepository } from './SiteRepository';

export function useSites(): SiteEntry[] {
  const [sites, setSites] = useState<SiteEntry[]>(() => SiteRepository.getSites());

  useEffect(() => {
    const unsubscribe = SiteRepository.subscribe(() => setSites(SiteRepository.getSites()));
    return unsubscribe;
  }, []);

  return sites;
}
