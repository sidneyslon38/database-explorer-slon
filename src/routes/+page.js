// Page settings
// These values are passed to the layout to control what appears on the page.

import crashes from '$lib/data/cyclist_injuries_2026.json';

export function load() {
  return {
    // Set to false to hide the NYCity News Service header
    showHeader: false,
    // Set to false to hide the site footer
    showFooter: false,
    crashes,
  };
}
