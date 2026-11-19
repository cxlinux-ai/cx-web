/**
 * Switches for the static /how-to pages.
 *
 * CX_ASK_RELEASED controls the "Do it in plain English" box on every how-to page.
 *
 * false — the box introduces CX Terminal and links to /getting-started without describing
 *         command behaviour. Use this while the published APT package predates the `cx ask`
 *         fixes (cx-core #780 answers, #781 package guard): the pages must not promise behaviour
 *         a user who installs CX today does not get.
 * true  — the box shows `cx ask -d "<prompt>"` and states that CX shows the command and runs it
 *         only after the user confirms. Flip this only after an APT release that contains
 *         #780 and #781, then run `npm run build:howto` and commit the regenerated pages.
 */
export const CX_ASK_RELEASED = false;

export const SITE_URL = "https://cxlinux.com";
export const HOWTO_BASE = "/how-to";
export const GA_MEASUREMENT_ID = "G-KW1EVSFJLM";
