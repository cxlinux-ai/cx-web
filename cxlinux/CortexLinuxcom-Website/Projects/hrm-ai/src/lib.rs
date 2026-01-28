/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! HRM AI - Premium Human Resource Management with AI Agent Deployment
//!
//! This module provides AI-powered human resource management capabilities
//! including agent deployment, hiring workflows, and termination processing
//! with enterprise-grade security and compliance automation.

pub mod agent;
pub mod database;
pub mod hire;
pub mod fire;
pub mod theme;
pub mod types;

// Re-export main types for easy access
pub use agent::{Agent, AgentDeployment, AgentStatus};
pub use database::{DatabaseConnection, AgentRepository};
pub use hire::{HireCommand, HireConfig};
pub use fire::{FireCommand, TerminationConfig};
pub use theme::{SovereignTheme, ThemeColor};
pub use types::{ServerId, AgentId, DeploymentResult};

/// HRM AI module version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Sovereign Purple theme color for premium branding
pub const SOVEREIGN_PURPLE: &str = "#7C3AED";