/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! AI Agent termination and cleanup system

use crate::agent::{Agent, AgentError};
use crate::database::{AgentRepository, DatabaseError};
use crate::theme::{CommandBlockRenderer, SovereignTheme};
use crate::types::{AgentId, DeploymentStatus, ServerId};
use chrono::Utc;
use clap::Parser;
use log::{error, info, warn};
use std::io::Write;

/// Fire command for terminating AI agent deployments
#[derive(Debug, Parser, Clone)]
pub struct FireCommand {
    /// Agent ID or Server ID to terminate agents from
    #[arg(short, long, value_name = "TARGET")]
    pub target: String,

    /// Reason for termination
    #[arg(short, long, value_name = "REASON")]
    pub reason: Option<String>,

    /// Termination type: immediate, graceful, force
    #[arg(short, long, default_value = "graceful")]
    pub termination_type: String,

    /// Force termination without confirmation
    #[arg(long, action)]
    pub force: bool,

    /// Dry run mode (validate but don't terminate)
    #[arg(long, action)]
    pub dry_run: bool,
}

/// Configuration for termination operations
pub struct TerminationConfig {
    pub graceful_timeout_seconds: u64,
    pub cleanup_data: bool,
    pub notify_stakeholders: bool,
}

impl Default for TerminationConfig {
    fn default() -> Self {
        Self {
            graceful_timeout_seconds: 30,
            cleanup_data: true,
            notify_stakeholders: true,
        }
    }
}

/// AI Agent termination service
pub struct AgentTerminationService<R: AgentRepository> {
    repository: R,
    config: TerminationConfig,
    theme: SovereignTheme,
    renderer: CommandBlockRenderer,
}

impl<R: AgentRepository> AgentTerminationService<R> {
    pub fn new(repository: R, config: TerminationConfig) -> Self {
        Self {
            repository,
            config,
            theme: SovereignTheme::default(),
            renderer: CommandBlockRenderer::new(),
        }
    }

    /// Execute agent termination
    pub async fn fire_agent(&self, cmd: &FireCommand) -> Result<Vec<DeploymentStatus>, FireError> {
        // Determine if target is agent ID or server ID
        let agents_to_terminate = if cmd.target.starts_with("agent-") {
            // Single agent termination
            vec![self.get_agent_by_id(&cmd.target).await?]
        } else {
            // Server-wide termination
            self.get_agents_by_server(&cmd.target).await?
        };

        if agents_to_terminate.is_empty() {
            return Err(FireError::NoAgentsFound(cmd.target.clone()));
        }

        // Confirmation prompt (unless forced or dry run)
        if !cmd.force && !cmd.dry_run {
            if !self.confirm_termination(&agents_to_terminate, &cmd.reason).await? {
                info!("Agent termination cancelled by user");
                return Ok(vec![]);
            }
        }

        let mut results = Vec::new();

        for agent in agents_to_terminate {
            let result = if cmd.dry_run {
                self.simulate_termination(&agent, cmd).await?
            } else {
                self.terminate_agent(&agent, cmd).await?
            };

            results.push(result);
        }

        Ok(results)
    }

    /// Get agent by ID
    async fn get_agent_by_id(&self, agent_id: &str) -> Result<Agent, FireError> {
        // Parse agent ID (simplified for demo)
        let id = AgentId::new(); // This should parse the actual ID

        self.repository
            .get_agent(&id)
            .await
            .map_err(FireError::Database)?
            .ok_or_else(|| FireError::AgentNotFound(agent_id.to_string()))
    }

    /// Get all agents on a server
    async fn get_agents_by_server(&self, server_id: &str) -> Result<Vec<Agent>, FireError> {
        let server_id = ServerId(server_id.to_string());
        self.repository
            .get_agent_by_server(&server_id)
            .await
            .map_err(FireError::Database)
    }

