#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

/** Sister repos live alongside PSA or under WORKSPACES_HOME (cloud: /home/ubuntu). */
export function resolveWorkspacesHome(psaRoot) {
  if (process.env.WORKSPACES_HOME?.trim()) {
    return path.resolve(process.env.WORKSPACES_HOME.trim());
  }
  const candidates = [
    path.join('/home/ubuntu'),
    path.dirname(psaRoot),
  ];
  for (const home of candidates) {
    if (
      fs.existsSync(path.join(home, 'Policestationrepuk')) ||
      fs.existsSync(path.join(home, 'custody-note-website')) ||
      fs.existsSync(path.join(home, 'pstrain-rebuild'))
    ) {
      return home;
    }
  }
  return path.dirname(psaRoot);
}

export const WORKSPACE_REPOS = {
  psa: { dir: '.', syncCore: true, label: 'policestationagent.com' },
  repuk: { dir: 'Policestationrepuk', syncCore: true, label: 'policestationrepuk.org' },
  psrtrain: { dir: 'pstrain-rebuild', syncCore: true, label: 'psrtrain.com' },
  custodynote: { dir: 'custody-note-website', syncCore: false, label: 'custodynote.com' },
};

export function repoPaths(psaRoot) {
  const home = resolveWorkspacesHome(psaRoot);
  const out = {};
  for (const [key, cfg] of Object.entries(WORKSPACE_REPOS)) {
    out[key] = key === 'psa' ? psaRoot : path.join(home, cfg.dir);
  }
  return out;
}
