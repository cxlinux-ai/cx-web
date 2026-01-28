/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! AI Agent management and deployment

use crate::types::{AgentId, AgentType, DeploymentStatus, ServerId};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// AI Agent representation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub id: AgentId,
    pub name: String,
    pub agent_type: AgentType,
    pub capabilities: Vec<String>,
    pub deployed_to: Option<ServerId>,
    pub status: AgentStatus,
    pub created_at: DateTime<Utc>,
    pub last_activity: Option<DateTime<Utc>>,
    pub metadata: HashMap<String, String>,
}

impl Agent {
    /// Create a new agent with specified type and capabilities
    pub fn new(name: String, agent_type: AgentType, capabilities: Vec<String>) -> Self {
        Self {
            id: AgentId::new(),
            name,
            agent_type,
            capabilities,
            deployed_to: None,
            status: AgentStatus::Available,
            created_at: Utc::now(),
            last_activity: None,
            metadata: HashMap::new(),
        }
    }

    /// Deploy agent to a specific server
    pub fn deploy_to(&mut self, server_id: ServerId) -> Result<(), AgentError> {
        if self.status != AgentStatus::Available {
            return Err(AgentError::NotAvailable(self.id.clone()));
        }

        self.deployed_to = Some(server_id);
        self.status = AgentStatus::Deployed;
        self.last_activity = Some(Utc::now());

        Ok(())
    }

    /// Terminate agent deployment
    pub fn terminate(&mut self) -> Result<(), AgentError> {
        if self.status != AgentStatus::Deployed {
            return Err(AgentError::NotDeployed(self.id.clone()));
        }

        self.deployed_to = None;
        self.status = AgentStatus::Terminated;
        self.last_activity = Some(Utc::now());

        Ok(())
    }

    /// Check if agent is available for deployment
    pub fn is_available(&self) -> bool {
        self.status == AgentStatus::Available
    }

    /// Check if agent is currently deployed
    pub fn is_deployed(&self) -> bool {
        self.status == AgentStatus::Deployed
    }
}

/// Agent deployment status
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum AgentStatus {
    /// Agent is available for deployment
    Available,
    /// Agent is currently deployed to a server
    Deployed,
    /// Agent deployment is in progress
    Deploying,
    /// Agent has been terminated
    Terminated,
    /// Agent encountered an error
    Error(String),
}

/// Agent deployment configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentDeployment {
    pub agent_id: AgentId,
    pub server_id: ServerId,
    pub deployment_config: DeploymentConfig,
    pub status: DeploymentStatus,
    pub deployed_at: Option<DateTime<Utc>>,
    pub last_heartbeat: Option<DateTime<Utc>>,
}

/// Configuration for agent deployment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeploymentConfig {
    /// Maximum CPU usage allowed for the agent (0.0-1.0)
    pub max_cpu_usage: f64,
    /// Maximum memory usage in MB
    pub max_memory_mb: u64,
    /// Heartbeat interval in seconds
    pub heartbeat_interval: u64,
    /// Auto-restart on failure
    pub auto_restart: bool,
    /// Environment variables for the agent
    pub env_vars: HashMap<String, String>,
}

impl Default for DeploymentConfig {
    fn default() -> Self {
        Self {
            max_cpu_usage: 0.5, // 50% CPU max
            max_memory_mb: 512,  // 512MB max
            heartbeat_interval: 30, // 30 seconds
            auto_restart: true,
            env_vars: HashMap::new(),
        }
    }
}

/// Errors that can occur during agent operations
#[derive(Debug, thiserror::Error)]
pub enum AgentError {
    #[error("Agent {0} is not available for deployment")]
    NotAvailable(AgentId),

    #[error("Agent {0} is not currently deployed")]
    NotDeployed(AgentId),

    #[error("Server {0} is not accessible")]
    ServerUnavailable(ServerId),

    #[error("Agent deployment failed: {0}")]
    DeploymentFailed(String),

    #[error("Database error: {0}")]
    Database(String),
}