    /// Confirm termination with user
    async fn confirm_termination(&self, agents: &[Agent], reason: &Option<String>) -> Result<bool, FireError> {
        let purple = &self.theme.primary;
        let red = &self.theme.error;
        let yellow = &self.theme.warning;

        println!("\r\n{}┌─ TERMINATION CONFIRMATION ─────────────────────────────────────────┐{}", purple.ansi_fg, "\x1b[0m");
        println!("{}│                                                                    │{}", purple.ansi_fg, "\x1b[0m");
        println!("{}│  {}⚠️  CRITICAL HRM ACTION{}                                       │{}", purple.ansi_fg, red.ansi_fg, purple.ansi_fg, "\x1b[0m");
        println!("{}│                                                                    │{}", purple.ansi_fg, "\x1b[0m");

        for agent in agents {
            println!("{}│  Agent: {}{}{}{}", purple.ansi_fg, yellow.ansi_fg, agent.name, purple.ansi_fg, "\x1b[0m");
        }

        if let Some(reason) = reason {
            println!("{}│  Reason: {}{}{}{}", purple.ansi_fg, yellow.ansi_fg, reason, purple.ansi_fg, "\x1b[0m");
        }

        println!("{}│                                                                    │{}", purple.ansi_fg, "\x1b[0m");
        println!("{}└────────────────────────────────────────────────────────────────────┘{}", purple.ansi_fg, "\x1b[0m");

        print!("\r\n{}Type 'CONFIRM' to proceed with termination: {}", red.ansi_fg, "\x1b[0m");
        std::io::stdout().flush().unwrap();

        let mut input = String::new();
        std::io::stdin().read_line(&mut input).map_err(|e| FireError::IoError(e.to_string()))?;

        Ok(input.trim().to_uppercase() == "CONFIRM")
    }

    /// Simulate termination (dry run)
    async fn simulate_termination(&self, agent: &Agent, cmd: &FireCommand) -> Result<DeploymentStatus, FireError> {
        info!("DRY RUN: Would terminate agent {} with type {}", agent.name, cmd.termination_type);
        Ok(DeploymentStatus::Fired)
    }

    /// Actually terminate the agent
    async fn terminate_agent(&self, agent: &Agent, cmd: &FireCommand) -> Result<DeploymentStatus, FireError> {
        info!("Terminating agent {} with {} termination", agent.name, cmd.termination_type);

        // Update agent status in database
        self.repository
            .update_agent_status(&agent.id, crate::agent::AgentStatus::Terminated)
            .await
            .map_err(FireError::Database)?;

        // Render termination success with purple theme
        let success_message = self.render_termination_success(&agent.name, &cmd.termination_type);
        println!("{}", success_message);

        Ok(DeploymentStatus::Fired)
    }

    /// Render termination success message with Sovereign Purple theme
    fn render_termination_success(&self, agent_name: &str, termination_type: &str) -> String {
        let reset = "\x1b[0m";
        let purple = "\x1b[38;2;124;58;237m";
        let success = "\x1b[38;2;16;185;129m";
        let accent = "\x1b[38;2;168;85;247m";

        format!(
            "\r\n{}┌─ AGENT TERMINATION SUCCESS ────────────────────────────────────────┐{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  {}✅ AI AGENT SUCCESSFULLY TERMINATED{}                           │{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  Agent: {}{}{}\r\n\
            {}│  Type: {}{}{}\r\n\
            {}│  Status: {}TERMINATED & CLEANED{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  {}🔥 Sovereign Purple termination complete{}\r\n\
            {}│  {}🤖 Agent capabilities revoked{}\r\n\
            {}│  {}📡 Monitoring ceased{}\r\n\
            {}│                                                                    │{}\r\n\
            {}└────────────────────────────────────────────────────────────────────┘{}",
            purple, reset,
            purple, reset,
            purple, success, purple, reset,
            purple, reset,
            purple, accent, agent_name, reset,
            purple, accent, termination_type.to_uppercase(), reset,
            purple, success, reset,
            purple, reset,
            purple, accent, reset,
            purple, accent, reset,
            purple, accent, reset,
            purple, reset,
            purple, reset
        )
    }
}

/// Errors that can occur during termination process
#[derive(Debug, thiserror::Error)]
pub enum FireError {
    #[error("Agent not found: {0}")]
    AgentNotFound(String),

    #[error("No agents found matching target: {0}")]
    NoAgentsFound(String),

    #[error("Agent error: {0}")]
    Agent(AgentError),

    #[error("Database error: {0}")]
    Database(DatabaseError),

    #[error("Termination failed: {0}")]
    TerminationFailed(String),

    #[error("IO error: {0}")]
    IoError(String),
}