import * as nPath from 'path';
import { Server } from './server';

const appProjectPath = nPath.join(__dirname, '../../app');

const server = new Server({
    port: 3000,
    staticPaths: [
        {
            physicalPath: nPath.join(appProjectPath, 'node_modules'),
            route: '/node_modules'
        },
        {
            physicalPath: nPath.join(appProjectPath, 'dist'),
            route: '/'
        }
    ]
})

server.start();