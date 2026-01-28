/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! Core types for HRM AI agent deployment system

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

/// Unique identifier for servers in the deployment system
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct ServerId(pub String);

impl fmt::Display for ServerId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl From<String> for ServerId {
    fn from(id: String) -> Self {
        ServerId(id)
    }
}

/// Unique identifier for AI agents
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct AgentId(pub Uuid);

impl fmt::Display for AgentId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl AgentId {
    pub fn new() -> Self {
        AgentId(Uuid::new_v4())
    }
}

/// Result of an agent deployment operation
#[derive(Debug, Serialize, Deserialize)]
pub struct DeploymentResult {
    pub agent_id: AgentId,
    pub server_id: ServerId,
    pub status: DeploymentStatus,
    pub deployment_time: DateTime<Utc>,
    pub message: String,
}

/// Status of an agent deployment
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum DeploymentStatus {
    /// Agent successfully deployed and active
    Hired,
    /// Agent deployment in progress
    Deploying,
    /// Agent deployment failed
    Failed,
    /// Agent terminated/removed
    Fired,
}

impl fmt::Display for DeploymentStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DeploymentStatus::Hired => write!(f, "HIRED"),
            DeploymentStatus::Deploying => write!(f, "DEPLOYING"),
            DeploymentStatus::Failed => write!(f, "FAILED"),
            DeploymentStatus::Fired => write!(f, "FIRED"),
        }
    }
}

/// AI Agent type and capabilities
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AgentType {
    /// System administration agent
    SysAdmin,
    /// DevOps automation agent
    DevOps,
    /// Security monitoring agent
    Security,
    /// Database management agent
    Database,
    /// Network management agent
    Network,
    /// Custom agent with specified capabilities
    Custom(String),
}

impl fmt::Display for AgentType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AgentType::SysAdmin => write!(f, "SysAdmin"),
            AgentType::DevOps => write!(f, "DevOps"),
            AgentType::Security => write!(f, "Security"),
            AgentType::Database => write!(f, "Database"),
            AgentType::Network => write!(f, "Network"),
            AgentType::Custom(name) => write!(f, "Custom({})", name),
        }
    }
}