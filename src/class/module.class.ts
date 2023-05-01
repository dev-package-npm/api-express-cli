import { Mixin } from 'ts-mixer';
import { Database } from './modules/database/database';
import { Websocket } from './modules/ws/websocket';


export class Module extends Mixin(Database, Websocket) {
}