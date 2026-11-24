/** Canonical APT repo setup (matches client/public/install.sh). */
export const APT_GPG_URL = "https://repo.cxlinux.com/pub.gpg";
export const APT_KEYRING_PATH = "/usr/share/keyrings/cxlinux-archive-keyring.gpg";
export const APT_REPO_LINE =
  `deb [signed-by=${APT_KEYRING_PATH}] https://repo.cxlinux.com/apt stable main`;

export const APT_ADD_GPG_KEY_COMMAND =
  `curl -fsSL ${APT_GPG_URL} | sudo gpg --dearmor -o ${APT_KEYRING_PATH}`;

export const APT_ADD_SOURCES_COMMAND =
  `echo "${APT_REPO_LINE}" | sudo tee /etc/apt/sources.list.d/cxlinux.list`;

/** One-liner for Getting Started APT tab (includes install). */
export const APT_FULL_INSTALL_COMMAND =
  `${APT_ADD_GPG_KEY_COMMAND} && ${APT_ADD_SOURCES_COMMAND} && sudo apt update && sudo apt install -y cx-terminal`;

export const APT_INSTALL_PACKAGES_COMMAND =
  "sudo apt update && sudo apt install -y cx-terminal";

export const CURL_INSTALL_COMMAND =
  "curl -fsSL https://cxlinux.com/install.sh | bash";

export function licenseActivateCommand(licenseKey: string): string {
  return `cx activate ${licenseKey}`;
}

export const LICENSE_ACTIVATE_PLACEHOLDER = "cx activate YOUR_LICENSE_KEY";
