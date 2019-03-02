import * as express from 'express';

export class Server {

    //--------------------------------------------------
    // Private
    //--------------------------------------------------
    private readonly _app: express.Application;
    private readonly _config: ServerConfig



    //--------------------------------------------------
    // PUBLIC
    //--------------------------------------------------
    public constructor(config: ServerConfig) {
        this._app = express();
        this._config = config;
    }



    /**
     * Start the server
     */
    public async start(): Promise<void> {

        this.initMiddleware();

        return new Promise<void>((resolve, reject) => {
            this._app.listen(this._config.port, () => {
                console.log(`Listening on port ${this._config.port}`);
                console.log(this._config);
            })
        });
    }

    //--------------------------------------------------
    // PRIVATE
    //--------------------------------------------------
    private initMiddleware(): void {

        this._app.use((request, res, next) => {
            console.log(request.path);
            next();
        });

        (this._config.staticPaths || []).forEach(staticPath => {
            this._app.use(staticPath.route, express.static(staticPath.physicalPath, {
                fallthrough: true,
                redirect: false,
            }));
        });


    }
}

export type ServerConfig = {
    port: number;
    staticPaths: StaticPath[];
}

export type StaticPath = {
    physicalPath: string;
    route: string | RegExp;
}