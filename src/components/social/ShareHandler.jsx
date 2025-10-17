import { useShareHandler } from '../../hooks/useShareHandler';

/**
 * ShareHandler Component - Handles URL parameters
 * Must be inside Router context to use useLocation
 */
export default function ShareHandler() {
  // This will process URL parameters and trigger modals
  useShareHandler();

  // This component doesn't render anything
  return null;
}
