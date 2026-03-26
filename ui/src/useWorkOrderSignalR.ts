import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5138';

export function useWorkOrderSignalR(onWorkOrderChanged: () => void) {
  const callbackRef = useRef(onWorkOrderChanged);
  callbackRef.current = onWorkOrderChanged;

  useEffect(() => {
    let cancelled = false;

    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/workorders`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('WorkOrderChanged', () => {
      callbackRef.current();
    });

    connection.start().catch(err => {
      if (!cancelled) {
        console.error('SignalR connection failed:', err);
      }
    });

    return () => {
      cancelled = true;
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop();
      }
    };
  }, []);
}
