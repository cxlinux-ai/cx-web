/*!
 * Copyright (c) 2026 AI Venture Holdings LLC
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

//! Sovereign Purple theming system for HRM AI

use std::fmt;
use termcolor::{Color, ColorSpec, WriteColor};

/// Sovereign Purple theme colors for premium branding
#[derive(Debug, Clone)]
pub struct SovereignTheme {
    /// Primary Sovereign Purple (#7C3AED)
    pub primary: ThemeColor,
    /// Light Purple accent (#A855F7)
    pub accent: ThemeColor,
    /// Dark Purple for backgrounds (#5B21B6)
    pub dark: ThemeColor,
    /// Success green (#10B981)
    pub success: ThemeColor,
    /// Warning amber (#F59E0B)
    pub warning: ThemeColor,
    /// Error red (#EF4444)
    pub error: ThemeColor,
    /// Neutral gray (#6B7280)
    pub neutral: ThemeColor,
}

impl Default for SovereignTheme {
    fn default() -> Self {
        Self {
            primary: ThemeColor::from_hex("#7C3AED"),   // Sovereign Purple
            accent: ThemeColor::from_hex("#A855F7"),    // Light Purple
            dark: ThemeColor::from_hex("#5B21B6"),      // Dark Purple
            success: ThemeColor::from_hex("#10B981"),   // Success Green
            warning: ThemeColor::from_hex("#F59E0B"),   // Warning Amber
            error: ThemeColor::from_hex("#EF4444"),     // Error Red
            neutral: ThemeColor::from_hex("#6B7280"),   // Neutral Gray
        }
    }
}

/// Theme color with RGB values and terminal formatting
#[derive(Debug, Clone)]
pub struct ThemeColor {
    pub hex: String,
    pub rgb: (u8, u8, u8),
    pub ansi_fg: String,
    pub ansi_bg: String,
}

impl ThemeColor {
    /// Create a theme color from hex string
    pub fn from_hex(hex: &str) -> Self {
        let hex_clean = hex.trim_start_matches('#');
        let rgb = hex_to_rgb(hex_clean).unwrap_or((0, 0, 0));

        Self {
            hex: hex.to_string(),
            rgb,
            ansi_fg: format!("\x1b[38;2;{};{};{}m", rgb.0, rgb.1, rgb.2),
            ansi_bg: format!("\x1b[48;2;{};{};{}m", rgb.0, rgb.1, rgb.2),
        }
    }

    /// Get termcolor ColorSpec for this color
    pub fn to_color_spec(&self, background: bool) -> ColorSpec {
        let mut spec = ColorSpec::new();
        let color = Color::Rgb(self.rgb.0, self.rgb.1, self.rgb.2);

        if background {
            spec.set_bg(Some(color));
        } else {
            spec.set_fg(Some(color));
        }

        spec
    }

    /// Create a styled text string with this color
    pub fn style_text(&self, text: &str, bold: bool) -> String {
        let bold_code = if bold { "\x1b[1m" } else { "" };
        let reset = "\x1b[0m";
        format!("{}{}{}{}", bold_code, self.ansi_fg, text, reset)
    }

    /// Create a background styled text string
    pub fn style_bg_text(&self, text: &str, fg_color: &ThemeColor) -> String {
        let reset = "\x1b[0m";
        format!("{}{}{}{}", self.ansi_bg, fg_color.ansi_fg, text, reset)
    }
}

/// Render premium command blocks with Sovereign Purple glow effect
pub struct CommandBlockRenderer {
    theme: SovereignTheme,
}

impl CommandBlockRenderer {
    pub fn new() -> Self {
        Self {
            theme: SovereignTheme::default(),
        }
    }

    /// Render a command block header with purple glow
    pub fn render_header(&self, title: &str) -> String {
        let purple = &self.theme.primary;
        let white = ThemeColor::from_hex("#FFFFFF");

        format!("{}{}╭─────────────────────────────────────────────────────────────────────╮{}\r\n{}{}│{} {} {}│{}\r\n{}{}╰─────────────────────────────────────────────────────────────────────╯{}",
            purple.ansi_bg, white.ansi_fg, "\x1b[0m",
            purple.ansi_bg, white.ansi_fg, " ".repeat(15), title, " ".repeat(15), "\x1b[0m",
            purple.ansi_bg, white.ansi_fg, "\x1b[0m"
        )
    }

    /// Render agent activation success with purple glow
    pub fn render_agent_activation(&self, agent_name: &str, server_id: &str) -> String {
        let reset = "\x1b[0m";
        let purple = "\x1b[38;2;124;58;237m";
        let success = "\x1b[38;2;16;185;129m";
        let accent = "\x1b[38;2;168;85;247m";

        format!(
            "\r\n{}┌─ AGENT ACTIVATION SUCCESS ─────────────────────────────────────────┐{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  {}✅ AI AGENT SUCCESSFULLY HIRED{}                                │{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  Agent: {}{}{}\r\n\
            {}│  Server: {}{}{}\r\n\
            {}│  Status: {}ACTIVE & MONITORING{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  {}🔥 Sovereign Purple glow activated{}\r\n\
            {}│  {}🤖 Premium AI capabilities enabled{}\r\n\
            {}│  {}📡 Real-time monitoring initiated{}\r\n\
            {}│                                                                    │{}\r\n\
            {}└────────────────────────────────────────────────────────────────────┘{}",
            purple, reset,
            purple, reset,
            purple, success, purple, reset,
            purple, reset,
            purple, accent, agent_name, reset,
            purple, accent, server_id, reset,
            purple, success, reset,
            purple, reset,
            purple, accent, reset,
            purple, accent, reset,
            purple, accent, reset,
            purple, reset,
            purple, reset
        )
    }

    /// Render error message with purple border
    pub fn render_error(&self, error: &str) -> String {
        let reset = "\x1b[0m";
        let purple = "\x1b[38;2;124;58;237m";
        let error_color = "\x1b[38;2;239;68;68m";

        format!(
            "\r\n{}┌─ DEPLOYMENT ERROR ─────────────────────────────────────────────────┐{}\r\n\
            {}│                                                                    │{}\r\n\
            {}│  {}❌ {}{}\r\n\
            {}│                                                                    │{}\r\n\
            {}└────────────────────────────────────────────────────────────────────┘{}",
            purple, reset,
            purple, reset,
            purple, error_color, error, reset,
            purple, reset,
            purple, reset
        )
    }
}

impl Default for CommandBlockRenderer {
    fn default() -> Self {
        Self::new()
    }
}

/// Convert hex string to RGB tuple
fn hex_to_rgb(hex: &str) -> Result<(u8, u8, u8), Box<dyn std::error::Error>> {
    if hex.len() != 6 {
        return Err("Hex color must be 6 characters".into());
    }

    let r = u8::from_str_radix(&hex[0..2], 16)?;
    let g = u8::from_str_radix(&hex[2..4], 16)?;
    let b = u8::from_str_radix(&hex[4..6], 16)?;

    Ok((r, g, b))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hex_to_rgb() {
        assert_eq!(hex_to_rgb("7C3AED").unwrap(), (124, 58, 237));
        assert_eq!(hex_to_rgb("FFFFFF").unwrap(), (255, 255, 255));
        assert_eq!(hex_to_rgb("000000").unwrap(), (0, 0, 0));
    }

    #[test]
    fn test_theme_color_creation() {
        let color = ThemeColor::from_hex("#7C3AED");
        assert_eq!(color.hex, "#7C3AED");
        assert_eq!(color.rgb, (124, 58, 237));
    }
}