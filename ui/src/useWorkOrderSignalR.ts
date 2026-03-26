import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5138';

export function useWorkOrderSignalR(onWorkOrderChanged: () => void) {
  const callbackRef = useRef(onWorkOrderChanged);
  callbackRef.current = onWorkOrderChanged;

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/workorders`)
      .withAutomaticReconnect()
      .build();

    connection.on('WorkOrderChanged', () => {
      callbackRef.current();
    });

    connection.start().catch(err => console.error('SignalR connection failed:', err));

    return () => {
      if (connection.state !== HubConnectionState.Disconnected) {
        connection.stop();
      }
    };
  }, []);
}
