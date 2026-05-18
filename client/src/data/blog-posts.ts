export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // markdown-ish HTML
  author: string;
  date: string; // ISO
  readTime: string;
  tags: string[];
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "what-is-cx-linux",
    title: "What Is CX Linux? The AI Layer That Changes How You Use Linux",
    excerpt: "CX Linux is not just another distro, it's an AI layer that sits on top of any Debian/Ubuntu system and lets you control Linux with natural language. Here's how it works and why it matters.",
    content: `
<p>If you've ever spent hours searching Stack Overflow for the right command, configuring nginx for the tenth time, or debugging a failed deployment, you know the pain. Linux is powerful, but the learning curve is steep.</p>

<h2>CX Linux: Intent-Based Computing</h2>
<p>CX Linux introduces a fundamentally new way to interact with your system. Instead of memorizing commands, you simply describe what you want:</p>

<pre><code>cx "set up a secure nginx reverse proxy for my Node.js app on port 3000"</code></pre>

<p>CX analyzes your system state, generates the right commands, shows you a preview, and executes them only after your approval. Every action runs in a sandbox with instant rollback.</p>

<h2>Not a Chatbot, An OS Layer</h2>
<p>Unlike terminal wrappers or AI coding tools, CX operates at the OS level. It has full awareness of your hardware, installed packages, running services, and system configuration. This means it can:</p>

<ul>
<li><strong>Detect conflicts</strong> before they happen</li>
<li><strong>Optimize for your hardware</strong> (GPU, RAM, storage)</li>
<li><strong>Chain multi-step operations</strong> into reliable workflows</li>
<li><strong>Roll back changes</strong> if something goes wrong</li>
</ul>

<h2>Who Is CX For?</h2>
<p>CX is built for developers, sysadmins, DevOps engineers, and anyone who works with Linux daily. Whether you're managing a single development machine or a fleet of production servers, CX reduces the friction between what you want to do and getting it done.</p>

<h2>Getting Started</h2>
<p>CX installs in under 5 minutes on any Debian or Ubuntu-based system. The free Community edition gives you local LLM support and full CLI access. Paid plans add cloud LLMs, web console, and enterprise features.</p>

<p><a href="/getting-started">Get started with CX Linux →</a></p>
    `,
    author: "CX Linux Team",
    date: "2026-03-10",
    readTime: "4 min read",
    tags: ["introduction", "AI", "Linux"],
  },
  {
    slug: "linux-tasks-30-seconds-with-cx",
    title: "5 Linux Tasks That Take 30 Minutes, Done in 30 Seconds with CX",
    excerpt: "Setting up nginx, configuring firewalls, deploying Docker stacks, these routine tasks eat hours. Here's how CX Linux turns each one into a single natural language command.",
    content: `
<p>Every sysadmin knows the drill. You need to set up a reverse proxy, so you open three browser tabs, one for the nginx docs, one for Stack Overflow, one for that blog post you bookmarked six months ago. Forty-five minutes later, you've got a working config. Maybe.</p>

<p>CX Linux changes this equation entirely. Here are five real tasks that used to take 30+ minutes, now done in under 30 seconds.</p>

<h2>1. Set Up an Nginx Reverse Proxy with SSL</h2>
<p><strong>The old way:</strong> Install nginx, write the config, install certbot, generate certificates, configure renewal, test, debug, restart.</p>

<pre><code>cx "set up nginx as a reverse proxy for my Node.js app on port 3000 with SSL using Let's Encrypt for myapp.com"</code></pre>

<p>CX detects your system state, installs what's needed, generates the config, obtains the SSL certificate, and sets up auto-renewal. You review the commands, approve, and it's done.</p>

<h2>2. Harden SSH and Configure a Firewall</h2>
<p><strong>The old way:</strong> Edit sshd_config (hope you don't lock yourself out), install ufw or iptables, figure out which ports to open, test from another machine.</p>

<pre><code>cx "harden SSH, disable root login, use key-only auth, change port to 2222, and set up ufw allowing only SSH, HTTP, and HTTPS"</code></pre>

<p>CX handles the full sequence: backup current config, apply changes, configure firewall rules, verify you won't lose access, and create a rollback point.</p>

<h2>3. Deploy a Full Docker Stack</h2>
<p><strong>The old way:</strong> Install Docker, write docker-compose.yml, configure volumes, set up networking, figure out environment variables, debug port conflicts.</p>

<pre><code>cx "deploy a production Docker stack with PostgreSQL, Redis, and my app from the Dockerfile in ./app, expose the app on port 443 with Traefik as reverse proxy"</code></pre>

<p>CX generates the compose file, configures Traefik with automatic SSL, sets up persistent volumes, and handles the networking. All previewed before execution.</p>

<h2>4. Set Up Automated Backups to S3</h2>
<p><strong>The old way:</strong> Write a bash script, configure AWS CLI, set up cron jobs, test restoration, hope you didn't forget anything.</p>

<pre><code>cx "set up daily backups of /var/www and my PostgreSQL databases to S3 bucket my-backups, keep 30 days retention, encrypt at rest, notify me on failure"</code></pre>

<p>CX creates the backup scripts, configures encryption, sets up the cron schedule, and even includes a test restoration step to verify everything works.</p>

<h2>5. Monitor System Health with Alerts</h2>
<p><strong>The old way:</strong> Install Prometheus, configure exporters, set up Grafana, write alert rules, configure notification channels.</p>

<pre><code>cx "monitor CPU, memory, disk, and my nginx service, alert me via email if CPU > 80%, disk > 90%, or nginx goes down"</code></pre>

<p>CX sets up lightweight monitoring with sensible defaults, configures alerts, and gives you a dashboard, without the complexity of a full observability stack.</p>

<h2>The Common Thread</h2>
<p>Every one of these tasks involves the same pattern: research → configure → test → debug → repeat. CX collapses this into describe → review → approve. The AI handles the research and configuration. You keep full control with command preview and instant rollback.</p>

<p>This is what we mean by intent-based computing. You declare what you want. CX figures out how to get there.</p>

<p><a href="/getting-started">Try CX Linux →</a></p>
    `,
    author: "CX Linux Team",
    date: "2026-03-11",
    readTime: "4 min read",
    tags: ["tutorial", "productivity", "DevOps"],
  },
  {
    slug: "sandboxed-execution-linux-safety",
    title: "How CX Linux Keeps Your System Safe with Sandboxed Execution",
    excerpt: "Running AI-generated commands on your system sounds scary. Here's how CX Linux uses sandboxing, previews, and rollback to ensure nothing breaks.",
    content: `
<p>The #1 concern people have about AI-powered system administration is safety. "What if it runs <code>rm -rf /</code>?" It's a valid question, and CX Linux has a comprehensive answer.</p>

<h2>The Three Safety Layers</h2>

<h3>Layer 1: Command Preview</h3>
<p>Every command CX generates is shown to you before execution. You see exactly what will run, on which files, with what permissions. Nothing executes without explicit approval.</p>

<h3>Layer 2: Sandboxed Execution</h3>
<p>When you approve a command, it runs inside an isolated Firejail container. This means:</p>
<ul>
<li>Limited filesystem access, only the directories needed</li>
<li>Restricted network access when not required</li>
<li>Process isolation from the rest of your system</li>
<li>Automatic timeout for runaway processes</li>
</ul>

<h3>Layer 3: Instant Rollback</h3>
<p>Before any system modification, CX creates a snapshot. If something goes wrong, or you simply change your mind, one command rolls back to the previous state:</p>

<pre><code>cx rollback</code></pre>

<h2>Dangerous Command Blocking</h2>
<p>CX maintains a blocklist of destructive patterns. Commands that could wipe data, modify boot sectors, or disable security features are flagged and require additional confirmation with explicit acknowledgment of the risks.</p>

<h2>Open Source Transparency</h2>
<p>Our security model is fully open source. You can audit every line of code that touches your system. We believe security through obscurity is no security at all.</p>

<p><a href="/faq">Read more about CX Linux security →</a></p>
    `,
    author: "CX Linux Team",
    date: "2026-03-08",
    readTime: "5 min read",
    tags: ["security", "sandboxing", "safety"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
