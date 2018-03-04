import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/map';
import "rxjs/add/observable/timer";
import "rxjs/add/operator/timestamp";
import {watch} from 'chokidar';
import {readFileSync} from 'fs';
import {join} from "path";
import {homedir} from "os";

@WebSocketGateway()
export class EventsGateway {

    directory       = join(homedir(), 'Saved Games', 'Frontier Developments', 'Elite Dangerous');
    fileName        = 'Status.json';
    statusJSONPath  = join(this.directory, this.fileName);

    @WebSocketServer() server;

    @SubscribeMessage('events')
    onEvent(client, data): Observable<WsResponse<any>> {
        const event = 'events';
        const watcher =
            Observable.fromEvent(
                watch(this.statusJSONPath, { awaitWriteFinish: { stabilityThreshold: 10 } }),
                'change'
            );

        return watcher.map((filename, index) => {
            return {event, data: JSON.parse(readFileSync(this.statusJSONPath, "utf8"))};
        });
    }
}
