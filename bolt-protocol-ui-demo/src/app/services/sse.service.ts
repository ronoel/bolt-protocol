import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SseClientService {
  // Reconnect delay in milliseconds (adjust as needed)
  private reconnectInterval = 3000;

  constructor(private zone: NgZone) {}

  connect(address: string): Observable<any> {
    return new Observable(observer => {
      let eventSource: EventSource;
      let isStopped = false; // flag to stop reconnection attempts

      const connectSse = () => {
        if (isStopped) {
          return;
        }

        eventSource = new EventSource(`${environment.apiUrl}/sse/${address}`);

        eventSource.onmessage = (event) => {
          this.zone.run(() => {
            try {
              const data = JSON.parse(event.data);
              observer.next(data);
            } catch (error) {
              console.error('Error parsing SSE data', error);
            }
          });
        };

        eventSource.onerror = (error) => {
          this.zone.run(() => {
            if (!environment.production) {
              console.error('SSE error, attempting to reconnect...', error);
            }
            eventSource.close();
            // Reconnect after a delay, if not stopped.
            if (!isStopped) {
              setTimeout(() => {
                connectSse();
              }, this.reconnectInterval);
            }
          });
        };
      };

      // Start the initial connection.
      connectSse();

      // Teardown logic: stop reconnection and close the connection.
      return () => {
        isStopped = true;
        if (eventSource) {
          eventSource.close();
        }
      };
    });
  }
}
