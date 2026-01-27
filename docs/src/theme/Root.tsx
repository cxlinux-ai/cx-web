/**
 * Root Theme Wrapper
 *
 * Wraps all pages to include global components like the AI Assistant.
 * This is the standard Docusaurus pattern for adding persistent UI elements.
 */

import React from 'react';
import AIAssistant from '@site/src/components/AIAssistant';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): JSX.Element {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  );
}
