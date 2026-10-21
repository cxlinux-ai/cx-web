/**
 * Server-rendered homepage content.
 *
 * cxlinux.com is a client-rendered SPA: the raw HTML for "/" is an empty `#root`, so crawlers and
 * answer engines that do not run JavaScript saw no headings, no copy and no links (SEOAST
 * render_dependency, js_only_content, heading_hierarchy, internal_linking).
 *
 * The Pages middleware inserts this markup into `#root` on the "/" response. React's `createRoot`
 * replaces it on mount, so visitors with JavaScript see the normal app. Every heading, sentence and
 * link below is copied from `client/src/sections/HomePage.tsx`; keep the two in sync when the
 * homepage copy changes (the test in `client/src/lib/home-prerender.test.ts` checks the key lines).
 */

const INSTALL_COMMAND = "curl -fsSL https://cxlinux.com/install.sh | bash";

export const HOME_PRERENDER_HTML = `<div class="max-w-4xl mx-auto px-4 py-20 text-gray-300" data-prerender="home">
<header class="text-center mb-16">
<p class="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#00FF9F] mb-6">Preview · Approve · Rollback</p>
<h1 class="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">Stop Googling Linux Commands. Just Tell CX What You Need.</h1>
<p class="text-lg md:text-xl text-gray-400 mb-4">Set up servers, configure firewalls, deploy apps, in plain English. CX handles the commands. You stay in control.</p>
<p class="text-sm text-gray-500 mb-8">Works on Ubuntu, Debian, RHEL, and Arch. Free forever for personal use. No credit card required.</p>
<nav aria-label="Get started" class="flex flex-wrap justify-center gap-4">
<a href="/getting-started" class="text-[#00FF9F] hover:underline">Get started with CX Linux</a>
<a href="/pricing" class="text-[#00FF9F] hover:underline">See CX Linux pricing</a>
<a href="/faq" class="text-[#00FF9F] hover:underline">Read the CX Linux FAQ</a>
<a href="/blog" class="text-[#00FF9F] hover:underline">CX Linux blog</a>
</nav>
</header>
<section class="mb-12">
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">One prompt. Every server.</h2>
<p class="text-gray-400">Works on Ubuntu, Debian, RHEL, Arch—any Linux distro you SSH into.</p>
</section>
<section class="mb-12">
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">How It Works</h2>
<p class="text-gray-500 mb-4">From English to executed, in seconds.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Describe the task</h3>
<p class="text-gray-500 text-sm mb-3">Plain English. No man pages, no Stack Overflow, no syntax to memorize.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Review commands</h3>
<p class="text-gray-500 text-sm mb-3">See exactly what will run before anything happens. You're always in control.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Approve &amp; ship</h3>
<p class="text-gray-500 text-sm">One keystroke runs it all. Instant rollback available if anything goes wrong.</p>
</section>
<section class="mb-12">
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">Built for secure operations.</h2>
<p class="text-gray-400 mb-4">Every command runs in a sandbox, previewed before execution, rollback-ready, and fully audited, so your auditors and your blast radius both stay small.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Firejail Sandboxing</h3>
<p class="text-gray-500 text-sm mb-3">Every command runs in an isolated execution environment, never touching what it shouldn't.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Preview Before Execute</h3>
<p class="text-gray-500 text-sm mb-3">See the full command list before anything runs. No surprises, no accidents.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Atomic Rollbacks</h3>
<p class="text-gray-500 text-sm mb-3">Made a mistake? Undo any change instantly with a single keystroke.</p>
<h3 class="font-semibold text-white mb-1 text-sm">Full Audit Logs</h3>
<p class="text-gray-500 text-sm mb-3">Complete command history with timestamps, user, and output for every action.</p>
<h3 class="font-semibold text-white mb-1 text-sm">The CX Promise</h3>
<p class="text-gray-500 text-sm">CX will never run a command without your explicit approval. Every action is sandboxed, previewed, and reversible. If our cloud-powered Pro plan doesn't save you time in your first 14 days, we'll refund every dollar.</p>
</section>
<section class="mb-12">
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">Simple Transparent Pricing</h2>
<p class="text-gray-400">Start free, scale as you grow. All paid plans include a 14-day free trial. <a href="/pricing" class="text-[#00FF9F] hover:underline">Compare CX Linux plans</a>.</p>
</section>
<section class="mb-12">
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">Take back your weekends.</h2>
<p class="text-gray-400 mb-4">Stop typing the same commands at 2am. Let CX handle the toil so you can focus on the work that actually moves things forward.</p>
<pre class="text-[#00FF9F] text-xs sm:text-[13px] mb-3"><code>${INSTALL_COMMAND}</code></pre>
<h3 class="font-semibold text-white mb-1 text-sm">Why is curl | bash safe here?</h3>
<p class="text-gray-500 text-sm mb-3">Script is served over HTTPS from cxlinux.com. Binary signature is verified before install. You can inspect the script before running it.</p>
<p class="text-gray-500 text-sm">Free forever for personal use. No credit card required. Cancel anytime. Prefer not to pipe? <a href="/getting-started" class="text-[#00FF9F] hover:underline">See manual install</a>.</p>
</section>
<section>
<h2 class="text-2xl md:text-3xl font-bold mb-3 text-white">Join the CX community</h2>
<p class="text-gray-400 mb-4">Thousands of Linux engineers sharing configs, asking questions, building together, and making CX better every day.</p>
<p class="text-gray-500 text-sm mb-2"><a href="https://discord.gg/q4FUyBW6z" class="text-[#00FF9F] hover:underline">CX Linux on Discord</a>: Ask questions, share configs, get help from real engineers.</p>
<p class="text-gray-500 text-sm mb-2"><a href="https://reddit.com/r/cxlinux" class="text-[#00FF9F] hover:underline">r/cxlinux on Reddit</a>: Longer threads, war stories, and community showcases.</p>
<p class="text-sm"><a href="/about" class="text-[#00FF9F] hover:underline">About CX Linux</a></p>
</section>
</div>`;

const EMPTY_ROOT = /<div id="root"><\/div>/;

/**
 * Insert route-specific server-rendered markup into the SPA shell's empty `#root`.
 * Returns the HTML unchanged for routes without prerendered content, or when the shell has
 * no empty root (already injected, or markup changed).
 */
export function injectPrerender(html: string, pathname: string): string {
  if (pathname !== "/") {
    return html;
  }
  if (!EMPTY_ROOT.test(html)) {
    return html;
  }
  return html.replace(EMPTY_ROOT, `<div id="root">${HOME_PRERENDER_HTML}</div>`);
}
