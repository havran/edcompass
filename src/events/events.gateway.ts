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

@WebSocketGateway()
export class EventsGateway {

    @WebSocketServer() server;

    @SubscribeMessage('events')
    onEvent(client, data): Observable<WsResponse<any>> {
        const event = 'events';
        const watcher =
            Observable.fromEvent(
                watch(this.getStatusFilePath(), { awaitWriteFinish: { stabilityThreshold: 10 } }),
                'change'
            );

        return watcher.map((filename, index) => {
            return {event, data: JSON.parse(readFileSync(this.getStatusFilePath(), "utf8"))};
        });
    }

    getStatusFilePath(): string {
        return process.platform === 'win32' ?
            // On MS Windows...
            this.getUserHome() + "/Saved Games/Frontier Developments/Elite Dangerous/Status.json" :
            // On MAC... ToDo: this need change...
            this.getUserHome() + "/Saved Games/Frontier Developments/Elite Dangerous/Status.json";
    }

    getUserHome(): string {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }
}
