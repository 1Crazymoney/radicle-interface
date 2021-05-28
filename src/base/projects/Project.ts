import type { Config } from '@app/config';

export interface Project {
  id: string
  stateHash: string
  stateHashFormat: string
}

export interface User {
  urn: string
  avatar: { emoji: string, background: { r: number, g: number, b: number } }
}

export interface Meta {
  name: string
  description: string
  maintainers: User[]
}

export async function getMetadata(urn: string, config: Config): Promise<Meta | null> {
  const response = await fetch(`${config.seed.url}/projects/${urn}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'no-cors'
  });

  if (! response.ok) {
    return null;
  }

  return await response.json();
}
